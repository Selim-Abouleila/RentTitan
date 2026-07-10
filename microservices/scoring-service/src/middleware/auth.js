const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Access denied: Invalid token' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Access denied: No token provided' });
  }
};

module.exports = { authenticateJWT };
