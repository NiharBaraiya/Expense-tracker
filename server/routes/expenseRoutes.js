// routes/expenseRoutes.js
const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const User = require("../models/User");
const sendOverspendEmail = require("../utils/sendOverspendNotification");

// Helper: Check overspend and send email
const checkOverspendAndNotify = async ({ userId, category, budgetId }) => {
  if (!budgetId) return;

  const budget = await Budget.findById(budgetId);
  if (!budget) return;

  // Fetch all expenses for this user and category
  const expenses = await Expense.find({ userId, category });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalSpent > budget.amount) {
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendOverspendEmail({
        email: user.email,
        category,
        budgetAmount: budget.amount,
        spentAmount: totalSpent,
      });
    }
  }
};

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({});
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// ADD new expense
router.post("/add", async (req, res) => {
  try {
    const { userId, category, budgetId } = req.body;

    const newExpense = await Expense.create(req.body);

    // Check for overspend after adding
    await checkOverspendAndNotify({ userId, category, budgetId });

    res.status(201).json(newExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// UPDATE existing expense
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, category, budgetId } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });

    // Check for overspend after update
    await checkOverspendAndNotify({ userId, category, budgetId });

    res.status(200).json(updatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

module.exports = router;
