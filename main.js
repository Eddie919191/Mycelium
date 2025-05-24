
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

let currentNodeId = null;

window.onload = () => {
  const elements = [];
  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    elements.push({ data: { id: node.id, label: node.question } });
    node.children.forEach(childId => {
      elements.push({ data: { source: node.id, target: childId } });
    });
  }

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
    logs.forEach((log, index) => {
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

function openBranchModal(text) {
  const title = prompt("🌱 New Node Title:", text.slice(0, 60));
  if (!title) return;

  const newId = title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const summary = text;
  nodes[newId] = {
    id: newId,
    question: title,
    summary: summary,
    children: []
  };

  if (!nodes[currentNodeId].children.includes(newId)) {
    nodes[currentNodeId].children.push(newId);
  }

  alert(`Branched to: ${title}`);
  location.reload(); // to update map
}
