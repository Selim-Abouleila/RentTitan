const { calculateScore } = require('../scoringEngine');

const resolvers = {
  Query: {
    // myDossier Resolver: Uses Token Forwarding to fetch financial and document data from the other microservices, then calculates the score.
    myDossier: async (_, __, context) => {
      if (!context.token) {
        throw new Error('Access denied: No token provided');
      }

      const headers = { 'Authorization': `Bearer ${context.token}` };

      try {
        const [dossierRes, checklistRes] = await Promise.all([
          fetch('http://localhost:5000/dossiers', { headers }),
          fetch('http://localhost:5001/status', { headers })
        ]);

        const dossier = dossierRes.ok ? await dossierRes.json() : null;
        const checklist = checklistRes.ok ? await checklistRes.json() : {};

        return calculateScore(dossier, checklist);
      } catch (error) {
        console.error('GraphQL Error fetching data:', error);
        throw new Error('Failed to calculate score');
      }
    }
  }
};

module.exports = { resolvers };
