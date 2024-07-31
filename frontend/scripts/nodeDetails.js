function displayNodeDetails(nodeDetails) {
    populateTableTypesDropdown(); 
    
    if (!nodeDetails || !nodeDetails.columns) {
        console.error('Invalid node details:', nodeDetails);
        document.getElementById('node-name').textContent = "No node selected";
        document.getElementById('node-description').textContent = "No details available";
        document.getElementById('node-details-body').innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
        return;
    }

    document.getElementById('node-name').value = nodeDetails.name || "";
    document.getElementById('node-description').value = nodeDetails.description || "";


    
    document.getElementById('node-type').value = nodeDetails.type;

    let rowsHtml = nodeDetails.columns.map(column => {
        const columnTypeOptions = schemaData.column_types.map(type => 
            `<option value="${type.uuid}" ${type.uuid === column.type ? 'selected' : ''}>${type.name}</option>`
        ).join('');

        const propertiesHtml = column.properties 
            ? column.properties.map(prop => {
                const propertyTypeOptions = schemaData.property_types.map(type => 
                    `<option value="${type.uuid}" ${type.uuid === prop.type ? 'selected' : ''}>${type.name}</option>`
                ).join('');

                return `<li>
                            <select onchange="updateColumnProperty('${column.uuid}', '${prop.uuid}', 'type', this.value)">
                                ${propertyTypeOptions}
                            </select>
                            : 
                            <input type="text" value="${prop.value}" onchange="updateColumnProperty('${column.uuid}', '${prop.uuid}', 'value', this.value)" />
                            <button onclick="deleteProperty('${column.uuid}', '${prop.uuid}')" class="delete-btn">X</button>
                        </li>`;
            }).join("")
            : "<li>No properties</li>";

        const relationshipsHtml = column.relationship 
            ? column.relationship.map(rel => {
                const relationshipTypeOptions = schemaData.relationship_types.map(type => 
                    `<option value="${type.uuid}" ${type.uuid === rel.type ? 'selected' : ''}>${type.name}</option>`
                ).join('');
                const tableOptions = schemaData.tables.map(table => 
                    `<option value="${table.uuid}" ${table.uuid === rel.table_uuid ? 'selected' : ''}>${table.name}</option>`
                ).join('');
                const columnOptions = schemaData.tables.find(table => table.uuid === rel.table_uuid).columns.map(column =>
                    `<option value="${column.uuid}" ${column.uuid === rel.column_uuid ? 'selected' : ''}>${column.name}</option>`
                ).join('');

                return `<li>
                            <select onchange="updateColumnRelationship('${nodeDetails.uuid}', '${column.uuid}', '${rel.uuid}', 'type', this.value)">
                                ${relationshipTypeOptions}
                            </select>
                            to
                            <select onchange="updateColumnRelationship('${nodeDetails.uuid}', '${column.uuid}', '${rel.uuid}', 'table_uuid', this.value)">
                                ${tableOptions}
                            </select>
                            <select onchange="updateColumnRelationship('${nodeDetails.uuid}', '${column.uuid}', '${rel.uuid}', 'column_uuid', this.value)">
                                ${columnOptions}
                            </select>
                            <input type="text" value="${rel.description}" onchange="updateColumnRelationship('${nodeDetails.uuid}', '${column.uuid}', '${rel.uuid}', 'description', this.value)" />
                            <button onclick="deleteRelationship('${column.uuid}', '${rel.uuid}')" class="delete-btn">X</button>
                        </li>`;
            }).join("")
            : "<li>No relationships</li>";

        return `<tr>
                    <td><input type="text" value="${column.name}" onchange="updateColumnDetail('name', '${column.uuid}', this.value)" /></td>
                    <td><input type="text" value="${column.description}" onchange="updateColumnDetail('description', '${column.uuid}', this.value)" /></td>
                    <td>
                        <select onchange="updateColumnDetail('type', '${column.uuid}', this.value)">
                            ${columnTypeOptions}
                        </select>
                    </td>
                    <td><ul>${propertiesHtml}<button onclick="addProperty('${column.uuid}')">Add Property</button></ul></td>
                    <td><ul>${relationshipsHtml}<button onclick="addRelationship('${column.uuid}')">Add Relationship</button></ul></td>
                    <td>
                        <button onclick="deleteColumn('${column.uuid}')" class="delete-btn">X</button>
                    </td>
                </tr>`;
    }).join('');

    document.getElementById('node-details-body').innerHTML = rowsHtml;
}



function populateTableTypesDropdown() {
    const dropdown = document.getElementById('node-type');
    dropdown.innerHTML = '';  
    schemaData.table_types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.uuid;
        option.textContent = type.name;
        dropdown.appendChild(option);
    });
}


function updateColumnProperty(columnUuid, propertyUuid, field, value) {
    console.log('Updating property:', field, columnUuid, propertyUuid, value);  
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === columnUuid);
    const property = column.properties.find(p => p.uuid === propertyUuid);
    if (field === 'type') {
        property.type = value;
    } else if (field === 'value') {
        property.value = value;
    }
    editor.set(schemaData); 
}


