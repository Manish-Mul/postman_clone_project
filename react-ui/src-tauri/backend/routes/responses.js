const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE response
router.post('/', (req, res) => {
  const { request_id, status_code, response_body, response_time_ms } = req.body;

  const result = db.prepare(`
    INSERT INTO responses (request_id, status_code, response_body, response_time_ms, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(request_id, status_code, response_body, response_time_ms);

  res.json({ id: result.lastInsertRowid, status_code });
});

// READ all
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM responses').all();
  res.json(rows);
});

// READ by id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM responses WHERE id = ?').get(req.params.id);
  res.json(row);
});

// UPDATE
router.put('/:id', (req, res) => {
  const { response_body } = req.body;

  db.prepare(`
    UPDATE responses
    SET response_body = ?
    WHERE id = ?
  `).run(response_body, req.params.id);

  res.json({ message: 'Response updated successfully' });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM responses WHERE id = ?').run(req.params.id);
  res.json({ message: 'Response deleted successfully' });
});

module.exports = router;
