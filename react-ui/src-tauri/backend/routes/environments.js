const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all environments with variables
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const environments = db.prepare(`
    SELECT * FROM environments
    WHERE created_by = ?
    ORDER BY id DESC
  `).all(userId);

  if (!environments.length) return res.json([]);

  const envIds = environments.map(e => e.id);

  const vars = db.prepare(`
    SELECT * FROM environment_variables
    WHERE env_id IN (${envIds.map(() => '?').join(',')})
  `).all(...envIds);

  const result = environments.map(env => ({
    ...env,
    variables: vars
      .filter(v => v.env_id === env.id)
      .map(v => ({
        key: v.key,
        value: v.value,
        isSecret: !!v.is_secret
      }))
  }));

  res.json(result);
});

// CREATE environment
router.post('/', authenticateToken, (req, res) => {
  const { name, workspace_id, variables } = req.body;
  const userId = req.user.id;

  const insertEnv = db.prepare(`
    INSERT INTO environments (name, workspace_id, created_by)
    VALUES (?, ?, ?)
  `);

  const insertVar = db.prepare(`
    INSERT INTO environment_variables (env_id, key, value, is_secret)
    VALUES (?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const envRes = insertEnv.run(name, workspace_id, userId);
    const envId = envRes.lastInsertRowid;

    if (variables && variables.length) {
      for (const v of variables) {
        if (v.key && v.key.trim()) {
          insertVar.run(envId, v.key, v.value || '', v.isSecret ? 1 : 0);
        }
      }
    }

    return envId;
  });

  const envId = tx();

  res.status(201).json({ id: envId, name, workspace_id, variables: variables || [] });
});

// UPDATE environment
router.put('/:id', authenticateToken, (req, res) => {
  const { name, variables } = req.body;
  const envId = req.params.id;
  const userId = req.user.id;

  const updateEnv = db.prepare(`
    UPDATE environments SET name = ? WHERE id = ? AND created_by = ?
  `);

  const deleteVars = db.prepare(`DELETE FROM environment_variables WHERE env_id = ?`);

  const insertVar = db.prepare(`
    INSERT INTO environment_variables (env_id, key, value, is_secret)
    VALUES (?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const result = updateEnv.run(name, envId, userId);
    if (result.changes === 0) throw new Error('Not found');

    deleteVars.run(envId);

    if (variables && variables.length) {
      for (const v of variables) {
        if (v.key && v.key.trim()) {
          insertVar.run(envId, v.key, v.value || '', v.isSecret ? 1 : 0);
        }
      }
    }
  });

  try {
    tx();
    res.json({ message: 'Environment updated successfully', id: envId });
  } catch {
    res.status(404).json({ error: 'Environment not found' });
  }
});

// DELETE environment
router.delete('/:id', authenticateToken, (req, res) => {
  const envId = req.params.id;
  const userId = req.user.id;

  const result = db.prepare(`
    DELETE FROM environments WHERE id = ? AND created_by = ?
  `).run(envId, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Environment not found' });
  }

  res.json({ message: 'Environment deleted successfully' });
});

module.exports = router;
