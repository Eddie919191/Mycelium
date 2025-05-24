
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDydPFk8ma9vwCmMXzC6ximjmtsXRF4Cz0",
  authDomain: "myceli.firebaseapp.com",
  projectId: "myceli",
  storageBucket: "myceli.firebasestorage.app",
  messagingSenderId: "911546775295",
  appId: "1:911546775295:web:b0e176adcb889651cabeca"
};

// Initialize Firebase
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
    logs.forEach(log => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'msg ' + log.sender;
      msgDiv.textContent = log.text;
      chatLog.appendChild(msgDiv);
    });
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentNodeId) return;

  const docRef = db.collection("chats").doc(currentNodeId);
  const doc = await docRef.get();
  const logs = doc.exists ? doc.data().messages : [];

  logs.push({ sender: 'user', text: text });
  logs.push({ sender: 'bot', text: "That's a thoughtful reflection." });

  await docRef.set({ messages: logs });
  input.value = '';
  loadChat(currentNodeId);
}
