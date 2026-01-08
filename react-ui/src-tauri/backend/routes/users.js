const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

// Secret key for JWT 
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// LOGIN 
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (results.length === 0) return res.status(401).json({ error: 'User not found' });
    
    const user = results[0];
    
    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err) return res.status(500).json({ error: 'Bcrypt error' });
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.user_id, 
          email: user.email,
          username: user.username 
        },
        JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
      );
      
      // Return token 
      res.json({ 
        token,
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email
        }
      });
    });
  });
});


// CREATE (register)
router.post('/', async (req, res) => {
  const { username, email, password_hash } = req.body;
  try {
    const hash = await bcrypt.hash(password_hash, 10);
    db.query(
      'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hash],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'User/email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: result.insertId, username, email });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

// READ ALL
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// READ by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM users WHERE user_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows[0]);
  });
});

// UPDATE
router.put('/:id', (req, res) => {
  const { username, email } = req.body;
  db.query(
    'UPDATE users SET username = ?, email = ? WHERE user_id = ?',
    [username, email, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User updated successfully' });
    }
  );
});

// DELETE
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM users WHERE user_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
