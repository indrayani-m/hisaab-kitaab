const express = require("express");
const router = express.Router();
const db = require("../db");

// =====================
// ADD TRANSACTION
// =====================
router.post("/add", (req, res) => {
  const { user_id, title, amount, type, category, date } = req.body;

  const sql = `
    INSERT INTO transactions (user_id, title, amount, type, category, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, title, amount, type, category, date], (err) => {
    if (err) return res.status(500).send(err);

    res.send({ message: "Transaction added" });
  });
});

// =====================
// GET TRANSACTIONS
// =====================
router.get("/:user_id", (req, res) => {
  const userId = req.params.user_id;

  const sql = `
    SELECT * FROM transactions
    WHERE user_id=?
    ORDER BY id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).send(err);

    res.send(result);
  });
});

// =====================
// DELETE TRANSACTION
// =====================
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM transactions WHERE id=?";

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send(err);

    res.send({ message: "Transaction deleted" });
  });
});

module.exports = router;