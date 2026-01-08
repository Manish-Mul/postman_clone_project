const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { request_id, status_code, response_body, response_time_ms } = req.body;
  db.query(
    'INSERT INTO responses (request_id, status_code, response_body, response_time_ms, created_at) VALUES (?, ?, ?, ?, NOW())',
    [request_id, status_code, response_body, response_time_ms],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, status_code });
    }
  );
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM responses', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.query('SELECT * FROM responses WHERE response_id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows[0]);
  });
});

router.put('/:id', (req, res) => {
  const { response_body } = req.body;
  db.query(
    'UPDATE responses SET response_body = ? WHERE response_id = ?',
    [response_body, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Response updated successfully' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM responses WHERE response_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Response deleted successfully' });
  });
});

module.exports = router;
