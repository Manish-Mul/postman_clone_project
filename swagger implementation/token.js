const jwt = require('jsonwebtoken');
const user = {
  userId: 10,
  email: 'man@example.com'
};

// Generate the token
const token = jwt.sign(user, 'supersecretkey', { expiresIn: '1h' });

console.log('Generated JWT:', token);
