const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// CREATE - Save to history
router.post('/', authenticateToken, (req, res) => {
  const { method, url, headers, params, body, response_status, response_time, workspace_id } = req.body;
  const user_id = req.user.user_id;
  
  const sql = `INSERT INTO history 
    (user_id, workspace_id, method, url, headers, params, body, response_status, response_time, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
  
  db.query(sql, [
    user_id,
    workspace_id,
    method,
    url,
    headers ? JSON.stringify(headers) : null,
    params || null,
    body ? JSON.stringify(body) : null,
    response_status || null,
    response_time || null
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      history_id: result.insertId,
      message: 'Saved to history'
    });
  });
});

// GET - Fetch all history for user
router.get('/', authenticateToken, (req, res) => {
  const user_id = req.user.user_id;
  
  const sql = `SELECT * FROM history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 100`;
  
  db.query(sql, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET - Fetch a single history item by its ID
router.get('/:id', authenticateToken, (req, res) => {
  const history_id = req.params.id; 
  const user_id = req.user.user_id; 
  
  const sql = `SELECT * FROM history WHERE history_id = ? AND user_id = ?`;
  
  db.query(sql, [history_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Check if the history item exists
    if (rows.length === 0) {
      return res.status(404).json({ message: 'History item not found' });
    }
    
    res.json(rows[0]); 
  });
});

// DELETE - Clear all history for workspace
router.delete('/workspace/:workspaceId', authenticateToken, (req, res) => {
  const user_id = req.user.user_id;
  const workspace_id = req.params.workspaceId;
  
  db.query('DELETE FROM history WHERE user_id = ? AND workspace_id = ?', [user_id, workspace_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'History cleared' });
  });
});

// DELETE - Delete single history item
router.delete('/:id', authenticateToken, (req, res) => {
  const history_id = req.params.id;
  const user_id = req.user.user_id;
  
  db.query('DELETE FROM history WHERE history_id = ? AND user_id = ?', [history_id, user_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'History item deleted' });
  });
});

module.exports = router;
