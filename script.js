const chatBox = document.getElementById("chatBox");
// ===============================
// SIMPLE HOMEPAGE CONVERTER
// ===============================

const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const resultDisplay = document.getElementById("result");
const swapBtn = document.getElementById("swapBtn");

// Static rates (can be replaced by Firebase later)
const GHS_TO_NGN = 120;
const NGN_TO_GHS = 1 / GHS_TO_NGN;

function convertCurrency() {
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    resultDisplay.textContent = "₦0.00";
    return;
  }

  let convertedAmount;
  let symbol = "";

  if (fromCurrency.value === "GHS" && toCurrency.value === "NGN") {
    convertedAmount = amount * GHS_TO_NGN;
    symbol = "₦";
  } else if (fromCurrency.value === "NGN" && toCurrency.value === "GHS") {
    convertedAmount = amount * NGN_TO_GHS;
    symbol = "₵";
  } else {
    convertedAmount = amount;
  }

  resultDisplay.textContent = symbol + convertedAmount.toFixed(2);
}

// Events
amountInput.addEventListener("input", convertCurrency);
fromCurrency.addEventListener("change", convertCurrency);
toCurrency.addEventListener("change", convertCurrency);

swapBtn.addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  convertCurrency();
});

function sendMessage() {
  const name = document.getElementById("name").value || "Customer";
  const message = document.getElementById("message").value;

  if (message.trim() === "") return;

  const div = document.createElement("div");
  div.className = "chat-message";
  div.innerHTML = `<span>${name}:</span> ${message}`;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("message").value = "";
}
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "XXXX",
    appId: "XXXX"
  };

  const app = initializeApp(firebaseConfig);
  window.auth = getAuth(app);
  window.db = getFirestore(app);
</script>
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.login = function () {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => window.location = "app.html")
    .catch(e => alert(e.message));
};

window.register = function () {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => window.location = "app.html")
    .catch(e => alert(e.message));
};
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const messages = document.getElementById("messages");
const q = query(collection(db, "chats"), orderBy("time"));

onSnapshot(q, snapshot => {
  messages.innerHTML = "";
  snapshot.forEach(doc => {
    messages.innerHTML += `<p>${doc.data().text}</p>`;
  });
  messages.scrollTop = messages.scrollHeight;
});

