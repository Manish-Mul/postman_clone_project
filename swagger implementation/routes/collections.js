const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");


const skipAuth = process.env.NODE_ENV === "test"; 
const authMiddleware = skipAuth ? (req, res, next) => next() : authenticateToken;
console.log('authMiddleware', skipAuth ? 'skipping auth' : 'auth required');


/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: API endpoints for managing collections
 */

/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Collection details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection_name
 *               - workspace_id
 *             properties:
 *               collection_name:
 *                 type: string
 *                 example: User Management API
 *               workspace_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection created
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/", authMiddleware, (req, res) => {
  const { collection_name, workspace_id } = req.body;
  db.query(
    "INSERT INTO collections (collection_name, workspace_id, created_by) VALUES (?, ?, NOW())",
    [collection_name, workspace_id, req.user.userId],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.status(201).json({ message: "Collection created" });
    }
  );
});

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get all collections
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   collection_id:
 *                     type: integer
 *                   collection_name:
 *                     type: string
 *                   workspace_id:
 *                     type: integer
 *                   created_by:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, (req, res) => {
  db.query("SELECT * FROM collections", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

/**
 * @swagger
 * /collections/{id}:
 *   put:
 *     summary: Update a collection's name
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Collection ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Updated collection name
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection_name
 *             properties:
 *               collection_name:
 *                 type: string
 *                 example: Updated Collection Name
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection updated
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authMiddleware, (req, res) => {
  const { collection_name } = req.body;
  db.query(
    "UPDATE collections SET collection_name=? WHERE collection_id=?",
    [collection_name, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Collection updated" });
    }
  );
});

/**
 * @swagger
 * /collections/{id}:
 *   delete:
 *     summary: Delete a collection by ID
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Collection ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection deleted
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authMiddleware, (req, res) => {
  db.query("DELETE FROM collections WHERE collection_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Collection deleted" });
  });
});

module.exports = router;
