const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all workspaces
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const rows = db.prepare(`
    SELECT * FROM workspaces
    WHERE created_by = ?
    ORDER BY created_at DESC
  `).all(userId);

  res.json(rows);
});

// CREATE workspace
router.post('/', authenticateToken, (req, res) => {
  const { workspace_name } = req.body;
  const userId = req.user.id;

  const result = db.prepare(`
    INSERT INTO workspaces (name, created_by, created_at)
    VALUES (?, ?, datetime('now'))
  `).run(workspace_name, userId);

  res.status(201).json({
    id: result.lastInsertRowid,
    name: workspace_name,
    created_by: userId
  });
});

// UPDATE workspace
router.put('/:id', authenticateToken, (req, res) => {
  const { workspace_name } = req.body;
  const workspaceId = req.params.id;
  const userId = req.user.id;

  const result = db.prepare(`
    UPDATE workspaces
    SET name = ?
    WHERE id = ? AND created_by = ?
  `).run(workspace_name, workspaceId, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  res.json({ message: 'Workspace updated successfully' });
});

// DELETE workspace
router.delete('/:id', authenticateToken, (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.id;

  const result = db.prepare(`
    DELETE FROM workspaces
    WHERE id = ? AND created_by = ?
  `).run(workspaceId, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Workspace not found' });
  }

  res.json({ message: 'Workspace deleted successfully' });
});

module.exports = router;
