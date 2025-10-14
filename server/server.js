// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Routes
const budgetRoutes = require("./routes/budgetRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const debtRoutes = require("./routes/debtRoutes");
const recurringRoutes = require("./routes/recurringRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const emailRoutes = require("./routes/emailRoutes");
const feedbackRoutes = require('./routes/feedback');
const userRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notificationRoutes");
// Load environment variables
dotenv.config();
const app = express();

// ===== Middleware =====
app.use(cors());

// Keep large payload limits for PDF/email
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// body-parser (redundant but kept as per request)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    env: {
      mongoUri: process.env.MONGO_URI ? "Set" : "Missing",
      jwtSecret: process.env.JWT_SECRET ? "Set" : "Missing"
    }
  });
});

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
// ===== MongoDB Connection =====
console.log("Attempting to connect to MongoDB...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Found" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Missing");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });



// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