window.send = async function () {
  if (msg.value.trim() === "") return;

  await addDoc(collection(db, "chats"), {
    text: msg.value,
    time: serverTimestamp()
  });
  msg.value = "";
};
import {
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const rateRef = doc(db, "rates", "gh-ng");

onSnapshot(rateRef, snap => {
  if (snap.exists()) {
    rates.innerHTML = `
      <h3>Exchange Rates</h3>
      <p>1 GHS = ${snap.data().ghToNg} NGN</p>
      <p>1 NGN = ${snap.data().ngToGh} GHS</p>
    `;
  }
});

// ADMIN ONLY (run once)
setDoc(rateRef, {
  ghToNg: 120,
  ngToGh: 0.008
});
import { collection, addDoc, serverTimestamp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.sendRequest = async function () {
  await addDoc(collection(db, "transactions"), {
    amount: amount.value,
    currency: currency.value,
    status: "pending",
    time: serverTimestamp()
  });

  alert("Transaction request sent!");
};
import { collection, onSnapshot, updateDoc, doc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const requests = document.getElementById("requests");

onSnapshot(collection(db, "transactions"), snap => {
  requests.innerHTML = "";
  snap.forEach(d => {
    requests.innerHTML += `
      <p>
        ${d.data().amount} - ${d.data().currency} - ${d.data().status}
        <button onclick="approve('${d.id}')">Approve</button>
      </p>`;
  });
});

window.approve = async function (id) {
  await updateDoc(doc(db, "transactions", id), {
    status: "approved"
  });
};
function signup() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showMessage("Fill all fields");
    return;
  }

  if (localStorage.getItem(username)) {
    showMessage("User already exists");
    return;
  }

  const userData = {
    password,
    balanceGHS: 0,
    balanceNGN: 0,
    transactions: []
  };

  localStorage.setItem(username, JSON.stringify(userData));
  showMessage("Signup successful! You can login now.");
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const user = JSON.parse(localStorage.getItem(username));

  if (!user || user.password !== password) {
    showMessage("Invalid login details");
    return;
  }

  localStorage.setItem("currentUser", username);
  window.location.href = "dashboard.html";
}

function saveChat() {
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChat() {
  const savedChat = localStorage.getItem("chatHistory");
  if (savedChat) {
    chatBox.innerHTML = savedChat;
  }
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (message === "") return;

  const messageDiv = document.createElement("div");
  messageDiv.className = "message user";
  messageDiv.textContent = message;

  chatBox.appendChild(messageDiv);
  chatInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  saveChat();

  setTimeout(() => {
    const replyDiv = document.createElement("div");
    replyDiv.className = "message bot";
    replyDiv.textContent = "Message received. Support will reply shortly.";

    chatBox.appendChild(replyDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    saveChat();
  }, 700);
}

loadChat();
const user = localStorage.getItem("currentUser");

if (!user) {
  window.location.href = "index.html";
}

const rate = 120;
let userData = JSON.parse(localStorage.getItem(user));

function loadDashboard() {
  document.getElementById("ghsBalance").textContent = `₵${userData.balanceGHS.toFixed(2)}`;
  document.getElementById("ngnBalance").textContent = `₦${userData.balanceNGN.toFixed(2)}`;

  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  userData.transactions.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    list.appendChild(li);
  });
}

function exchange() {
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;

  if (!amount || amount <= 0) {
    showMsg("Enter valid amount");
    return;
  }

  if (currency === "GHS") {
    userData.balanceGHS -= amount;
    userData.balanceNGN += amount * rate;
    userData.transactions.push(`Converted ₵${amount} to ₦${amount * rate}`);
  } else {
    userData.balanceNGN -= amount;
    userData.balanceGHS += amount / rate;
    userData.transactions.push(`Converted ₦${amount} to ₵${(amount / rate).toFixed(2)}`);
  }

  save();
  loadDashboard();
  showMsg("Exchange successful");
}

function save() {
  localStorage.setItem(user, JSON.stringify(userData));
}

function showMsg(msg) {
  document.getElementById("exchangeMsg").textContent = msg;
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

loadDashboard();
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}
function loginUser() {
  // after successful login
  showSection("dashboardSection");
}

function openChat() {
  showSection("chatSection");
}

function logout() {
  showSection("authSection");
}
let exchangeRequests = JSON.parse(localStorage.getItem("requests")) || [];
function submitRequest() {
  const amount = Number(document.getElementById("amount").value);
  const direction = document.getElementById("direction").value;
  const user = localStorage.getItem("currentUser");

  if (!amount || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  const request = {
    id: Date.now(),
    user,
    amount,
    direction,
    status: "Pending",
    time: new Date().toLocaleString()
  };

  exchangeRequests.push(request);
  localStorage.setItem("requests", JSON.stringify(exchangeRequests));

  document.getElementById("exchangeMsg").textContent =
    "Request sent. Awaiting approval.";

  document.getElementById("amount").value = "";
}
const rate = 120;
let requests = JSON.parse(localStorage.getItem("requests")) || [];

function loadRequests() {
  const box = document.getElementById("adminRequests");
  box.innerHTML = "";

  requests.forEach(req => {
    if (req.status === "Pending") {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><b>${req.user}</b> – ${req.amount} (${req.direction})</p>
        <button onclick="approve(${req.id})">Approve</button>
        <button onclick="reject(${req.id})">Reject</button>
      `;
      box.appendChild(div);
    }
  });
}

function approve(id) {
  const req = requests.find(r => r.id === id);
  const userData = JSON.parse(localStorage.getItem(req.user));

  if (req.direction === "GHS_NGN") {
    userData.balanceGHS -= req.amount;
    userData.balanceNGN += req.amount * rate;
  } else {
    userData.balanceNGN -= req.amount;
    userData.balanceGHS += req.amount / rate;
  }

  req.status = "Approved";
  localStorage.setItem(req.user, JSON.stringify(userData));
  localStorage.setItem("requests", JSON.stringify(requests));
  loadRequests();
}

function reject(id) {
  const req = requests.find(r => r.id === id);
  req.status = "Rejected";
  localStorage.setItem("requests", JSON.stringify(requests));
  loadRequests();
}

loadRequests();
const BASE_RATE = 120;
const FEE_PERCENT = 2; // 2% fee
function approve(id) {
  const req = requests.find(r => r.id === id);
  const userData = JSON.parse(localStorage.getItem(req.user));

  const fee = (req.amount * FEE_PERCENT) / 100;

  if (req.direction === "GHS_NGN") {
    const netAmount = req.amount - fee;
    userData.balanceGHS -= req.amount;
    userData.balanceNGN += netAmount * BASE_RATE;
  } else {
    const netAmount = req.amount - fee;
    userData.balanceNGN -= req.amount;
    userData.balanceGHS += netAmount / BASE_RATE;
  }

  req.status = "Approved";
  req.fee = fee;

  localStorage.setItem(req.user, JSON.stringify(userData));
  localStorage.setItem("requests", JSON.stringify(requests));
  loadRequests();
}
function notify(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
notify("Exchange request submitted");
notify("Transaction approved");
function generateRef() {
  return "GG1G-" + Math.floor(Math.random() * 1000000000);
}
const request = {
  id: Date.now(),
  ref: generateRef(),
  user,
  amount,
  direction,
  status: "Pending",
  time: new Date().toLocaleString()
};
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  databaseURL: "https://YOUR_APP.firebaseio.com",
  projectId: "YOUR_APP"
};

const app = initializeApp(firebaseConfig);
import { getDatabase, ref, push, onChildAdded } from "firebase/database";

const db = getDatabase();
const chatRef = ref(db, "chats/support");

function sendMessage(msg) {
  push(chatRef, {
    user: currentUser,
    message: msg,
    time: Date.now()
  });
}

onChildAdded(chatRef, snapshot => {
  const data = snapshot.val();
  displayMessage(data);
});
const swapBtn = document.getElementById("swapBtn");

swapBtn.addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  convertCurrency();
});
