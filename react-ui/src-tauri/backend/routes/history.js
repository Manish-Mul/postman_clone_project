const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// CREATE history
router.post('/', authenticateToken, (req, res) => {
  const {
    method,
    url,
    headers,
    params,
    body,
    response_status,
    response_time_ms,
    workspace_id
  } = req.body;

  const user_id = req.user.id;

  const result = db.prepare(`
    INSERT INTO request_history
    (user_id, workspace_id, method, url, headers, params, body, response_status, response_time_ms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    user_id,
    workspace_id,
    method,
    url,
    headers ? JSON.stringify(headers) : null,
    params ? JSON.stringify(params) : null,
    body ? JSON.stringify(body) : null,
    response_status || null,
    response_time_ms || null
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    message: 'Saved to history'
  });
});

// READ all history for user
router.get('/', authenticateToken, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM request_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).all(req.user.id);

  res.json(rows);
});

// READ single history item
router.get('/:id', authenticateToken, (req, res) => {
  const row = db.prepare(`
    SELECT * FROM request_history
    WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.id);

  if (!row) return res.status(404).json({ message: 'History item not found' });
  res.json(row);
});

// DELETE all history for workspace
router.delete('/workspace/:workspaceId', authenticateToken, (req, res) => {
  db.prepare(`
    DELETE FROM request_history
    WHERE user_id = ? AND workspace_id = ?
  `).run(req.user.id, req.params.workspaceId);

  res.json({ message: 'History cleared' });
});

// DELETE single history item
router.delete('/:id', authenticateToken, (req, res) => {
  db.prepare(`
    DELETE FROM request_history
    WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id);

  res.json({ message: 'History item deleted' });
});

module.exports = router;
