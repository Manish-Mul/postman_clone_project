const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE header
router.post('/', (req, res) => {
  const { request_id, key, value } = req.body;

  const result = db.prepare(`
    INSERT INTO request_headers (request_id, key, value)
    VALUES (?, ?, ?)
  `).run(request_id, key, value);

  res.json({ id: result.lastInsertRowid, key, value });
});

// READ all
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM request_headers').all();
  res.json(rows);
});

// READ by id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM request_headers WHERE id = ?').get(req.params.id);
  res.json(row);
});

// UPDATE
router.put('/:id', (req, res) => {
  const { key, value } = req.body;

  db.prepare(`
    UPDATE request_headers SET key = ?, value = ?
    WHERE id = ?
  `).run(key, value, req.params.id);

  res.json({ message: 'Header updated successfully' });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM request_headers WHERE id = ?').run(req.params.id);
  res.json({ message: 'Header deleted successfully' });
});

module.exports = router;
