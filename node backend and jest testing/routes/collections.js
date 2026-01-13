// type ExportedCollection = {
//   collection_id: number;
//   collection_name: string;
//   workspace_id: number | string;
//   folders: {
//     folder_id: number;
//     folder_name: string;
//     parent_folder_id: number | null;
//   }[];
//   requests: {
//     request_id: number;
//     request_name: string;
//     method: string;
//     url: string;
//     folder_id: number | null;
//     params: string | null;
//     body: string | null;
//   }[];
// };

// type CollectionsExport = {
//   version: 1;
//   exportedAt: string;
//   workspace_id: number | string;
//   collections: ExportedCollection[];
// };

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

// GET /collections/export?workspace_id=...
router.get('/export', authenticateToken, (req, res) => {
  console.log('HIT /collections/export');
  const userId = req.user.user_id;
  const workspaceId = req.query.workspace_id;

  const collectionsQuery = `
    SELECT * FROM collections
    WHERE created_by = ? AND workspace_id = ?
    ORDER BY created_at DESC
  `;

  db.query(collectionsQuery, [userId, workspaceId], (err, collections) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!collections.length) {
      return res.json({
        version: 1,
        exportedAt: new Date().toISOString(),
        workspace_id: workspaceId,
        collections: [],
      });
    }

    const collectionIds = collections.map(c => c.collection_id);

    db.query(
      'SELECT * FROM requests WHERE collection_id IN (?)',
      [collectionIds],
      (err2, requests) => {
        if (err2) return res.status(500).json({ error: err2.message });

        db.query(
          'SELECT * FROM folders WHERE collection_id IN (?)',
          [collectionIds],
          (err3, folders) => {
            if (err3) return res.status(500).json({ error: err3.message });

            const enriched = collections.map(c => ({
              ...c,
              folders: folders.filter(f => f.collection_id === c.collection_id),
              requests: requests.filter(r => r.collection_id === c.collection_id),
            }));

            const payload = {
              version: 1,
              exportedAt: new Date().toISOString(),
              workspace_id: workspaceId,
              collections: enriched,
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename="collections-${workspaceId}.json"`
            );
            res.json(payload);
          }
        );
      }
    );
  });
});

// POST /collections/import
router.post('/import', authenticateToken, (req, res) => {
  console.log('HIT /collections/import');
  console.log('Import body:', req.body);

  try {
    const userId = req.user.user_id;
    const { workspace_id, collections, version } = req.body;

    if (!workspace_id || !Array.isArray(collections)) {
      return res.status(400).json({ error: 'Invalid import payload' });
    }

    const createdCollections = [];
    const collectionIdMap = new Map();
    const folderIdMap = new Map();

    const insertNextCollection = (idx) => {
      if (idx >= collections.length) {
        // ✅ single success response here
        return res.status(200).json({ imported: createdCollections.length });
      }

      const col = collections[idx];
      db.query(
        'INSERT INTO collections (collection_name, workspace_id, created_by, created_at) VALUES (?, ?, ?, NOW())',
        [col.collection_name, workspace_id, userId],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          const newCollectionId = result.insertId;
          collectionIdMap.set(col.collection_id, newCollectionId);
          createdCollections.push(newCollectionId);

          const colFolders = col.folders || [];
          const insertFolders = (fIdx) => {
            if (fIdx >= colFolders.length) {
              const colRequests = col.requests || [];
              const insertRequests = (rIdx) => {
                if (rIdx >= colRequests.length) {
                  return insertNextCollection(idx + 1);
                }
                const r = colRequests[rIdx];
                const mappedFolderId =
                  r.folder_id != null ? folderIdMap.get(r.folder_id) || null : null;

                db.query(
                  'INSERT INTO requests (request_name, method, url, collection_id, folder_id, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                  [
                    r.request_name,
                    r.method,
                    r.url,
                    newCollectionId,
                    mappedFolderId,
                    userId,
                  ],
                  (errR) => {
                    if (errR) return res.status(500).json({ error: errR.message });
                    insertRequests(rIdx + 1);
                  }
                );
              };
              return insertRequests(0);
            }

            const f = colFolders[fIdx];
            const parentNewId =
              f.parent_folder_id != null ? folderIdMap.get(f.parent_folder_id) || null : null;

            db.query(
              'INSERT INTO folders (folder_name, collection_id, parent_folder_id, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
              [f.folder_name, newCollectionId, parentNewId, userId],
              (errF, resultF) => {
                if (errF) return res.status(500).json({ error: errF.message });
                folderIdMap.set(f.folder_id, resultF.insertId);
                insertFolders(fIdx + 1);
              }
            );
          };

          insertFolders(0);
        }
      );
    };

    insertNextCollection(0);
  } catch (err) {
    console.error('Import error:', err);
    return res.status(500).json({ error: 'Import failed' });
  }
});

module.exports = router;
