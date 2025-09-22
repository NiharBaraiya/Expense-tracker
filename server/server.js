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

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/email", emailRoutes);

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));



// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
