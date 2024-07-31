function initPropertyTypes() {
    let tbody = document.getElementById('propertyTypeBody');
    tbody.innerHTML = ''; 
    schemaData.property_types.forEach(type => {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        let nameInput = document.createElement('input');
        nameInput.value = type.name;
        nameInput.className = 'editable';
        nameCell.appendChild(nameInput);

        let descriptionCell = document.createElement('td');
        let descriptionInput = document.createElement('input');
        descriptionInput.value = type.description;
        descriptionInput.className = 'editable';
        descriptionCell.appendChild(descriptionInput);

        let actionsCell = document.createElement('td');
        actionsCell.innerHTML = `<button onclick="updatePropertyType('${type.uuid}', this.parentNode.parentNode)" class="update-btn" style="display:inline-block;">Update</button>
                          <button onclick="deletePropertyType('${type.uuid}')" class="delete-btn" style="display:inline-block; margin-left: 10px;">X</button>`;


        row.appendChild(nameCell);
        row.appendChild(descriptionCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}

function updatePropertyType(uuid, row) {
    let nameInput = row.querySelector('td:first-child input').value;
    let descriptionInput = row.querySelector('td:nth-child(2) input').value;
    
    let type = schemaData.property_types.find(t => t.uuid === uuid);
    if (type) {
        type.name = nameInput;
        type.description = descriptionInput;

        let typeIndex = schemaData.property_types.findIndex(t => t.uuid === uuid);
        if (typeIndex !== -1) {
            schemaData.property_types[typeIndex] = type;
        }

        editor.set(schemaData);  
        alert('Property type updated successfully.');
    }
}

function addPropertyType() {
    let newName = prompt("Enter name for new property type:");
    if (newName) {
        let newType = {
            uuid: Date.now().toString(), 
            name: newName,
            description: "Newly added property type"
        };
        schemaData.property_types.push(newType);
        initPropertyTypes(); 
        editor.set(schemaData);
    }
}


function deletePropertyType(uuid) {
    schemaData.property_types = schemaData.property_types.filter(t => t.uuid !== uuid);
    initPropertyTypes(); 
    editor.set(schemaData);
}