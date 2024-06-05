const jwt = require('jsonwebtoken');
const User = require('./userModel'); // Adjust the path as necessary

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = { userId: decoded.userId };
    next();
  });
};

module.exports = { authenticateToken };
