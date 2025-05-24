window.onload = () => {
    const contentPane = document.getElementById('contentPane');

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
        layout: {
            name: 'cose',
            animate: true
        }
    });

    cy.on('tap', 'node', (evt) => {
        const nodeId = evt.target.id();
        const node = nodes[nodeId];
        contentPane.innerHTML = `
            <h2>${node.question}</h2>
            <p><strong>Summary:</strong> ${node.summary}</p>
            <p><strong>Children:</strong> ${node.children.map(id => nodes[id]?.question || '').join(', ')}</p>
        `;
    });
};
