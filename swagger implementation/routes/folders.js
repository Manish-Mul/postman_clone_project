const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

const skipAuth = process.env.NODE_ENV === "test"; // only skip in Jest
const authMiddleware = skipAuth ? (req, res, next) => next() : authenticateToken;
console.log('authMiddleware', skipAuth ? 'skipping auth' : 'auth required');

/**
 * @swagger
 * tags:
 *   name: Folders
 *   description: Manage folders inside collections
 */

/**
 * @swagger
 * /folders:
 *   post:
 *     summary: Create a new folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folder_name
 *               - collection_id
 *             properties:
 *               folder_name:
 *                 type: string
 *                 example: "User Endpoints"
 *               collection_id:
 *                 type: integer
 *                 example: 1
 *               parent_folder_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *     responses:
 *       201:
 *         description: Folder created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.post("/", authMiddleware, (req, res) => {
  const { folder_name, collection_id, parent_folder_id } = req.body;
  db.query(
    "INSERT INTO folders (folder_name, collection_id, parent_folder_id) VALUES (?, ?, ?)",
    [folder_name, collection_id, parent_folder_id || null],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.status(201).json({ message: "Folder created" });
    }
  );
});

/**
 * @swagger
 * /folders:
 *   get:
 *     summary: Get all folders
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   folder_id:
 *                     type: integer
 *                   folder_name:
 *                     type: string
 *                   collection_id:
 *                     type: integer
 *                   parent_folder_id:
 *                     type: integer
 *                     nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.get("/", authMiddleware, (req, res) => {
  db.query("SELECT * FROM folders", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

/**
 * @swagger
 * /folders/{id}:
 *   put:
 *     summary: Update a folder's name
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Folder ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - folder_name
 *             properties:
 *               folder_name:
 *                 type: string
 *                 example: "Updated Folder Name"
 *     responses:
 *       200:
 *         description: Folder updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.put("/:id", authMiddleware, (req, res) => {
  const { folder_name } = req.body;
  db.query("UPDATE folders SET folder_name=? WHERE folder_id=?", [folder_name, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Folder updated" });
  });
});

/**
 * @swagger
 * /folders/{id}:
 *   delete:
 *     summary: Delete a folder
 *     tags: [Folders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Folder ID
 *     responses:
 *       200:
 *         description: Folder deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Database error
 */
router.delete("/:id", authMiddleware, (req, res) => {
  db.query("DELETE FROM folders WHERE folder_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Folder deleted" });
  });
});

module.exports = router;
