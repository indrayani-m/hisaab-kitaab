const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// =====================
// SIGNUP
// =====================
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Signup DB error:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).send({ message: "User already exists" });
        }

        return res.status(500).send({ message: "Database error" });
      }

      res.status(201).send({
        message: "Signup successful",
        userId: result.insertId
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// =====================
// LOGIN
// =====================
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email=?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).send({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).send({ message: "User not found" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid password" });
    }

    res.send({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

module.exports = router;
