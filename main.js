
let currentNodeId = null;
let chatLogs = {};

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

    cy.on('tap', 'node', (evt) => {
        currentNodeId = evt.target.id();
        loadChat(currentNodeId);
    });
};

function loadChat(nodeId) {
    const chatLog = document.getElementById('chatLog');
    chatLog.innerHTML = '';
    const logs = chatLogs[nodeId] || [];
    logs.forEach(log => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'msg ' + log.sender;
        msgDiv.textContent = log.text;
        chatLog.appendChild(msgDiv);
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !currentNodeId) return;

    chatLogs[currentNodeId] = chatLogs[currentNodeId] || [];
    chatLogs[currentNodeId].push({ sender: 'user', text: text });

    // Example bot response
    const response = "That's a thoughtful reflection.";
    chatLogs[currentNodeId].push({ sender: 'bot', text: response });

    input.value = '';
    loadChat(currentNodeId);
}
