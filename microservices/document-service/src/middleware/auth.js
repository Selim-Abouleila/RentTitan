const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Middleware: Intercepts requests to verify the JSON Web Token (JWT) from the Authorization header.
// If valid, attaches the decoded user payload to req.user and allows the request to proceed. Otherwise, returns a 401/403 error.
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Access denied. Invalid token.' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Access denied. No token provided.' });
  }
};

module.exports = { authenticateJWT };
