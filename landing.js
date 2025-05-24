console.log("Loading landing...");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

window.onload = async () => {
  console.log("Checking if root node exists...");
  const rootDoc = await db.collection("nodes").doc("root").get();
  console.log("Got Firestore response:", rootDoc.exists);
  if (rootDoc.exists) {
    console.log("Redirecting to main.html...");
    window.location.href = "main.html";
  } else {
    console.log("No root node found — staying on landing.");
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyDydPFk8ma9vwCmMXzC6ximjmtsXRF4Cz0",
  authDomain: "myceli.firebaseapp.com",
  projectId: "myceli",
  storageBucket: "myceli.firebasestorage.app",
  messagingSenderId: "911546775295",
  appId: "1:911546775295:web:b0e176adcb889651cabeca"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function submitLove() {
  const loveInput = document.getElementById("loveInput").value.trim();
  if (!loveInput) return alert("Please write something you truly love.");

  await db.collection("nodes").doc("root").set({
    id: "root",
    question: loveInput,
    summary: "This is the root of your journey. All things grow from love.",
    children: []
  });

  await db.collection("chats").doc("root").set({
    messages: [
      { sender: "user", text: loveInput },
      { sender: "bot", text: "This is beautiful. From this seed, your map will grow." }
    ]
  });

  window.location.href = "main.html";
}
