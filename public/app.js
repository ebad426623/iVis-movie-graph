const searchForm = document.getElementById('searchForm');
const actorInput = document.getElementById('actorName');
const depthInput = document.getElementById('depth');
const cyContainer = document.getElementById('cy');

const cy = cytoscape({
  container: cyContainer,
  elements: [],
  style: [
    {
      selector: 'node',
      style: {
        label: 'data(label)',
        color: '#000000',
        'font-size': '11px',
        'font-family': 'Segoe UI',
        'text-wrap': 'wrap',
        'text-max-width': '90px',
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector: 'node[type = "person"]',
      style: {
        'background-color': '#8ea2ff',
        shape: 'ellipse',
        width: 80,
        height: 80
      }
    },
    {
      selector: 'node[type = "movie"]',
      style: {
        'background-color': '#b7e4c7',
        shape: 'ellipse',
        width: 80,
        height: 80
      }
    },
    {
      selector: 'edge',
      style: {
        width: 3,
        'line-color': '#999',
        'font-size': '8px',
        'target-arrow-color': '#999',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 1.5,
        label: 'data(label)'
      }
    }
  ]
});

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const actorName = actorInput.value.trim();
    const depth = parseInt(depthInput.value, 10);

    const url = `/api/search?actor=${encodeURIComponent(actorName)}&depth=${depth}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Backend error:', data);
            return;
        }

        cy.elements().remove();
        cy.add(data.elements);
        cy.layout({
        name: 'fcose'
        }).run();

    } catch (error) {
        console.error('Request failed:', error);
    }
});
