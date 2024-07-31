function initRelationshipTypes() {
    let tbody = document.getElementById('relationshipTypeBody');
    tbody.innerHTML = ''; 
    schemaData.relationship_types.forEach(type => {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        let nameInput = document.createElement('input');
        nameInput.value = type.name;
        nameInput.className = 'editable';
        nameInput.onchange = () => updateRelationshipType(type.uuid, nameInput.value, 'name');
        nameCell.appendChild(nameInput);

        let descriptionCell = document.createElement('td');
        let descriptionInput = document.createElement('input');
        descriptionInput.value = type.description;
        descriptionInput.className = 'editable';
        descriptionInput.onchange = () => updateRelationshipType(type.uuid, descriptionInput.value, 'description');
        descriptionCell.appendChild(descriptionInput);

        let deleteButton = document.createElement('button');
        deleteButton.textContent = "X";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = () => deleteRelationshipType(type.uuid);
        let actionsCell = document.createElement('td');
        actionsCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(descriptionCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}

function updateRelationshipType(uuid, value, field) {
    let type = schemaData.relationship_types.find(t => t.uuid === uuid);
    if (type) {
        type[field] = value;
        editor.set(schemaData); 
    }
}

function addRelationshipType() {
        let newType = {
            uuid: Date.now().toString(), 
            name: "New Relationship Type",
            description: "Newly added relationship type"
        };
        schemaData.relationship_types.push(newType);
        initRelationshipTypes(); 
        editor.set(schemaData);
}

function deleteRelationshipType(uuid) {
    schemaData.relationship_types = schemaData.relationship_types.filter(t => t.uuid !== uuid);
    initRelationshipTypes(); 
    editor.set(schemaData);
}