const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authenticateJWT } = require('./middleware/auth');
const { calculateScore } = require('./scoringEngine');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// 1. REST API Paradigm
app.get('/api/v1/dossier-score', authenticateJWT, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Fetch data using the same token (Token Forwarding pattern)
    const [dossierRes, checklistRes] = await Promise.all([
      fetch('http://localhost:5000/dossiers', { headers: { 'Authorization': authHeader } }),
      fetch('http://localhost:5001/status', { headers: { 'Authorization': authHeader } })
    ]);

    const dossier = dossierRes.ok ? await dossierRes.json() : null;
    const checklist = checklistRes.ok ? await checklistRes.json() : {};

    const scoreData = calculateScore(dossier, checklist);
    res.json(scoreData);
  } catch (error) {
    console.error('REST API Error calculating score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GraphQL API Paradigm
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract token and pass it to resolvers
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1] || '';
        return { token };
      },
    })
  );

  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Scoring Service running on port ${PORT}`);
    console.log(`GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
