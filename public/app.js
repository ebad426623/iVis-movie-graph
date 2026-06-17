const searchForm = document.getElementById('searchForm');
const actorInput = document.getElementById('actorName');
const depthInput = document.getElementById('depth');
const cyContainer = document.getElementById('cy');
const findClusterBtn = document.getElementById('findClusterBtn');

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
        'text-halign': 'center',
        'text-margin-y': 22,
        shape: 'ellipse',
        width: 80,
        height: 80,
      }
    },
    {
      selector: 'node[type = "person"]',
      style: {
        'background-color': '#8ea2ff',
        'background-image': `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
            <circle cx="40" cy="28" r="22" fill="white" opacity="0.85"/>
            <text x="40" y="35" text-anchor="middle" font-size="22">👤</text>
          </svg>
        `)}`,
        'background-fit': 'cover',
        'background-clip': 'node',
        'background-width': '100%',
        'background-height': '100%',
      }
    },
    {
      selector: 'node[type = "movie"]',
      style: {
        'background-color': '#b7e4c7',
        'background-image': `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
            <circle cx="40" cy="28" r="22" fill="white" opacity="0.85"/>
            <text x="40" y="35" text-anchor="middle" font-size="22">🎬</text>
          </svg>
        `)}`,
        'background-fit': 'cover',
        'background-clip': 'node',
        'background-width': '100%',
        'background-height': '100%',
      }
    },

    {
      selector: 'node[type = "cluster"]',
      style: {
        label: 'data(label)',
        shape: 'round-rectangle',
        'background-color': '#f8f9fa',
        'background-opacity': 0.25,
        'border-color': '#ff6b6b',
        'border-width': 3,
        'border-style': 'dashed',
        padding: '40px',
        'text-valign': 'top',
        'text-halign': 'center',
        'text-margin-y': -10,
        'font-size': '14px',
        'font-weight': 'bold',
        color: '#333'
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
    },
    {
      id: 'remove-cluster',
      content: 'Remove cluster',
      selector: 'node[type = "cluster"]',
      onClickFunction: function (event) {
      const clusterNode = event.target || event.cyTarget;
  
      clusterNode.children().move({
        parent: null
      });

      clusterNode.remove();
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

findClusterBtn.addEventListener('click', async (event) => {
  cy.nodes('[type = "cluster"]').children().move({
    parent: null
  });

  cy.nodes('[type = "cluster"]').remove();

  const clusters = cy.elements().not('node[type = "cluster"]').markovClustering();

  clusters.forEach((cluster, index) => {
    const nodes = cluster.nodes();

    if (nodes.length < 2) {
      return;
    }

    const clusterId = `cluster:${index + 1}`;

    cy.add({
      group: 'nodes',
      data: {
        id: clusterId,
        label: `Cluster ${index + 1}`,
        type: 'cluster'
      }
    });

    nodes.forEach(node => {
      node.move({
        parent: clusterId
      });
    });
  });

  cy.layout({
    name: 'fcose',
    randomize: false,
    idealEdgeLength: () => 200,
    nodeRepulsion: () => 10000,
    gravity: 0.25
  }).run();
});

cy.on('click', event => {
  if (event.target === cy) {
    viewUtils.removeHighlights();
  }
});