function updateColumnRelationship(tableUuid, columnUuid, relationshipUuid, field, value) {
    console.log('Updating relationship:', field, columnUuid, relationshipUuid, value);
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === columnUuid);
    const relationship = column.relationship.find(r => r.uuid === relationshipUuid);
    if (field === 'type') {
        relationship.type = value;
    } else if (field === 'table_uuid') {
        relationship.table_uuid = value;
    } else if (field === 'column_uuid') {
        relationship.column_uuid = value;
    } else if (field === 'description') {
        relationship.description = value;
    }
    editor.set(schemaData); 
    updateNetworkForRelationships(relationshipUuid, tableUuid);
}


function addProperty(columnUuid) {
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === columnUuid);
    if (!column.properties) {
        column.properties = [];
    }
    
    column.properties.push({
        uuid: generateUUID(), 
        type: schemaData.property_types[0]?.uuid ?? '0', 
        value: ""
    });
    editor.set(schemaData);
    displayNodeDetails(table);
}

function deleteProperty(columnUuid, propertyUuid) {
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === columnUuid);
    column.properties = column.properties.filter(p => p.uuid !== propertyUuid);
    editor.set(schemaData);
    displayNodeDetails(table);
}

function addRelationship(columnUuid) {
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === columnUuid);
    if (!column.relationship) {
        column.relationship = [];
    }

    var tempUUID = generateUUID();

    
    column.relationship.push({
        uuid: tempUUID,
        type: schemaData.relationship_types[0]?.uuid ?? '0', 
        table_uuid: schemaData.tables[0].uuid, 
        column_uuid: schemaData.tables[0].columns[0]?.uuid ?? '0', 
        description: ""
    });

    
    
    edges.add({ from: table.uuid, to: schemaData.tables[0].uuid, label: schemaData.relationship_types[0]?.name ?? 'n/a', arrows: 'to', id: tempUUID });

    editor.set(schemaData);
    displayNodeDetails(table);
}

function deleteRelationship(columnUuid, relationshipUuid) {
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === columnUuid);
    column.relationship = column.relationship.filter(r => r.uuid !== relationshipUuid);
    editor.set(schemaData);
    displayNodeDetails(table);

    
    edges.remove({ id: relationshipUuid });


}


function updateColumnDetail(field, uuid, value) {
    console.log('Updating column:', field, uuid, value);
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    const column = table.columns.find(c => c.uuid === uuid);
    column[field] = value;
    editor.set(schemaData);

    
}

function deleteColumn(uuid) {
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    table.columns = table.columns.filter(c => c.uuid !== uuid);
    displayNodeDetails(table); 
    
}

function updateTableTypeForNode(newTypeUuid) {
    if (selectedNodeId) {
        const node = schemaData.tables.find(t => t.uuid === selectedNodeId);
        if (node) {
            node.type = newTypeUuid;
            
            const nodeType = schemaData.table_types.find(t => t.uuid === newTypeUuid);
            if (nodeType && nodes) {
                nodes.update({id: selectedNodeId, color: nodeType.color});
            }
            editor.set(schemaData);  
        }
    }
}

function deleteNode(nodeId) {
    
    nodes.remove({ id: nodeId });

    
    edges.forEach (edge => {
        if (edge.from === nodeId || edge.to === nodeId) {
            edges.remove({ id: edge.id });

            
            schemaData.tables.forEach(table => {
                table.columns.forEach(column => {
                    if (column.relationship) {
                        column.relationship = column.relationship.filter(rel => rel.uuid !== edge.id);
                    }
                });
            });
        }
    });

    
    schemaData.tables = schemaData.tables.filter(table => table.uuid !== nodeId);
    editor.set(schemaData);  

    
    clearNodeDetails();

    
    document.getElementById('deleteNodeBtn').style.display = 'none';
}



function clearNodeDetails() {
    document.getElementById('node-name').value = "";
    document.getElementById('node-description').value = "";
    document.getElementById('node-details-body').innerHTML = "<tr><td colspan='6'>Select a node to view details</td></tr>";
}


function updateTableName(newName) {
    if (!selectedNodeId) {
        alert('No table selected.');
        return;
    }
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    if (table) {
        table.name = newName;
        editor.set(schemaData); 
        updateNetworkForTableName();
    }
}

function updateTableDescription(newDescription) {
    if (!selectedNodeId) {
        alert('No table selected.');
        return;
    }
    const table = schemaData.tables.find(t => t.uuid === selectedNodeId);
    if (table) {
        table.description = newDescription;
        editor.set(schemaData); 
    }
}


function updateNetworkForRelationships(relId, tabId) {
    edges.forEach(edge => {
        if (edge.id === relId) {
            let relationship = schemaData.tables.reduce((acc, table) => {
                table.columns.forEach(column => {
                    if (column.relationship) {
                        column.relationship.forEach(rel => {
                            if (rel.uuid === relId) {
                                console.log('Found relationship:', rel);
                                acc = rel;
                            }
                        });
                    }
                });
                return acc;
            }, null);

            if (relationship) {
                console.log('Updating edge:', edge, 'with relationship:', relationship);
                edge.from = tabId;
                edge.to = relationship.table_uuid;
                edges.update(edge);
            }
        }
    });


    network.redraw();  
}



function updateNetworkForTableName() {
    nodes.forEach((node) => {
        let table = schemaData.tables.find(t => t.uuid === node.id);
        if (table) {
            node.label = table.name;
            nodes.update(node);
        }
    });
    network.redraw();  
}