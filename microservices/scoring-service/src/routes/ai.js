const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateJWT } = require('../middleware/auth');

router.post('/generate-pitch', authenticateJWT, async (req, res) => {
  try {
    const { score, suggestions } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Return an error if no API key is provided
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
      return res.status(400).json({ 
        error: 'MISSING_API_KEY', 
        message: 'Please setup your GEMINI_API_KEY in the scoring-service/.env file.' 
      });
    }

    // Call actual Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Write a polite, highly professional, 3-sentence introductory message in French to a landlord for a tenant. The tenant has a dossier score of ${score}/100. Based on these suggestions: ${suggestions.join(', ')}. Keep it extremely professional and do not use placeholders like [Your Name].`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ pitch: text, isMock: false });
  } catch (error) {
    console.error('Error generating AI pitch:', error);
    res.status(500).json({ error: 'Failed to generate pitch with AI' });
  }
});

module.exports = router;
