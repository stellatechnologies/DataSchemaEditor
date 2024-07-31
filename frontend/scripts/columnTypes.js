function initColumnTypes() {
    let tbody = document.getElementById('columnTypeBody');
    tbody.innerHTML = ''; 
    schemaData.column_types.forEach(type => {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        let nameInput = document.createElement('input');
        nameInput.value = type.name;
        nameInput.className = 'editable';
        nameInput.onchange = () => updateColumnType(type.uuid, nameInput.value, 'name');
        nameCell.appendChild(nameInput);

        let descriptionCell = document.createElement('td');
        let descriptionInput = document.createElement('input');
        descriptionInput.value = type.description;
        descriptionInput.className = 'editable';
        descriptionInput.onchange = () => updateColumnType(type.uuid, descriptionInput.value, 'description');
        descriptionCell.appendChild(descriptionInput);

        let deleteButton = document.createElement('button');
        deleteButton.textContent = "X";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = () => deleteColumnType(type.uuid);
        let actionsCell = document.createElement('td');
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(descriptionCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}

function updateColumnType(uuid, value, field) {
    let type = schemaData.column_types.find(t => t.uuid === uuid);
    if (type) {
        type[field] = value;
        editor.set(schemaData); 
    }
}

function addColumn() {
    if (!selectedNodeId) {
        alert('No table selected to add a column to.');
        return;
    }

    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    if (!table) {
        alert('Selected table not found.');
        return;
    }

    
    const newColumn = {
        uuid: generateUUID(), 
        name: 'New Column',
        description: 'Description of new column',
        type: schemaData.column_types[0]?.uuid ?? '0',
        properties: [],
        relationship: null
    };

    
    table.columns.push(newColumn);
    editor.set(schemaData); 
    displayNodeDetails(table); 
}

function addColumnType() {
        let newType = {
            uuid: Date.now().toString(),  
            name: "New Column Type",
            description: "Newly added column type"
        };
        schemaData.column_types.push(newType);
        initColumnTypes();  
        editor.set(schemaData);
}

function deleteColumnType(uuid) {
    schemaData.column_types = schemaData.column_types.filter(t => t.uuid !== uuid);
    initColumnTypes();  
    editor.set(schemaData);
}