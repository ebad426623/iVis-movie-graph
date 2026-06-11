# iVis Movie Graph

## How to run

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
NEO4J_URI=your_neo4j_uri
NEO4J_USER=your_neo4j_user
NEO4J_PASSWORD=your_neo4j_password
```

Make sure your Neo4j database is running and the Movie dataset is loaded.

Start the app:

```bash
npm run dev
```

or:

```bash
npm start
```

Open this in your browser:

```text
http://localhost:3000
```
