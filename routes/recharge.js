const express = require('express');
const router = express.Router();

// Dummy recharge route
router.get('/', (req, res) => {
  res.send('Recharge endpoint placeholder');
});

module.exports = router;
