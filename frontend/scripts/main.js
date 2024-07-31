let editor;
var network, nodes, edges, schemaData;
var selectedNodeId = null, selectedEdgeId = null; 

$(document).ready(function() {
    $('#search-input').on('input', function(e) {
        console.log('Search input:', e.target.value);
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        const matchedNodes = nodes.get({
            filter: function (node) {
                return node.label.toLowerCase().includes(searchTerm);
            }
        });

        console.log('Matched nodes:', matchedNodes);
        
        const searchResultsContainer = $('#search-results');
        searchResultsContainer.empty(); 

        if (matchedNodes.length > 0) {
            console.log('Displaying search results:', matchedNodes);
            searchResultsContainer.show(); 
            matchedNodes.forEach(node => {
                const resultDiv = $('<div>').text(node.label);
                resultDiv.on('click', function() {
                    network.focus(node.id, { scale: 1.5 });
                    network.selectNodes([node.id]);
                    const tableData = schemaData.tables.find(table => table.uuid === node.id);
                    if (tableData) {
                        editor.set(tableData);
                        displayNodeDetails(tableData);
                    }
                    searchResultsContainer.hide(); 
                });
                searchResultsContainer.append(resultDiv);
            });
        } else {
            searchResultsContainer.hide(); 
        }
    });

    
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#search-results').length && !$(e.target).is('#search-input')) {
            $('#search-results').hide();
            var searchInput = document.getElementById('search-input');
            var searchIcon = document.getElementById('search-icon');
            if (searchInput.style.width === '150px') {
                searchInput.style.width = '0';
                searchInput.style.padding = '0';
                searchInput.style.opacity = '0';
                setTimeout(function() { searchInput.style.display = 'none'; }, 300);
                searchIcon.textContent = '🔍';
            }

        }
    });



    $('.window').resizable({ handles: 'ne, se, sw, nw', minWidth: 200, minHeight: 200 })
                .draggable({ containment: "parent" });
    $('#diagram_window').resizable({ handles: 'ne, se, sw, nw', minWidth: 200, minHeight: 200 })
                 .draggable({ handle: ".window-header" });

    $('#node_detail_window').resizable({ handles: 'ne, se, sw, nw', minWidth: 200, minHeight: 200 })
                    .draggable({ containment: "parent" });

    $('#table_type_window').resizable({ handles: 'ne, se, sw, nw', minWidth: 200, minHeight: 200 })
                 .draggable({ container: "parent" });

    $('#column_type_window').resizable({ handles: 'ne, se, sw, nw', minWidth: 200, minHeight: 200 })
                    .draggable({ container: "parent" });

    const container = document.getElementById('jsoneditor');
    const options = { mode: 'tree' };
    editor = new JSONEditor(container, options);

    
    initVisNetwork();
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const json = JSON.parse(evt.target.result);
                schemaData = json;  
                editor.set(json);
                initVisNetwork(json); 
                
                document.getElementById('start-screen').style.display = 'none';

                initTableTypes();
                initColumnTypes();
                initPropertyTypes();
                initRelationshipTypes();


            } catch (e) {
                alert('Error reading file: ' + e.message);
            }
        };
        reader.readAsText(file);
    } else {
        alert('No file selected or file could not be read');
    }
}


document.getElementById('newSchemaBtn').addEventListener('click', function() {
    document.getElementById('start-screen').style.display = 'none';
    
    schemaData = { tables: [], table_types: [], column_types: [], property_types: [], relationship_types: [] };
    editor.set(schemaData);
    initVisNetwork();
    initTableTypes();
    initColumnTypes();
    initPropertyTypes();
    initRelationshipTypes();
});

document.getElementById('uploadForm').querySelector('input[type="file"]').onchange = function() {
    uploadFile();
};






