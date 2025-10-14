const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    category: { type: String, required: true },
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
