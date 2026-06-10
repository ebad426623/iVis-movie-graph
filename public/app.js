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
        'background-color': '#666',
        color: '#000',
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': '#999',
        'target-arrow-color': '#999',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)'
      }
    }
  ],
  layout: {
    name: 'grid'
  }
});

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const actorName = actorInput.value.trim();
    const depth = parseInt(depthInput.value, 10);

    const url = `/api/search?actor=${encodeURIComponent(actorName)}&depth=${depth}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log('Backend response:', data);
    } catch (error) {
        console.error('Request failed:', error);
    }
});
