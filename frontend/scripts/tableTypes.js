function initTableTypes() {
    let tbody = document.getElementById('tableTypeBody');
    tbody.innerHTML = ''; 
    
    if (schemaData.table_types) {
        schemaData.table_types.forEach(type => {
            let row = document.createElement('tr');

            let nameCell = document.createElement('td');
            let nameInput = document.createElement('input');
            nameInput.value = type.name;
            nameInput.className = 'editable';
            nameInput.onchange = () => updateTableType(type.uuid, nameInput.value, 'name');
            nameCell.appendChild(nameInput);

            let colorCell = document.createElement('td');
            let colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = type.color;
            colorInput.className = 'editable';
            colorInput.onchange = () => updateTableType(type.uuid, colorInput.value, 'color');
            colorCell.appendChild(colorInput);

            let descriptionCell = document.createElement('td');
            let descriptionInput = document.createElement('input');
            descriptionInput.value = type.description;
            descriptionInput.className = 'editable';
            descriptionInput.onchange = () => updateTableType(type.uuid, descriptionInput.value, 'description');
            descriptionCell.appendChild(descriptionInput);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = "X";
            deleteButton.className = "delete-btn";
            deleteButton.onclick = () => deleteTableType(type.uuid);
            let actionsCell = document.createElement('td');
            actionsCell.appendChild(deleteButton);

            row.appendChild(nameCell);
            row.appendChild(colorCell);
            row.appendChild(descriptionCell);
            row.appendChild(actionsCell);

            tbody.appendChild(row);
        });
    }
}

function updateTableType(uuid, value, field) {
    let type = schemaData.table_types.find(t => t.uuid === uuid);
    if (type) {
        type[field] = value;
        editor.set(schemaData); 
        updateNetworkForTableTypes(); 
    }
}

function addTableType() {
        let newType = {
            uuid: Date.now().toString(),
            name: "New Table Type",
            color: "#D2E5FF",
            description: "Newly added table type"
        };
        schemaData.table_types.push(newType);
        initTableTypes();
        updateNetworkForTableTypes();
        editor.set(schemaData);
}

function deleteTableType(uuid) {
    schemaData.table_types = schemaData.table_types.filter(t => t.uuid !== uuid);
    initTableTypes();
    updateNetworkForTableTypes();
    editor.set(schemaData);
}

function updateNetworkForTableTypes() {
    
    nodes.forEach((node) => {
        let table = schemaData.tables.find(t => t.uuid === node.id);
        if (table) {
            let tableType = schemaData.table_types.find(type => type.uuid === table.type);
            if (tableType) {
                node.color = tableType.color;  
                nodes.update(node);  
            }
            
        }
    });
    network.redraw();  
}