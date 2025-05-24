window.onload = () => {
    const nodeList = document.getElementById('nodeList');
    const contentPane = document.getElementById('contentPane');

    for (const nodeId in nodes) {
        const node = nodes[nodeId];
        const listItem = document.createElement('li');
        listItem.textContent = node.question;
        listItem.onclick = () => displayNode(node);
        nodeList.appendChild(listItem);
    }

    function displayNode(node) {
        contentPane.innerHTML = `
            <h2>${node.question}</h2>
            <p><strong>Summary:</strong> ${node.summary}</p>
            <p><strong>Children:</strong> ${node.children.map(id => nodes[id]?.question || '').join(', ')}</p>
        `;
    }
};
