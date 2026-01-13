const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "dev-secret-change-me";

// --------------------
// Signup
// --------------------
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, password_hash, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;

    db.run(sql, [username, email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ error: "User already exists" });
        }
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Signup crash:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// --------------------
// Login
// --------------------
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.get(sql, [email], async (err, user) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  });
});

module.exports = router;
