const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE
router.post('/', (req, res) => {
  console.log("COLLECTION BODY:", req.body);
  const { collection_name, workspace_id, created_by } = req.body;
  db.query(
    'INSERT INTO collections (collection_name, workspace_id, created_by, created_at) VALUES (?, ?, ?, NOW())',
    [collection_name, workspace_id, created_by],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, collection_name });
    }
  );
});

// READ 
const { authenticateToken } = require('../middleware/auth');

// GET all collections (with their requests)
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;
  
  // First get all collections for the user
  const collectionsQuery = `
    SELECT * FROM collections 
    WHERE created_by = ? 
    ORDER BY created_at DESC
  `;
  
  db.query(collectionsQuery, [userId], (err, collections) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (collections.length === 0) {
      return res.json([]);
    }
    
    // Then get all requests for these collections
    const collectionIds = collections.map(c => c.collection_id);
    const requestsQuery = `
      SELECT * FROM requests 
      WHERE collection_id IN (?)
      ORDER BY created_at DESC
    `;
    
    db.query(requestsQuery, [collectionIds], (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Group requests by collection
      const collectionsWithRequests = collections.map(collection => ({
        ...collection,
        requests: requests.filter(r => r.collection_id === collection.collection_id)
      }));
      
      res.json(collectionsWithRequests);
    });
  });
});


// UPDATE
router.put('/:id', (req, res) => {
  const { collection_name } = req.body;
  db.query(
    'UPDATE collections SET collection_name = ? WHERE collection_id = ?',
    [collection_name, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Collection updated successfully' });
    }
  );
});

// DELETE
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM collections WHERE collection_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Collection deleted successfully' });
  });
});

module.exports = router;
