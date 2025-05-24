
const firebaseConfig = {
  apiKey: "AIzaSyDydPFk8ma9vwCmMXzC6ximjmtsXRF4Cz0",
  authDomain: "myceli.firebaseapp.com",
  projectId: "myceli",
  storageBucket: "myceli.firebasestorage.app",
  messagingSenderId: "911546775295",
  appId: "1:911546775295:web:b0e176adcb889651cabeca"
};

let allNodes = {};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentNodeId = null;

window.onload = async () => {
  const elements = [];
  const snapshot = await db.collection("nodes").get();
  snapshot.forEach(doc => {
    const node = doc.data();
    allNodes[node.id] = node;
    elements.push({ data: { id: node.id, label: node.question } });
  });
  
const snapshot = await db.collection("nodes").get();
snapshot.forEach(doc => {
  const node = doc.data();
  allNodes[node.id] = node;
  elements.push({ data: { id: node.id, label: node.question } });
});

for (const nodeId in allNodes) {
  const node = allNodes[nodeId];
  node.children.forEach(childId => {
    elements.push({ data: { source: node.id, target: childId } });
  });



  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements: elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#66ccff',
          'label': 'data(label)',
          'color': '#fff',
          'font-size': '12px',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#888',
          'target-arrow-color': '#888',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ],
    layout: { name: 'cose', animate: true }
  });

  cy.on('tap', 'node', async (evt) => {
    currentNodeId = evt.target.id();
    await loadChat(currentNodeId);
  });
};

async function loadChat(nodeId) {
  const chatLog = document.getElementById('chatLog');
  chatLog.innerHTML = '';

  const docRef = db.collection("chats").doc(nodeId);
  const doc = await docRef.get();

  if (doc.exists) {
    const logs = doc.data().messages || [];
    logs.forEach((log) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'msg ' + log.sender;
      msgDiv.textContent = log.text;

      if (log.sender === 'bot') {
        const btn = document.createElement('button');
        btn.textContent = '🌱';
        btn.className = 'branch-btn';
        btn.onclick = () => openBranchModal(log.text);
        msgDiv.appendChild(btn);
      }

      chatLog.appendChild(msgDiv);
    });
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentNodeId) return;

  const chatLogRef = db.collection("chats").doc(currentNodeId);
  const doc = await chatLogRef.get();
  const logs = doc.exists ? doc.data().messages : [];
  logs.push({ sender: 'user', text: text });

  const response = await getGPTResponseViaNetlify(text);
  logs.push({ sender: 'bot', text: response });

  await chatLogRef.set({ messages: logs });
  input.value = '';
  loadChat(currentNodeId);
}

async function getGPTResponseViaNetlify(message) {
  const response = await fetch("/.netlify/functions/gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Function error:", err);
    return "...";
  }

  const data = await response.json();
  return data.reply || "...";
}

async function getGPTTitleSuggestion(text) {
  const response = await fetch("/.netlify/functions/gpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Suggest a 1-3 word title for a knowledge node based on this reflection:

${text}`
    })
  });
  if (!response.ok) return "New Node";
  const data = await response.json();
  return data.reply?.replace(/['"]/g, "").trim() || "New Node";
}

async function openBranchModal(text) {
  const titleSuggestion = await getGPTTitleSuggestion(text);
  const title = prompt("🌱 New Node Title:", titleSuggestion);
  if (!title) return;

  const newId = title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const summary = text;

  // Save new node to Firebase
  await db.collection("nodes").doc(newId).set({
    id: newId,
    question: title,
    summary: summary,
    children: []
  });

  // Update parent node's children
  const parentRef = db.collection("nodes").doc(currentNodeId);
  const parentDoc = await parentRef.get();
  if (parentDoc.exists) {
    const parentData = parentDoc.data();
    const updatedChildren = parentData.children || [];
    if (!updatedChildren.includes(newId)) {
      updatedChildren.push(newId);
      await parentRef.update({ children: updatedChildren });
    }
  }

  alert(`Branched to: ${title}`);
  location.reload();
}
