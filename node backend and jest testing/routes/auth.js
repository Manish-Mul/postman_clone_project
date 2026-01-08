const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key_here"; 

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
  db.query(sql, [username, email, hashedPassword], (err) => {
    if (err) return res.status(500).json({ error: "User already exists or DB error" });
    res.status(201).json({ message: "User registered successfully" });
  });
});

// Login route 
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0)
      return res.status(400).json({ error: "Invalid email or password" });

    const user = results[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    // Create token with user_id
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username }, 
      SECRET_KEY, 
      { expiresIn: "1h" }
    );

    // Return user data with user_id
    res.json({ 
      message: "Login successful", 
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      }
    });
  });
});

module.exports = router;
