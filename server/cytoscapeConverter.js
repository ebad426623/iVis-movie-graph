function neo4jIntToNumber(value) {
    if (value && typeof value === "object" && 'low' in value) {
        return value.low;
    }
    return value;
}

function getNodeId(node) {
    if(node.labels.includes('Person')) {
        return `person:${node.properties.name}`;
    }

    if(node.labels.includes('Movie')) {
        return `movie:${node.properties.title}`;
    }   
    
    return `node:${node.elementId}`;
}

function getNodeLabel(node) {
    if(node.labels.includes('Person')) {
        return node.properties.name;
    }

    if(node.labels.includes('Movie')) {
        return node.properties.title;
    }   
    
    return node.elementId;
}

function getNodeType(node) {
  if (node.labels.includes("Person")) {
    return "person";
  }

  if (node.labels.includes("Movie")) {
    return "movie";
  }

  return "unknown";
}

function convertNode(node) {
    const type = getNodeType(node);

    const data = {
        id: getNodeId(node),
        label: getNodeLabel(node),
        type
    };

    if (type === "person") {
        data.name = node.properties.name;
        data.born = neo4jIntToNumber(node.properties.born);
    }

    if (type === "movie") {
        data.title = node.properties.title;
        data.released = neo4jIntToNumber(node.properties.released);
        data.tagline = node.properties.tagline || null;
    }

    return { data };
}

function addNode(node, elementsMap) {
    const nodeId = getNodeId(node);

    if (!elementsMap.has(nodeId)) {
        elementsMap.set(nodeId, convertNode(node));
    }
}

function findRelationshipSourceAndTarget(segment) {
    const relationship = segment.relationship;

    let sourceNode = null;
    let targetNode = null;

    if (segment.start.elementId === relationship.startNodeElementId) {
        sourceNode = segment.start;
    } else if (segment.end.elementId === relationship.startNodeElementId) {
        sourceNode = segment.end;
    }

    if (segment.start.elementId === relationship.endNodeElementId) {
        targetNode = segment.start;
    } else if (segment.end.elementId === relationship.endNodeElementId) {
        targetNode = segment.end;
    }

    return { sourceNode, targetNode };
}

function addEdge(segment, elementsMap) {
    const relationship = segment.relationship;
    const { sourceNode, targetNode } = findRelationshipSourceAndTarget(segment);

    if (!sourceNode || !targetNode) {
        return;
    }

    const source = getNodeId(sourceNode);
    const target = getNodeId(targetNode);

    const id = `edge:${source}--${target}`;

    if (!elementsMap.has(id)) {
        elementsMap.set(id, {
            data: {
                id,
                source,
                target,
                label: relationship.type,
                type: relationship.type.toLowerCase(),
                roles: relationship.properties.roles || []
            }
        });
    }
}

function convertToCytoscape(paths) {
    const elementsMap = new Map();

    for (const path of paths) {
        addNode(path.start, elementsMap);
        addNode(path.end, elementsMap);

        for (const segment of path.segments) {
            addNode(segment.start, elementsMap);
            addNode(segment.end, elementsMap);
            addEdge(segment, elementsMap);
        }
    }

    return Array.from(elementsMap.values());
}

module.exports = {
  convertToCytoscape
};