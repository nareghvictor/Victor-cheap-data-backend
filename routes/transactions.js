const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Transaction = require('../models/transaction');
const User = require('../models/User');

// 🔐 GET: All user transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// ➕ POST: Add custom transaction (optional)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, amount, status } = req.body;
    const tx = new Transaction({
      user: req.user.id,
      type,
      amount,
      status: status || 'pending',
      date: new Date()
    });
    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    console.error('Custom transaction error:', err);
    res.status(500).json({ message: 'Error saving transaction' });
  }
});

// 💰 POST: Top-up wallet manually (no method)
router.post('/topup', authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid top-up amount' });
    }

    const user = await User.findById(req.user.id);
    user.wallet += amount;
    await user.save();

    const tx = new Transaction({
      user: user._id,
      type: 'Top-Up',
      amount,
      status: 'success',
      date: new Date()
    });
    await tx.save();

    res.json({ message: 'Wallet topped up successfully', wallet: user.wallet });
  } catch (err) {
    console.error('Top-up error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 💸 POST: Send Money
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { bank, account, amount } = req.body;
    const numericAmount = Number(amount);

    if (!bank || !account || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'All fields are required and amount must be valid' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.wallet < numericAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    user.wallet -= numericAmount;
    await user.save();

    const tx = new Transaction({
      user: user._id,
      type: 'Send Money',
      amount: numericAmount,
      status: 'success',
      details: `Sent to ${account} (${bank})`,
      date: new Date()
    });
    await tx.save();

    res.json({ message: 'Money sent successfully', wallet: user.wallet });
  } catch (err) {
    console.error('Send Money Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🏦 POST: Fund wallet via method (e.g., card/transfer)
router.post('/fund', authMiddleware, async (req, res) => {
  try {
    const { method, amount } = req.body;
    const numericAmount = Number(amount);

    if (!method || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid funding method or amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.wallet += numericAmount;
    await user.save();

    const tx = new Transaction({
      user: user._id,
      type: 'Wallet Top-Up',
      amount: numericAmount,
      status: 'success',
      details: `Funded via ${method}`,
      date: new Date()
    });
    await tx.save();

    res.json({ message: 'Wallet funded successfully', wallet: user.wallet });
  } catch (err) {
    console.error('Fund Wallet Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 💳 POST: Withdraw request
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { bank, account, amount } = req.body;
    const numericAmount = Number(amount);

    if (!bank || !account || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid withdraw details' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.wallet < numericAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    user.wallet -= numericAmount;
    await user.save();

    const tx = new Transaction({
      user: user._id,
      type: `Withdraw to ${bank}`,
      amount: numericAmount,
      status: 'pending',
      metadata: { bank, account },
      date: new Date()
    });
    await tx.save();

    res.json({ message: 'Withdraw request submitted', wallet: user.wallet });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
