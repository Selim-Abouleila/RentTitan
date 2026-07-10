const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authenticateJWT } = require('./middleware/auth');
const aiRouter = require('./routes/ai');
const { calculateScore } = require('./scoringEngine');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/v1/ai', aiRouter);

// 1. REST API Paradigm: Exposes the dossier score calculation via a standard HTTP GET endpoint.
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

// 2. GraphQL API Paradigm: Exposes a flexible data-fetching interface for the frontend to query the score and suggestions.
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

  const PORT = process.env.SCORING_PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Scoring Service running on port ${PORT}`);
    console.log(`GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
