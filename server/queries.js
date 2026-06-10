function getSearchQuery(relationshipDepth) {
  return `
    MATCH path = (start:Person)-[:ACTED_IN*0..${relationshipDepth}]-(actor:Person)
    WHERE start.name = $actorName
    RETURN path
  `;
}

module.exports = {
  getSearchQuery
};