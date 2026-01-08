const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { env_id, key, value } = req.body;
  db.query(
    'INSERT INTO environment_variables (env_id, key, value) VALUES (?, ?, ?)',
    [env_id, key, value],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, key, value });
    }
  );
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM environment_variables', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM environment_variables WHERE variable_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows[0]);
  });
});

router.put('/:id', (req, res) => {
  const { key, value } = req.body;
  db.query(
    'UPDATE environment_variables SET key = ?, value = ? WHERE variable_id = ?',
    [key, value, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Environment variable updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM environment_variables WHERE variable_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Environment variable deleted successfully' });
  });
});

module.exports = router;
