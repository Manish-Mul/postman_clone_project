const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE
router.post('/', (req, res) => {
  console.log("FOLDER BODY:", req.body);

  const { folder_name, collection_id, parent_folder_id, created_by } = req.body;

  db.query(
    'INSERT INTO folders (folder_name, collection_id, parent_folder_id, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
    [folder_name, collection_id, parent_folder_id || null, created_by],
    (err, result) => {
      if (err) {
        console.error("Folder insert error:", err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        id: result.insertId,
        folder_name,
        collection_id,
        parent_folder_id
      });
    }
  );
});

// READ ALL
router.get('/', (req, res) => {
  db.query('SELECT * FROM folders', (err, rows) => {
    if (err) {
      console.error("Error during SELECT:", err); // Log error to console
      return res.status(500).json({ message: 'Database error during SELECT', error: err });
    }
    res.json(rows);
  });
});

// READ ONE
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM folders WHERE folder_id = ?', [req.params.id], (err, rows) => {
    if (err) {
      console.error("Error during SELECT by ID:", err); // Log error to console
      return res.status(500).json({ message: 'Database error during SELECT by ID', error: err });
    }
    res.json(rows[0]);
  });
});

// UPDATE
router.put('/:id', (req, res) => {
  const { folder_name } = req.body;
  db.query(
    'UPDATE folders SET folder_name = ? WHERE folder_id = ?',
    [folder_name, req.params.id],
    (err) => {
      if (err) {
        console.error("Error during UPDATE:", err); // Log error to console
        return res.status(500).json({ message: 'Database error during UPDATE', error: err });
      }
      res.json({ message: 'Folder updated successfully' });
    }
  );
});

// DELETE
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM folders WHERE folder_id = ?', [req.params.id], (err) => {
    if (err) {
      console.error("Error during DELETE:", err); // Log error to console
      return res.status(500).json({ message: 'Database error during DELETE', error: err });
    }
    res.json({ message: 'Folder deleted successfully' });
  });
});

module.exports = router;
