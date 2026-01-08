const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: RequestBody
 *   description: Manage raw request body data for API requests
 */

/**
 * @swagger
 * /requestBody:
 *   post:
 *     summary: Add a request body
 *     tags: [RequestBody]
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
 *               - body
 *             properties:
 *               request_id:
 *                 type: integer
 *                 example: 1
 *               body:
 *                 type: string
 *                 example: '{"username": "john", "email": "john@example.com"}'
 *     responses:
 *       200:
 *         description: Request body added successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, (req, res) => {
  const { request_id, body } = req.body;
  db.query(
    "INSERT INTO requestBody (request_id, body) VALUES (?, ?)",
    [request_id, body],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, request_id, body });
    }
  );
});

/**
 * @swagger
 * /requestBody:
 *   get:
 *     summary: Get all request bodies
 *     tags: [RequestBody]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of request bodies
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
 *                   body:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, (req, res) => {
  db.query("SELECT * FROM requestBody", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

/**
 * @swagger
 * /requestBody/{id}:
 *   put:
 *     summary: Update a specific request body
 *     tags: [RequestBody]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the request body to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 example: '{"username": "jane", "email": "jane@example.com"}'
 *     responses:
 *       200:
 *         description: Request body updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  db.query("UPDATE requestBody SET body=? WHERE id=?", [body, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Body updated successfully" });
  });
});

/**
 * @swagger
 * /requestBody/{id}:
 *   delete:
 *     summary: Delete a specific request body
 *     tags: [RequestBody]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the request body to delete
 *     responses:
 *       200:
 *         description: Request body deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM requestBody WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Body deleted successfully" });
  });
});

module.exports = router;
