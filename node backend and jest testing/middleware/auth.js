const jwt = require('jsonwebtoken');
const SECRET_KEY = "your_secret_key_here";

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware triggered');
  console.log('Authorization header:', authHeader);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Invalid token:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    console.log('Token verified for user:', user);
    next();
  });
}

module.exports = { authenticateToken };
