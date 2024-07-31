function handleDoubleClick(params) {
    if (params.nodes.length > 0) {
        var nodeId = params.nodes[0];
        var nodeDetails = schemaData.tables.find(table => table.uuid === nodeId);
        if (!nodeDetails) {
            console.error('No details found for node:', nodeId);
            return;
        }
        displayNodeDetails(nodeDetails);
        editor.set(nodeDetails);
    }
}

function handleSelectNode(params) {
    if (params.nodes.length > 0) {
        selectedNodeId = params.nodes[0];
        document.getElementById('deleteNodeBtn').style.display = 'inline-block';
    }
}

function handleDeselectNode() {
    document.getElementById('deleteNodeBtn').style.display = 'none';
    selectedNodeId = null;
    clearNodeDetails();
    editor.set(schemaData);
}

function handleSelectEdge(params) {
    if (params.edges.length > 0) {
        selectedEdgeId = params.edges[0];
    }
}

function handleDeselectEdge() {
    selectedEdgeId = null;
}