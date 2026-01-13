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
const { authenticateToken } = require('../middleware/auth');

// CREATE
router.post('/', authenticateToken, (req, res) => {
  const { name, workspace_id } = req.body;
  const userId = req.user.id;

  const result = db.prepare(`
    INSERT INTO collections (name, workspace_id, created_by, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(name, workspace_id, userId);

  res.json({ id: result.lastInsertRowid, name });
});

// GET all collections with requests
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const collections = db.prepare(`
    SELECT * FROM collections
    WHERE created_by = ?
    ORDER BY created_at DESC
  `).all(userId);

  if (!collections.length) return res.json([]);

  const ids = collections.map(c => c.id);

  const requests = db.prepare(`
    SELECT * FROM requests WHERE collection_id IN (${ids.map(() => '?').join(',')})
  `).all(...ids);

  const result = collections.map(c => ({
    ...c,
    requests: requests.filter(r => r.collection_id === c.id)
  }));

  res.json(result);
});

// UPDATE
router.put('/:id', authenticateToken, (req, res) => {
  const { name } = req.body;

  db.prepare('UPDATE collections SET name = ? WHERE id = ?')
    .run(name, req.params.id);

  res.json({ message: 'Collection updated successfully' });
});

// DELETE
router.delete('/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM collections WHERE id = ?').run(req.params.id);
  res.json({ message: 'Collection deleted successfully' });
});

// EXPORT
router.get('/export', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const workspaceId = req.query.workspace_id;

  const collections = db.prepare(`
    SELECT * FROM collections WHERE created_by = ? AND workspace_id = ?
  `).all(userId, workspaceId);

  if (!collections.length) {
    return res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      workspace_id: workspaceId,
      collections: []
    });
  }

  const colIds = collections.map(c => c.id);

  const folders = db.prepare(`
    SELECT * FROM folders WHERE collection_id IN (${colIds.map(() => '?').join(',')})
  `).all(...colIds);

  const requests = db.prepare(`
    SELECT * FROM requests WHERE collection_id IN (${colIds.map(() => '?').join(',')})
  `).all(...colIds);

  const enriched = collections.map(c => ({
    ...c,
    folders: folders.filter(f => f.collection_id === c.id),
    requests: requests.filter(r => r.collection_id === c.id),
  }));

  res.setHeader('Content-Disposition', `attachment; filename="collections-${workspaceId}.json"`);
  res.json({
    version: 1,
    exportedAt: new Date().toISOString(),
    workspace_id: workspaceId,
    collections: enriched,
  });
});

// IMPORT
router.post('/import', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { workspace_id, collections } = req.body;

  const insertCollection = db.prepare(`
    INSERT INTO collections (name, workspace_id, created_by, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);

  const insertFolder = db.prepare(`
    INSERT INTO folders (name, collection_id, parent_folder_id)
    VALUES (?, ?, ?)
  `);

  const insertRequest = db.prepare(`
    INSERT INTO requests (name, method, url, collection_id, folder_id, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const tx = db.transaction(() => {
    const collectionMap = new Map();
    const folderMap = new Map();

    for (const col of collections) {
      const colRes = insertCollection.run(col.name, workspace_id, userId);
      collectionMap.set(col.id, colRes.lastInsertRowid);

      for (const f of col.folders || []) {
        const newParent = f.parent_folder_id ? folderMap.get(f.parent_folder_id) : null;
        const fRes = insertFolder.run(f.name, colRes.lastInsertRowid, newParent);
        folderMap.set(f.id, fRes.lastInsertRowid);
      }

      for (const r of col.requests || []) {
        const newFolder = r.folder_id ? folderMap.get(r.folder_id) : null;
        insertRequest.run(
          r.name,
          r.method,
          r.url,
          colRes.lastInsertRowid,
          newFolder,
          userId
        );
      }
    }
  });

  tx();
  res.json({ imported: collections.length });
});

module.exports = router;
