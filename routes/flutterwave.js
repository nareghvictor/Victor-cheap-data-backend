const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Fund wallet via Flutterwave
router.post('/initiate', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    const tx_ref = `TX-${Date.now()}-${user._id}`;

    const flutterwaveRes = await axios.post('https://api.flutterwave.com/v3/payments', {
      tx_ref,
      amount,
      currency: "NGN",
      redirect_url: "https://victor-cheap-data.netlify.app/wallet-success.html",
      customer: {
        email: user.email,
        name: user.name
      },
      customizations: {
        title: "Victor Cheap Data Wallet",
        logo: "https://i.ibb.co/39yrxJHk/file-000000001788624397c947d3af55d17b.png"
      }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    res.json(flutterwaveRes.data);

  } catch (err) {
    console.error("Flutterwave init error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to initiate Flutterwave payment" });
  }
});

module.exports = router;
