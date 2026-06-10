require('dotenv').config();

const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));


const { getSearchQuery } = require('./queries');
const { convertToCytoscape } = require('./cytoscapeConverter');

app.get('/api/health', async (req, res) => {
    try {
        await driver.verifyConnectivity();

        res.json({
            ok: true,
            message: 'Server is running and Neo4j is reachable'
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Neo4j is not reachable',
            error: error.message
        });
    }
});

app.get('/api/search', async (req, res) => {
    const actorName = req.query.actor;
    const depth = parseInt(req.query.depth, 10);
    const relationshipDepth = 2 * depth;
    
    const session = driver.session();
    try{
        const query = getSearchQuery(relationshipDepth);
        const result = await session.run(query, { actorName, relationshipDepth });

        const cypherResult = result.records.map(record => record.get('path'));
        const cytoscapeData = convertToCytoscape(cypherResult);

        res.json({
            message: 'Query executed successfully',
            recordCount: result.records.length,
            elements: cytoscapeData  
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: 'Failed to execute search query',
            error: error.message
        });
    } finally {
        await session.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});