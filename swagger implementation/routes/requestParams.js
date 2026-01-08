const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: RequestParams
 *   description: Manage query or body parameters associated with a request
 */

/**
 * @swagger
 * /requestParams:
 *   post:
 *     summary: Add a new parameter to a request
 *     tags: [RequestParams]
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
 *                 example: userId
 *               value:
 *                 type: string
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Parameter created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, (req, res) => {
  const { request_id, key, value } = req.body;
  db.query(
    "INSERT INTO requestParams (request_id, `key`, `value`) VALUES (?, ?, ?)",
    [request_id, key, value],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, request_id, key, value });
    }
  );
});

/**
 * @swagger
 * /requestParams:
 *   get:
 *     summary: Get all request parameters
 *     tags: [RequestParams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, (req, res) => {
  db.query("SELECT * FROM requestParams", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

/**
 * @swagger
 * /requestParams/{id}:
 *   put:
 *     summary: Update a specific parameter
 *     tags: [RequestParams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the parameter
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
 *                 example: userId
 *               value:
 *                 type: string
 *                 example: 67890
 *     responses:
 *       200:
 *         description: Parameter updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { key, value } = req.body;
  db.query(
    "UPDATE requestParams SET `key`=?, `value`=? WHERE id=?",
    [key, value, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Param updated successfully" });
    }
  );
});

/**
 * @swagger
 * /requestParams/{id}:
 *   delete:
 *     summary: Delete a specific parameter
 *     tags: [RequestParams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the parameter
 *     responses:
 *       200:
 *         description: Parameter deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM requestParams WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Param deleted successfully" });
  });
});

module.exports = router;
