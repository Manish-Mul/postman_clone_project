// const express = require('express');
// const router = express.Router();
// const db = require('../db');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// // LOGIN
// router.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
//   if (!user) return res.status(401).json({ error: 'User not found' });

//   const match = bcrypt.compareSync(password, user.password_hash);
//   if (!match) return res.status(401).json({ error: 'Invalid credentials' });

//   const token = jwt.sign(
//     {
//       id: user.id,
//       email: user.email,
//       username: user.username
//     },
//     JWT_SECRET,
//     { expiresIn: '7d' }
//   );

//   res.json({
//     token,
//     user: {
//       id: user.id,
//       username: user.username,
//       email: user.email
//     }
//   });
// });

// // CREATE (register)
// router.post('/', (req, res) => {
//   const { username, email, password_hash } = req.body;
//   try {
//     const hash = bcrypt.hashSync(password_hash, 10);

//     const result = db.prepare(`
//       INSERT INTO users (username, email, password_hash, created_at)
//       VALUES (?, ?, ?, datetime('now'))
//     `).run(username, email, hash);

//     res.json({ id: result.lastInsertRowid, username, email });
//   } catch (err) {
//     if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
//       return res.status(409).json({ error: 'User/email already exists' });
//     }
//     res.status(500).json({ error: err.message });
//   }
// });

// // READ ALL
// router.get('/', (req, res) => {
//   const rows = db.prepare('SELECT * FROM users').all();
//   res.json(rows);
// });

// // READ by ID
// router.get('/:id', (req, res) => {
//   const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
//   res.json(row);
// });

// // UPDATE
// router.put('/:id', (req, res) => {
//   const { username, email } = req.body;

//   db.prepare(
//     'UPDATE users SET username = ?, email = ? WHERE id = ?'
//   ).run(username, email, req.params.id);

//   res.json({ message: 'User updated successfully' });
// });

// // DELETE
// router.delete('/:id', (req, res) => {
//   db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
//   res.json({ message: 'User deleted successfully' });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key_here";

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);
    stmt.run(username, email, hash);

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "User already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, username: user.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email
    }
  });
});

module.exports = router;
