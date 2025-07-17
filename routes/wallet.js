// backend/routes/wallet.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const User = require("../models/User");

// Get wallet balance
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Top-up wallet (manual for now)
router.post("/topup", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.walletBalance += Number(amount);
    await user.save();

    res.json({ message: "Wallet topped up", walletBalance: user.walletBalance });
  } catch (err) {
    console.error("Top-up error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Withdraw from wallet
router.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.walletBalance -= Number(amount);
    await user.save();

    res.json({ message: "Withdrawal successful", walletBalance: user.walletBalance });
  } catch (err) {
    console.error("Withdraw error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
