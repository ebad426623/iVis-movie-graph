const searchForm = document.getElementById('searchForm');
const actorInput = document.getElementById('actorName');
const depthInput = document.getElementById('depth');
const cyContainer = document.getElementById('cy');

const cy = cytoscape({
  container: cyContainer,
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

const menu = cy.contextMenus({
  menuItems: [
    {
      id: 'show-movies',
      content: 'Show movies',
      selector: 'node[type = "person"]',
      onClickFunction: function (event) {
        const node = event.target || event.cyTarget;
        const actorName = node.data('name') || node.data('label');
        const url = `/api/actor?actor=${encodeURIComponent(actorName)}`;

        expandGraph(url);
      }
    },
    {
      id: 'show-actors',
      content: 'Show actors',
      selector: 'node[type = "movie"]',
      onClickFunction: function (event) {
        const node = event.target || event.cyTarget;
        const movieTitle = node.data('title') || node.data('label');
        const url = `/api/movie?movie=${encodeURIComponent(movieTitle)}`;

        expandGraph(url);
      }
    }
  ]
});

const layoutUtils = cy.layoutUtilities({
  idealEdgeLength: 200,
});

const viewUtils = cy.viewUtilities({
    highlightStyles: [
      {
        node: {
          'background-color': '#ffd166'
        },
        edge: {
          'line-color': '#ffd166',
          'source-arrow-color': '#ffd166',
          'target-arrow-color': '#ffd166',
          width: 3
        }
      }
    ],
  }
);

async function expandGraph(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        console.error('Expansion failed:', data);
        return;
    }

    const newElements = data.elements.filter((element) => {
      return cy.getElementById(element.data.id).length === 0;
    });

    if (newElements.length === 0) {
      console.log('No new elements to add.');
      return;
    }

    const added = cy.add(newElements);
    viewUtils.removeHighlights();
    viewUtils.highlight(added);
    layoutUtils.placeNewNodes(added);


    cy.layout({
        name: 'fcose',
        randomize: false,
        idealEdgeLength: () => 200,
        nodeRepulsion: () => 10000,
        gravity: 0.25
    }).run();

    console.log(`Added ${newElements.length} new elements to the graph.`);
    console.log(newElements);

  }
  catch (error) {
    console.error('Expansion request failed:', error);
  }
}

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
        name: 'fcose',
        idealEdgeLength: () => 200,
        nodeRepulsion: () => 10000,
        gravity: 0.25
      }).run();

  } catch (error) {
      console.error('Request failed:', error);
  }
});
