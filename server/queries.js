function getSearchQuery(relationshipDepth) {
  return `
    MATCH path = (start:Person)-[:ACTED_IN*0..${relationshipDepth}]-(actor:Person)
    WHERE start.name = $actorName
    RETURN path
  `;
}

function getActorMoviesQuery() {
  return `
    MATCH path = (start:Person)-[:ACTED_IN]->(movie:Movie)
    WHERE start.name = $actorName
    RETURN path
  `;
}

function getMovieActorsQuery() {
  return `
    MATCH path = (start:Movie)<-[:ACTED_IN]-(actor:Person)
    WHERE start.title = $movieTitle
    RETURN path
  `;
}

module.exports = {
  getSearchQuery,
  getActorMoviesQuery,
  getMovieActorsQuery
};