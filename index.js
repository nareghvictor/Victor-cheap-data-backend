const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/Auth"));
app.use("/api/transactions", require("./routes/Transactions"));
app.use("/api/user", require("./routes/Kyc"));
app.use("/api/recharge", require("./routes/recharge"));
app.use("/api/webhook", require("./routes/webhook")); // ✅ This is now placed correctly

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
