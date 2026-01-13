const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all environments with variables for authenticated user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.user_id;

  const envQuery = `
    SELECT * FROM environments 
    WHERE created_by = ? 
    ORDER BY env_id DESC
  `;

  db.query(envQuery, [userId], (err, environments) => {
    if (err) {
      console.error('Error fetching environments:', err);
      return res.status(500).json({ error: err.message });
    }

    if (environments.length === 0) {
      return res.json([]);
    }

    const envIds = environments.map(e => e.env_id);
    const varsQuery = `
      SELECT * FROM environment_variables 
      WHERE env_id IN (?)
    `;

    db.query(varsQuery, [envIds], (err, variables) => {
      if (err) {
        console.error('Error fetching variables:', err);
        return res.status(500).json({ error: err.message });
      }

      const envsWithVars = environments.map(env => ({
        ...env,
        variables: variables
          .filter(v => v.env_id === env.env_id)
          .map(v => ({
            key: v.key,
            value: v.value,
            isSecret: !!v.is_secret
          }))
      }));

      res.json(envsWithVars);
    });
  });
});

// CREATE environment with variables
router.post('/', authenticateToken, (req, res) => {
  const { env_name, workspace_id, variables } = req.body;
  const userId = req.user.user_id;

  const sql = `
    INSERT INTO environments 
    (env_name, workspace_id, created_by, created_at) 
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [env_name, workspace_id, userId], (err, result) => {
    if (err) {
      console.error('Environment insert error:', err);
      return res.status(500).json({ error: err.message });
    }

    const envId = result.insertId;

    if (variables && variables.length > 0) {
      const varValues = variables
        .filter(v => v.key && v.key.trim())
        .map(v => [
          envId,
          v.key,
          v.value || '',
          v.isSecret ? 1 : 0
        ]);

      if (varValues.length > 0) {
        const varSql = `
          INSERT INTO environment_variables 
          (env_id, \`key\`, \`value\`, is_secret) 
          VALUES ?
        `;

        db.query(varSql, [varValues], err => {
          if (err) {
            console.error('Variables insert error:', err);
            return res.status(500).json({ error: err.message });
          }

          res.status(201).json({
            env_id: envId,
            env_name,
            workspace_id,
            variables: varValues.map(v => ({
              key: v[1],
              value: v[2],
              isSecret: !!v[3]
            }))
          });
        });
      } else {
        res.status(201).json({
          env_id: envId,
          env_name,
          workspace_id,
          variables: []
        });
      }
    } else {
      res.status(201).json({
        env_id: envId,
        env_name,
        workspace_id,
        variables: []
      });
    }
  });
});

// UPDATE environment with variables
router.put('/:id', authenticateToken, (req, res) => {
  const { env_name, variables } = req.body;
  const envId = req.params.id;
  const userId = req.user.user_id;

  const updateEnvSql = `
    UPDATE environments 
    SET env_name = ? 
    WHERE env_id = ? AND created_by = ?
  `;

  db.query(updateEnvSql, [env_name, envId, userId], err => {
    if (err) {
      console.error('Environment update error:', err);
      return res.status(500).json({ error: err.message });
    }

    const deleteVarsSql = `
      DELETE FROM environment_variables WHERE env_id = ?
    `;

    db.query(deleteVarsSql, [envId], err => {
      if (err) {
        console.error('Variables delete error:', err);
        return res.status(500).json({ error: err.message });
      }

      if (variables && variables.length > 0) {
        const varValues = variables
          .filter(v => v.key && v.key.trim())
          .map(v => [
            envId,
            v.key,
            v.value || '',
            v.isSecret ? 1 : 0
          ]);

        if (varValues.length > 0) {
          const varSql = `
            INSERT INTO environment_variables 
            (env_id, \`key\`, \`value\`, is_secret) 
            VALUES ?
          `;

          db.query(varSql, [varValues], err => {
            if (err) {
              console.error('Variables insert error:', err);
              return res.status(500).json({ error: err.message });
            }

            res.json({
              message: 'Environment updated successfully',
              env_id: envId,
              env_name,
              variables: varValues.map(v => ({
                key: v[1],
                value: v[2],
                isSecret: !!v[3]
              }))
            });
          });
        } else {
          res.json({
            message: 'Environment updated successfully',
            env_id: envId,
            env_name,
            variables: []
          });
        }
      } else {
        res.json({
          message: 'Environment updated successfully',
          env_id: envId,
          env_name,
          variables: []
        });
      }
    });
  });
});

// DELETE environment
router.delete('/:id', authenticateToken, (req, res) => {
  const envId = req.params.id;
  const userId = req.user.user_id;

  const deleteVarsSql = `
    DELETE FROM environment_variables WHERE env_id = ?
  `;

  db.query(deleteVarsSql, [envId], err => {
    if (err) {
      console.error('Variables delete error:', err);
      return res.status(500).json({ error: err.message });
    }

    const deleteEnvSql = `
      DELETE FROM environments 
      WHERE env_id = ? AND created_by = ?
    `;

    db.query(deleteEnvSql, [envId, userId], (err, result) => {
      if (err) {
        console.error('Environment delete error:', err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Environment not found' });
      }

      res.json({ message: 'Environment deleted successfully' });
    });
  });
});

module.exports = router;
