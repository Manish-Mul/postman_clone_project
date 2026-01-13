const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE
router.post('/', (req, res) => {
  const { env_id, key, value, isSecret } = req.body;

  const result = db.prepare(`
    INSERT INTO environment_variables (env_id, key, value, is_secret)
    VALUES (?, ?, ?, ?)
  `).run(env_id, key, value || '', isSecret ? 1 : 0);

  res.json({ id: result.lastInsertRowid, key, value });
});

// READ all
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM environment_variables').all();
  res.json(rows);
});

// READ by id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM environment_variables WHERE id = ?').get(req.params.id);
  res.json(row);
});

// UPDATE
router.put('/:id', (req, res) => {
  const { key, value, isSecret } = req.body;

  db.prepare(`
    UPDATE environment_variables
    SET key = ?, value = ?, is_secret = ?
    WHERE id = ?
  `).run(key, value || '', isSecret ? 1 : 0, req.params.id);

  res.json({ message: 'Environment variable updated successfully' });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM environment_variables WHERE id = ?').run(req.params.id);
  res.json({ message: 'Environment variable deleted successfully' });
});

module.exports = router;
