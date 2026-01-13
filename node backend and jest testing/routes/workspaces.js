const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all workspaces 
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;

  const sql = `SELECT * FROM workspaces 
    WHERE created_by = ? 
    ORDER BY created_at DESC`;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching workspaces:', err);
      return res.status(500).json({ error: err.message });
    }
    return res.json(rows);
  });
});

// CREATE workspace
router.post('/', authenticateToken, (req, res) => {
  const { workspace_name } = req.body;
  const userId = req.user.user_id;

  const sql = `INSERT INTO workspaces 
    (workspace_name, created_by, created_at) 
    VALUES (?, ?, NOW())`;

  db.query(sql, [workspace_name, userId], (err, result) => {
    if (err) {
      console.error('Workspace creation error:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      workspace_id: result.insertId,
      workspace_name,
      created_by: userId
    });
  });
});

// UPDATE workspace
router.put('/:id', authenticateToken, (req, res) => {
  const { workspace_name } = req.body;
  const workspaceId = req.params.id;
  const userId = req.user.user_id;

  const sql = `UPDATE workspaces 
    SET workspace_name = ? 
    WHERE workspace_id = ? AND created_by = ?`;

  db.query(sql, [workspace_name, workspaceId, userId], (err, result) => {
    if (err) {
      console.error('Workspace update error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    console.log('Workspace updated successfully');
    res.json({ message: 'Workspace updated successfully' });
  });
});

// DELETE workspace
router.delete('/:id', authenticateToken, (req, res) => {
  const workspaceId = req.params.id;
  const userId = req.user.user_id;

  const sql = `DELETE FROM workspaces 
    WHERE workspace_id = ? AND created_by = ?`;

  db.query(sql, [workspaceId, userId], (err, result) => {
    if (err) {
      console.error('Workspace deletion error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    console.log('Workspace deleted successfully');
    res.json({ message: 'Workspace deleted successfully' });
  });
});

module.exports = router;
