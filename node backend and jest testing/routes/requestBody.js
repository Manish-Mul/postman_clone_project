const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { request_id, body_type, content } = req.body;
  db.query(
    'INSERT INTO request_body (request_id, body_type, content) VALUES (?, ?, ?)',
    [request_id, body_type, content],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, body_type, content });
    }
  );
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM request_body', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM request_body WHERE body_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows[0]);
  });
});

router.put('/:id', (req, res) => {
  const { body_type, content } = req.body;
  db.query(
    'UPDATE request_body SET body_type = ?, content = ? WHERE body_id = ?',
    [body_type, content, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Body updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM request_body WHERE body_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Body deleted successfully' });
  });
});

module.exports = router;
