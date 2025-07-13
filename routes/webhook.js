const express = require('express');
const router = express.Router();

router.post('/flutterwave', (req, res) => {
  console.log('Received Flutterwave webhook:', req.body);

  // You should verify signature and process the transaction here
  res.status(200).send('Webhook received');
});

module.exports = router;
