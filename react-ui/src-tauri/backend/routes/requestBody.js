const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE body
router.post('/', (req, res) => {
  const { request_id, body_type, content } = req.body;

  const result = db.prepare(`
    INSERT INTO request_body (request_id, body_type, content)
    VALUES (?, ?, ?)
  `).run(request_id, body_type, content);

  res.json({ id: result.lastInsertRowid, body_type, content });
});

// READ all
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM request_body').all();
  res.json(rows);
});

// READ by id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM request_body WHERE id = ?').get(req.params.id);
  res.json(row);
});

// UPDATE
router.put('/:id', (req, res) => {
  const { body_type, content } = req.body;

  db.prepare(`
    UPDATE request_body SET body_type = ?, content = ?
    WHERE id = ?
  `).run(body_type, content, req.params.id);

  res.json({ message: 'Body updated successfully' });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM request_body WHERE id = ?').run(req.params.id);
  res.json({ message: 'Body deleted successfully' });
});

module.exports = router;