function toggleMenu() {
    const menu = document.querySelector('.hamburger-menu .menu-content');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function toggleDropdown() {
    const dropdownContent = document.querySelector('.dropdown .dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

function toggleVisibility(windowId) {
    var windowElement = document.getElementById(windowId);
    windowElement.style.display = windowElement.style.display === 'none' ? 'block' : 'none';
}



function toggleWindows() {
    const checkboxes = document.querySelector('.dropdown-content').cloneNode(true);
    checkboxes.style.display = 'block';
    checkboxes.style.position = 'static';
    document.querySelector('.hamburger-menu .menu-content').appendChild(checkboxes);
}

function showFAQ() {
    var faqPlaceholder = document.getElementById('faq-placeholder');
    faqPlaceholder.style.display = (faqPlaceholder.style.display === 'none' || faqPlaceholder.style.display === '') ? 'block' : 'none';
}


function toggleSearchBar() {
    var searchInput = document.getElementById('search-input');
    var searchIcon = document.getElementById('search-icon');
    if (searchInput.style.width === '150px') {
        searchInput.style.width = '0';
        searchInput.style.padding = '0';
        searchInput.style.opacity = '0';
        setTimeout(function() { searchInput.style.display = 'none'; }, 300);
        searchIcon.textContent = '🔍';
    } else {
        searchInput.style.display = 'block';
        setTimeout(function() { 
            searchInput.style.width = '150px';
            searchInput.style.padding = '8px 10px';
            searchInput.style.opacity = '1';
        }, 10);
        searchIcon.textContent = '✕';
        searchInput.focus();
    }
}


function fetchSchema() {
    fetch('http://localhost:3000/schema')
    .then(response => response.json())
    .then(data => {
        schemaData = data; 
        editor.set(data);

        initTableTypes();
        initColumnTypes();
        initPropertyTypes();
        initRelationshipTypes();
    })
    .catch(error => console.error('Error fetching schema:', error));
}

function saveSchema() {
    try {

        handleDeselectNode();
        const json = editor.get();
        fetch('http://localhost:3000/schema', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        })
        .then(response => response.ok ? alert('Schema saved successfully.') : alert('Failed to save schema.'));
    } catch (e) {
        alert('Invalid JSON format.');
    }
}

function uploadFile() {
    const formData = new FormData(document.getElementById('uploadForm'));
    console.log('Uploading file:', formData.get('file'), 'to:', formData);
    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            schemaData = data.content;
            editor.set(data.content);
            initVisNetwork(data.content);
        } else {
            alert('File uploaded but no content to display');
        }
    })
    .catch(error => console.error('Error uploading file:', error));
}

function initVisNetwork() {
    nodes = new vis.DataSet();
    edges = new vis.DataSet();

    if (schemaData && schemaData.tables) {
        schemaData.tables.forEach(table => {
            let color = '#D2E5FF'; 
            schemaData.table_types.forEach(type => {
                if (type.uuid === table.type) {
                    color = type.color;
                }
            });

            nodes.add({ id: table.uuid, label: table.name, title: table.description, color: color, x: table.pos_x, y: table.pos_y });
            table.columns.forEach(column => {
                if (column.relationship) {
                    column.relationship.forEach(rel => {
                        edges.add({ from: table.uuid, to: rel.table_uuid, label: rel.type, arrows: 'to', id: rel.uuid });
                    });
                }
            });
        });

        var container = document.getElementById('network');
        var networkData = { nodes: nodes, edges: edges };
        var options = { nodes: { shape: 'box' }, physics: { enabled: false } };
        network = new vis.Network(container, networkData, options);

        network.on("dragEnd", updateNodePositions);
        network.on("doubleClick", handleDoubleClick);
        network.on("selectNode", handleSelectNode);
        network.on("deselectNode", handleDeselectNode);
        network.on("selectEdge", handleSelectEdge);
        network.on("deselectEdge", handleDeselectEdge);
    }
}

function updateNodePositions(params) {
    params.nodes.forEach(nodeId => {
        let node = nodes.get(nodeId);
        let table = schemaData.tables.find(table => table.uuid === nodeId);
        if (table) {
            table.pos_x = node.x;
            table.pos_y = node.y;
        }
    });
}

function generateUUID() {
    
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function addNode() {
    
    const newNodeId = `node-${Date.now()}`;

    
    let totalX = 0, totalY = 0, nodeCount = 0;
    nodes.forEach(node => {
        console.log('Node:', node.id, 'at position:', node.x, node.y, node);
        totalX += parseFloat(node.x);  
        totalY += parseFloat(node.y);  
        nodeCount++; 
    });
    const avgX = nodeCount > 0 ? totalX / nodeCount : 0; 
    const avgY = nodeCount > 0 ? totalY / nodeCount : 0; 

    console.log('Adding new node with ID:', newNodeId, 'at position:', avgX, avgY);

    const newNode = {
        uuid: newNodeId,
        name: "New Node",
        description: "New Node Description",
        type: schemaData.table_types[0]?.uuid ?? '0', 
        columns: [], 
        pos_x: avgX, 
        pos_y: avgY
    };

    
    schemaData.tables.push(newNode);

    
    nodes.add({
        id: newNodeId,
        label: "New Node",
        title: "New Node Description",
        color: schemaData.table_types[0]?.color ?? '#D2E5FF', 
        x: avgX,
        y: avgY
    });

    
    network.fit({ nodes: [newNodeId], animation: true });

    
    editor.set(schemaData);
}



function shiftZIndex(windowId, direction) {
    const windowElement = document.getElementById(windowId);
    let currentZIndex = parseInt(windowElement.style.zIndex, 10) || 0;
    windowElement.style.zIndex = currentZIndex + direction;
}
