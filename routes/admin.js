const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const users = await User.find();
    const transactions = await Transaction.find();

    const totalUsers = users.length;
    const totalWallet = users.reduce((sum, user) => sum + (user.wallet || 0), 0);
    const totalTransactions = transactions.length;

    res.json({
      totalUsers,
      totalWallet,
      totalTransactions
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/admin/users (includes user ID)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('_id fullName email wallet createdAt');
    res.json(users);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'fullName email') // include user name + email
      .sort({ date: -1 }); // newest first

    res.json(transactions);
  } catch (err) {
    console.error('Transaction fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
// POST /api/admin/fund-wallet
router.post('/fund-wallet', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.wallet += parseFloat(amount);
    await user.save();

    res.json({ message: 'Wallet funded successfully', wallet: user.wallet });
  } catch (err) {
    console.error('Fund wallet error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
