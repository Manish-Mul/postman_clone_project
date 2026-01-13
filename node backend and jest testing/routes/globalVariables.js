const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;

  db.query(
    'SELECT id, `key`, `value`, is_secret FROM global_variables WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// UPSERT
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;
  const { key, value, is_secret } = req.body;

  const sql = `
    INSERT INTO global_variables (user_id, \`key\`, \`value\`, is_secret)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      value = VALUES(value), 
      is_secret = VALUES(is_secret)
  `;

  db.query(sql, [userId, key, value, !!is_secret], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ key, value, is_secret });
  });
});

// DELETE
router.delete('/:key', authenticateToken, (req, res) => {
  const userId = req.user.user_id;

  db.query(
    'DELETE FROM global_variables WHERE user_id = ? AND `key` = ?',
    [userId, req.params.key],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
