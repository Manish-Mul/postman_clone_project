const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// CREATE request
router.post('/', authenticateToken, (req, res) => {
  const { request_name, method, url, collection_id, folder_id } = req.body;
  const created_by = req.user.user_id;  

  db.query(
    'INSERT INTO requests (request_name, method, url, collection_id, folder_id, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [request_name, method, url, collection_id, folder_id, created_by],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, request_name });
    }
  );
});

// GET all requests 
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM requests WHERE created_by = ?', [req.user.user_id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// GET a specific request by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.query('SELECT * FROM requests WHERE request_id = ? AND created_by = ?', 
    [req.params.id, req.user.user_id], (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ error: 'Request not found' });
      res.json(rows[0]);
    });
});

// UPDATE request
router.put('/:id', authenticateToken, (req, res) => {
  const { request_name, url } = req.body;
  const requestId = req.params.id;

  db.query(
    'UPDATE requests SET request_name = ?, url = ? WHERE request_id = ? AND created_by = ?',
    [request_name, url, requestId, req.user.user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found or not authorized' });
      res.json({ message: 'Request updated successfully' });
    }
  );
});

// DELETE request
router.delete('/:id', authenticateToken, (req, res) => {
  const requestId = req.params.id;

  db.query(
    'DELETE FROM requests WHERE request_id = ? AND created_by = ?',
    [requestId, req.user.user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Request not found or not authorized' });
      res.json({ message: 'Request deleted successfully' });
    }
  );
});

module.exports = router;
