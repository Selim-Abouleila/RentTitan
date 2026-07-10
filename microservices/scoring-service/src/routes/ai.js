const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { authenticateJWT } = require('../middleware/auth');

router.post('/generate-pitch', authenticateJWT, async (req, res) => {
  try {
    const { score, suggestions } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Return an error if no API key is provided
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ 
        error: 'MISSING_API_KEY', 
        message: 'Please setup your GEMINI_API_KEY in the root .env file.' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 1) Forward the user's JWT to fetch their real financial data from the Main Backend
    let financialContext = '';
    let mockContext = "J'ai un profil financier très solide.";
    
    try {
      const authHeader = req.headers.authorization;
      const dossierRes = await fetch('http://localhost:5000/dossiers', {
        headers: { Authorization: authHeader }
      });
      
      if (dossierRes.ok) {
        const dossier = await dossierRes.json();
        financialContext = `The tenant has a monthly income of €${dossier.monthlyIncome}, is aiming for a rent of €${dossier.targetRent}, and their employment status is ${dossier.employmentStatus}.`;
        mockContext = `J'ai un profil financier solide avec un revenu mensuel de ${dossier.monthlyIncome}€ (statut: ${dossier.employmentStatus}).`;
        
        if (dossier.guarantors && dossier.guarantors.length > 0) {
          const guarantorIncome = dossier.guarantors[0].monthlyIncome;
          financialContext += ` They also have a solid guarantor with a monthly income of €${guarantorIncome}.`;
          mockContext += ` Je dispose également d'un garant avec un revenu de ${guarantorIncome}€ mensuels.`;
        }
      }
    } catch (err) {
      console.warn('Warning: Could not fetch real financial data for AI prompt', err.message);
    }

    // 2) Build the highly personalized prompt
    const prompt = `Write a polite, highly professional, 3-sentence introductory message in French to a landlord for a tenant. ${financialContext} Emphasize their reliability. Keep it extremely professional and do not use placeholders like [Your Name] or mention arbitrary scores.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      res.json({ pitch: response.text, isMock: false });
    } catch (apiError) {
      console.warn('Gemini API Error (likely quota limit), falling back to offline mock:', apiError.message);
      
      const mockPitch = `Madame, Monsieur,\n\nJe me permets de vous soumettre mon dossier de location pour cet appartement. ${mockContext} Je suis à votre entière disposition pour toute visite ou information complémentaire.\n\nBien cordialement.`;
      
      // Simulate an AI generation delay for the presentation
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({ pitch: mockPitch, isMock: true });
    }
  } catch (error) {
    console.error('Error in AI router:', error);
    res.status(500).json({ error: 'Failed to generate pitch', message: error.message });
  }
});

module.exports = router;
