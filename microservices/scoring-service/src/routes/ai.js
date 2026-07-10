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

    const prompt = `Write a polite, highly professional, 3-sentence introductory message in French to a landlord for a tenant. The tenant has a dossier score of ${score}/100. Based on these strengths and suggestions: ${suggestions.join(', ')}. Keep it extremely professional and do not use placeholders like [Your Name].`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      res.json({ pitch: response.text, isMock: false });
    } catch (apiError) {
      console.warn('Gemini API Error (likely quota limit), falling back to offline mock:', apiError.message);
      
      const mockPitch = `Madame, Monsieur,\n\nJe me permets de vous soumettre mon dossier de location pour cet appartement. J'ai un profil financier très solide avec un score RentTitan de ${score}/100. Je suis à votre entière disposition pour toute visite ou information complémentaire.\n\nBien cordialement.`;
      
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
