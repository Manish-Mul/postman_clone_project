const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all global variables for user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT id, key, value, is_secret
    FROM global_variables
    WHERE user_id = ?
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Global vars fetch error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// UPSERT (SQLite style)
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;
  const { key, value, is_secret } = req.body;

  const sql = `
    INSERT INTO global_variables (user_id, key, value, is_secret)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, key)
    DO UPDATE SET 
      value = excluded.value,
      is_secret = excluded.is_secret
  `;

  db.run(sql, [userId, key, value, is_secret ? 1 : 0], err => {
    if (err) {
      console.error('Global vars upsert error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ key, value, is_secret: !!is_secret });
  });
});

// DELETE
router.delete('/:key', authenticateToken, (req, res) => {
  const userId = req.user.user_id;
  const key = req.params.key;

  const sql = `
    DELETE FROM global_variables
    WHERE user_id = ? AND key = ?
  `;

  db.run(sql, [userId, key], err => {
    if (err) {
      console.error('Global vars delete error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

module.exports = router;
