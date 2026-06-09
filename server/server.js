require('dotenv').config();

const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();

const PORT = process.env.PORT || 3000;
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));


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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});