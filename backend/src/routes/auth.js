const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initiates the Google OAuth 2.0 flow by redirecting the user to Google's consent screen.
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback URL for Google OAuth; issues a JWT token upon successful authentication and redirects to the frontend.
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // Redirect to frontend with token (in query string or using a cookie)
    // For MVP, we send it in the URL so the frontend can capture it and store it in localStorage
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
  }
);

// Protected test route to demo API-as-a-service protected by JWT
const { authenticateJWT } = require('../middleware/auth');
router.get('/protected-demo', authenticateJWT, (req, res) => {
  res.json({ message: 'Success! You have accessed a protected route.', user: req.user });
});

module.exports = router;
