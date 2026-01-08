const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth"); // Ensure this is correct

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: API endpoints for managing HTTP request templates
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new request template
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection_id
 *               - name
 *               - method
 *               - url
 *             properties:
 *               collection_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Get User Info
 *               method:
 *                 type: string
 *                 example: GET
 *               url:
 *                 type: string
 *                 example: https://api.example.com/user
 *     responses:
 *       200:
 *         description: Request created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, (req, res) => {
  const { collection_id, request_name, method, url, created_by } = req.body;
  db.query(
    "INSERT INTO requests (collection_id, request_name, method, url) VALUES (?, ?, ?, ?)",
    [collection_id, request_name, method, url],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, collection_id, request_name, method, url});
    }
  );
});

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all request templates
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all requests
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, (req, res) => {
  db.query("SELECT * FROM requests", (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get a specific request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: The requested resource
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:id", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM requests WHERE request_id = ?",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows[0]);
    }
  );
});

/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Update an existing request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_name
 *               - url
 *             properties:
 *               request_name:
 *                 type: string
 *                 example: Updated Request Name
 *               url:
 *                 type: string
 *                 example: https://api.newurl.com
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { request_name, url } = req.body;
  db.query(
    "UPDATE requests SET request_name = ?, url = ? WHERE request_id = ?",
    [request_name, url, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Request updated successfully" });
    }
  );
});

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Delete a request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM requests WHERE request_id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Request deleted successfully" });
    }
  );
});

module.exports = router;
