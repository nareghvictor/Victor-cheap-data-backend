const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();

// Fund Wallet Route
router.post('/fund-wallet', async (req, res) => {
  const { email, amount, name } = req.body;

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `VictorTX-${Date.now()}`,
        amount,
        currency: 'NGN',
        redirect_url: 'https://victorcheapdata.com/payment-success.html',
        customer: {
          email,
          name
        },
        customizations: {
          title: 'Victor Cheap Data',
          description: 'Wallet Top-up',
          logo: 'https://victorcheapdata.com/logo.png' // optional logo
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Flutterwave Init Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// Webhook to confirm payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const hash = req.headers['verif-hash'];
  const secretHash = process.env.FLW_SECRET_HASH;

  if (!hash || hash !== secretHash) {
    return res.status(401).send('Unauthorized');
  }

  let payload;
  try {
    payload = JSON.parse(req.body);
  } catch (e) {
    return res.status(400).send('Invalid JSON');
  }

  if (
    payload.event === 'charge.completed' &&
    payload.data.status === 'successful'
  ) {
    const { amount, customer, tx_ref } = payload.data;
    const email = customer.email;

    try {
      const user = await User.findOne({ email });
      if (user) {
        user.wallet += amount;
        await user.save();
        console.log(`✅ Wallet funded: ${email} - ₦${amount}`);
      } else {
        console.log(`❌ User not found for webhook email: ${email}`);
      }
    } catch (err) {
      console.error('Webhook DB Error:', err);
    }
  }

  res.sendStatus(200); // Acknowledge receipt
});

module.exports = router;
