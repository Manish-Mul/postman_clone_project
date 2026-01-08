const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: RequestHeaders
 *   description: Manage headers associated with API requests
 */

/**
 * @swagger
 * /requestHeaders:
 *   post:
 *     summary: Add a new request header
 *     tags: [RequestHeaders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - key
 *               - value
 *             properties:
 *               request_id:
 *                 type: integer
 *                 example: 1
 *               key:
 *                 type: string
 *                 example: Content-Type
 *               value:
 *                 type: string
 *                 example: application/json
 *     responses:
 *       200:
 *         description: Header added successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, (req, res) => {
  const { request_id, key, value } = req.body;
  db.query(
    "INSERT INTO requestHeaders (request_id, `key`, `value`) VALUES (?, ?, ?)",
    [request_id, key, value],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, request_id, key, value });
    }
  );
});

/**
 * @swagger
 * /requestHeaders:
 *   get:
 *     summary: Get all request headers
 *     tags: [RequestHeaders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of headers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   request_id:
 *                     type: integer
 *                   key:
 *                     type: string
 *                   value:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, (req, res) => {
  db.query("SELECT * FROM requestHeaders", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

/**
 * @swagger
 * /requestHeaders/{id}:
 *   put:
 *     summary: Update a specific header
 *     tags: [RequestHeaders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the header to update
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
 *                 example: Authorization
 *               value:
 *                 type: string
 *                 example: Bearer abc123
 *     responses:
 *       200:
 *         description: Header updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { key, value } = req.body;
  db.query(
    "UPDATE requestHeaders SET `key`=?, `value`=? WHERE id=?",
    [key, value, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Header updated successfully" });
    }
  );
});

/**
 * @swagger
 * /requestHeaders/{id}:
 *   delete:
 *     summary: Delete a specific header
 *     tags: [RequestHeaders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the header to delete
 *     responses:
 *       200:
 *         description: Header deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM requestHeaders WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Header deleted successfully" });
  });
});

module.exports = router;
