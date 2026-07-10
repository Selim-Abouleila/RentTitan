const typeDefs = `#graphql
  type DossierScore {
    score: Int!
    missingDocuments: [String]!
    suggestions: [String]!
  }

  type Query {
    myDossier: DossierScore
  }
`;

module.exports = { typeDefs };
