const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const skipAuth = process.env.NODE_ENV === "test"; // only skip in Jest
const authMiddleware = skipAuth ? (req, res, next) => next() : authenticateToken;
console.log('authMiddleware', skipAuth ? 'skipping auth' : 'auth required');

/**
 * @swagger
 * tags:
 *   name: Responses
 *   description: Manage API responses stored from requests
 */

/**
 * @swagger
 * /responses:
 *   get:
 *     summary: Get all responses
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all stored responses
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
 *                   status_code:
 *                     type: integer
 *                   response_body:
 *                     type: string
 *                   response_time_ms:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM responses');
  res.json(rows);
});

/**
 * @swagger
 * /responses:
 *   post:
 *     summary: Create a new response record
 *     tags: [Responses]
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
 *               - status_code
 *               - response_body
 *               - response_time_ms
 *             properties:
 *               request_id:
 *                 type: integer
 *                 example: 101
 *               status_code:
 *                 type: integer
 *                 example: 200
 *               response_body:
 *                 type: string
 *                 example: '{"message":"OK"}'
 *               response_time_ms:
 *                 type: number
 *                 example: 123.45
 *     responses:
 *       201:
 *         description: Response created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, async (req, res) => {
  const { request_id, status_code, response_body, response_time_ms } = req.body;
  const [result] = await db.execute(
    'INSERT INTO responses (request_id, status_code, response_body, response_time_ms, created_at) VALUES (?, ?, ?, ?, NOW())',
    [request_id, status_code, response_body, response_time_ms]
  );
  res.status(201).json({ id: result.insertId });
});

/**
 * @swagger
 * /responses/{id}:
 *   put:
 *     summary: Update an existing response
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the response to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_code
 *               - response_body
 *               - response_time_ms
 *             properties:
 *               status_code:
 *                 type: integer
 *                 example: 200
 *               response_body:
 *                 type: string
 *                 example: '{"message":"Updated"}'
 *               response_time_ms:
 *                 type: number
 *                 example: 100.5
 *     responses:
 *       200:
 *         description: Response updated successfully
 *       404:
 *         description: Response not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { status_code, response_body, response_time_ms } = req.body;
  const [result] = await db.execute(
    'UPDATE responses SET status_code=?, response_body=?, response_time_ms=? WHERE id=?',
    [status_code, response_body, response_time_ms, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Response not found' });
  res.json({ message: 'Response updated successfully' });
});

/**
 * @swagger
 * /responses/{id}:
 *   delete:
 *     summary: Delete a response by ID
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the response to delete
 *     responses:
 *       200:
 *         description: Response deleted successfully
 *       404:
 *         description: Response not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const [result] = await db.execute('DELETE FROM responses WHERE id=?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Response not found' });
  res.json({ message: 'Response deleted successfully' });
});

module.exports = router;
