const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/user/kyc
router.post('/kyc', auth, async (req, res) => {
  try {
    const { bvn, idType, idNumber } = req.body;

    if (!bvn || !idType || !idNumber) {
      return res.status(400).json({ error: 'All KYC fields are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update KYC info
    user.kyc = {
      bvn,
      idType,
      idNumber,
      status: 'pending' // default status
    };

    await user.save();

    res.json({ message: 'KYC submitted successfully', kyc: user.kyc });
  } catch (err) {
    console.error('KYC Error:', err.message);
    res.status(500).json({ error: 'Server error during KYC submission' });
  }
});

module.exports = router;
