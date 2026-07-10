const jwt = require('jsonwebtoken');

// Middleware: Intercepts requests to verify the JSON Web Token (JWT) from the Authorization header.
// If valid, attaches the decoded user payload to req.user and allows the request to proceed. Otherwise, returns a 401/403 error.
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Format: Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Access denied - Invalid Token' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Access denied - No Token Provided' });
  }
};

module.exports = { authenticateJWT };
