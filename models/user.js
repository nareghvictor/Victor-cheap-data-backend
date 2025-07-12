const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: String, // ✅ profile image URL
  password: String,
  wallet: {
    type: Number,
    default: 0
  },
  kyc: {
    bvn: String,
    idType: String,
    idNumber: String,
    status: {
      type: String,
      default: "pending"
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
