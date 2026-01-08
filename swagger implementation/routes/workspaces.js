const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: API for managing user workspaces
 */

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get all workspaces
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", (req, res) => {
  db.query("SELECT * FROM workspaces", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspace_name
 *             properties:
 *               workspace_name:
 *                 type: string
 *                 example: My Workspace
 *     responses:
 *       201:
 *         description: Workspace created
 */
router.post("/", (req, res) => {
  const { workspace_name } = req.body;
  db.query(
    "INSERT INTO workspaces (workspace_name, created_by, created_at) VALUES (?, ?, NOW())",
    [workspace_name, req.user.userId],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.status(201).json({ message: "Workspace created" });
    }
  );
});

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get workspace by ID
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM workspaces WHERE workspace_id=?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Workspace not found" });
    res.json(results[0]);
  });
});

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     summary: Update workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspace_name
 *             properties:
 *               workspace_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workspace updated
 */
router.put("/:id", (req, res) => {
  const { workspace_name } = req.body;
  db.query(
    "UPDATE workspaces SET workspace_name=? WHERE workspace_id=?",
    [workspace_name, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Workspace updated" });
    }
  );
});

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     summary: Delete workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Workspace ID
 *     responses:
 *       200:
 *         description: Workspace deleted
 */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM workspaces WHERE workspace_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Workspace deleted" });
  });
});

module.exports = router;
