const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: EnvironmentVariables
 *   description: Manage environment variables for environments
 */

/**
 * @swagger
 * /environmentVariables:
 *   post:
 *     summary: Create an environment variable
 *     tags: [EnvironmentVariables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - env_id
 *               - key
 *               - value
 *             properties:
 *               env_id:
 *                 type: integer
 *                 example: 1
 *               key:
 *                 type: string
 *                 example: "API_KEY"
 *               value:
 *                 type: string
 *                 example: "abc123"
 *     responses:
 *       200:
 *         description: Variable created
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.post("/", (req, res) => {
  const { env_id, key, value } = req.body;
  if (!env_id || !key || !value) {
    return res.status(400).json({ error: "env_id, key, and value are required" });
  }
  db.query(
    "INSERT INTO environment_variables (env_id, `key`, `value`) VALUES (?, ?, ?)",
    [env_id, key, value],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, env_id, key, value });
    }
  );
});

/**
 * @swagger
 * /environmentVariables:
 *   get:
 *     summary: Get all environment variables
 *     tags: [EnvironmentVariables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of variables
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.get("/", (req, res) => {
  db.query("SELECT * FROM environment_variables", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /environmentVariables/{id}:
 *   put:
 *     summary: Update an environment variable
 *     tags: [EnvironmentVariables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Variable ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 example: "NEW_API_KEY"
 *               value:
 *                 type: string
 *                 example: "xyz789"
 *     responses:
 *       200:
 *         description: Variable updated
 *       400:
 *         description: Missing key or value
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: "Key and value are required" });
  }

  db.query(
    "UPDATE environment_variables SET `key`=?, `value`=? WHERE var_id=?",
    [key, value, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Variable not found" });
      }
      res.json({ message: "Variable updated successfully" });
    }
  );
});

/**
 * @swagger
 * /environmentVariables/{id}:
 *   delete:
 *     summary: Delete an environment variable
 *     tags: [EnvironmentVariables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Variable ID
 *     responses:
 *       200:
 *         description: Variable deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM environment_variables WHERE var_id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variable not found" });
    }
    res.json({ message: "Variable deleted successfully" });
  });
});

module.exports = router;
