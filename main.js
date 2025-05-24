
let currentNodeId = null;

window.onload = () => {
    const contentPane = document.getElementById('contentPane');
    const branchIcon = document.getElementById('branchIcon');

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
        const nodeId = evt.target.id();
        const node = nodes[nodeId];
        currentNodeId = nodeId;
        branchIcon.style.display = 'block';
        contentPane.innerHTML = `
            <h2>${node.question}</h2>
            <p><strong>Summary:</strong> ${node.summary}</p>
            <p><strong>Children:</strong> ${node.children.map(id => nodes[id]?.question || '').join(', ')}</p>
            <div id="branchIcon" title="Grow this thought into a new node">🌱</div>
        `;
        document.getElementById('branchIcon').onclick = openModal;
    });
};

function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function confirmBranch() {
    const question = document.getElementById('newQuestion').value.trim();
    const summary = document.getElementById('newSummary').value.trim();
    if (!question || !summary || !currentNodeId) return;

    const newId = question.toLowerCase().replace(/[^a-z0-9]/g, '-');
    nodes[newId] = {
        id: newId,
        question: question,
        summary: summary,
        children: []
    };
    nodes[currentNodeId].children.push(newId);

    alert(`New node "${question}" created under "${nodes[currentNodeId].question}"!`);
    closeModal();
    location.reload(); // For demo purposes - will redraw map with new structure
}
