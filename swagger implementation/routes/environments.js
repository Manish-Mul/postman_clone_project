const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Environments
 *   description: Manage environments for a user
 */

/**
 * @swagger
 * /environments:
 *   post:
 *     summary: Create a new environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - name
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Production"
 *     responses:
 *       200:
 *         description: Environment created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", (req, res) => {
  const { user_id, name } = req.body;
  db.query(
    "INSERT INTO environments (user_id, name) VALUES (?, ?)",
    [user_id, name],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, user_id, name });
    }
  );
});

/**
 * @swagger
 * /environments:
 *   get:
 *     summary: Get all environments
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of environments
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", (req, res) => {
  db.query("SELECT * FROM environments", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * @swagger
 * /environments/{id}:
 *   put:
 *     summary: Update an environment's name
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Development"
 *     responses:
 *       200:
 *         description: Environment updated successfully
 *       404:
 *         description: Environment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query(
    "UPDATE environments SET name=? WHERE id=?",
    [name, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Environment not found" });
      }
      res.json({ message: "Environment updated successfully" });
    }
  );
});

/**
 * @swagger
 * /environments/{id}:
 *   delete:
 *     summary: Delete an environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     responses:
 *       200:
 *         description: Environment deleted successfully
 *       404:
 *         description: Environment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM environments WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Environment not found" });
    }
    res.json({ message: "Environment deleted successfully" });
  });
});

module.exports = router;
