const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  }, // e.g. "Airtime", "Data", "Send Money", "Wallet Top-Up", etc.
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  }, // e.g. "success", "failed", "pending"
  details: {
    type: String,
    default: ''
  }, // Optional details like "Sent to GTBank - 1234567890"
  date: {
    type: Date,
    default: Date.now
  }
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
