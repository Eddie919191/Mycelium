
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

window.onload = async () => {
  const rootDoc = await db.collection("nodes").doc("root").get();
  if (rootDoc.exists) {
    document.getElementById("landing").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
  }
};

async function submitLove() {
  const loveInput = document.getElementById("loveInput").value.trim();
  if (!loveInput) return alert("Please write something you truly love.");

  await db.collection("nodes").doc("root").set({
    id: "root",
    question: loveInput,
    summary: "This is the root of your journey. All things grow from love.",
    children: []
  });

  document.getElementById("landing").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
}
