const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// CREATE request
router.post('/', authenticateToken, (req, res) => {
  const { request_name, method, url, collection_id, folder_id } = req.body;
  const created_by = req.user.id;

  const result = db.prepare(`
    INSERT INTO requests (name, method, url, collection_id, folder_id, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(request_name, method, url, collection_id, folder_id, created_by);

  res.json({ id: result.lastInsertRowid, request_name });
});

// GET all requests
router.get('/', authenticateToken, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM requests WHERE created_by = ?
  `).all(req.user.id);

  res.json(rows);
});

// GET specific request
router.get('/:id', authenticateToken, (req, res) => {
  const row = db.prepare(`
    SELECT * FROM requests WHERE id = ? AND created_by = ?
  `).get(req.params.id, req.user.id);

  if (!row) return res.status(404).json({ error: 'Request not found' });
  res.json(row);
});

// UPDATE request
router.put('/:id', authenticateToken, (req, res) => {
  const { request_name, url } = req.body;
  const requestId = req.params.id;

  const result = db.prepare(`
    UPDATE requests SET name = ?, url = ?
    WHERE id = ? AND created_by = ?
  `).run(request_name, url, requestId, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Request not found or not authorized' });
  }

  res.json({ message: 'Request updated successfully' });
});

// DELETE request
router.delete('/:id', authenticateToken, (req, res) => {
  const requestId = req.params.id;

  const result = db.prepare(`
    DELETE FROM requests WHERE id = ? AND created_by = ?
  `).run(requestId, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Request not found or not authorized' });
  }

  res.json({ message: 'Request deleted successfully' });
});

module.exports = router;
