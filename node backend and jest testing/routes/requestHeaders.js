const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { request_id, key, value } = req.body;
  db.query(
    'INSERT INTO request_headers (request_id, key, value) VALUES (?, ?, ?)',
    [request_id, key, value],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, key, value });
    }
  );
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM request_headers', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM request_headers WHERE header_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows[0]);
  });
});

router.put('/:id', (req, res) => {
  const { key, value } = req.body;
  db.query(
    'UPDATE request_headers SET key = ?, value = ? WHERE header_id = ?',
    [key, value, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Header updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM request_headers WHERE header_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Header deleted successfully' });
  });
});

module.exports = router;
