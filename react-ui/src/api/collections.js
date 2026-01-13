// src/api/collections.js
const API_BASE = 'http://localhost:3000';

export async function exportCollections(workspaceId, token) {
  const res = await fetch(`${API_BASE}/collections/export?workspace_id=${workspaceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  return res.json(); // { version, exportedAt, workspace_id, collections }
}

export async function importCollections(workspaceId, exportedData, token) {
  const res = await fetch(`${API_BASE}/collections/import`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspace_id: workspaceId,
      collections: exportedData.collections,
      version: exportedData.version,
    }),
  });
  if (!res.ok) throw new Error('Import failed');
  return res.json(); // { imported: N }
}
