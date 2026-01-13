const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE folder
router.post('/', (req, res) => {
  const { name, collection_id, parent_folder_id } = req.body;

  const result = db.prepare(`
    INSERT INTO folders (name, collection_id, parent_folder_id)
    VALUES (?, ?, ?)
  `).run(name, collection_id, parent_folder_id || null);

  res.json({
    id: result.lastInsertRowid,
    name,
    collection_id,
    parent_folder_id
  });
});

// READ all
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM folders').all();
  res.json(rows);
});

// READ one
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM folders WHERE id = ?').get(req.params.id);
  res.json(row);
});

// UPDATE
router.put('/:id', (req, res) => {
  const { name } = req.body;

  db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json({ message: 'Folder updated successfully' });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM folders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Folder deleted successfully' });
});

module.exports = router;
