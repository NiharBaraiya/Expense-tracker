// controllers/expenseController.js
const Expense = require("../models/Expense");

// Add a new expense
const addExpense = async (req, res) => {
  try {
    const { title, amount, currency, category, budgetId, date, notes } = req.body;
    const userId = req.userId; // From auth middleware

    // Create new expense
    const newExpense = new Expense({
      userId,
      title,
      amount,
      currency,
      category,
      budgetId,
      date,
      notes,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save expense" });
  }
};

// Update an existing expense by ID
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, currency, category, budgetId, date, notes } = req.body;
    const userId = req.userId; // From auth middleware

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Update fields  
    expense.title = title || expense.title;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.currency = currency || expense.currency;
    expense.category = category || expense.category;
    expense.budgetId = budgetId || expense.budgetId;
    expense.date = date || expense.date;
    expense.notes = notes || expense.notes;

    const updatedExpense = await expense.save();
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const expenses = await Expense.find({ userId });
    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

module.exports = {
  addExpense,
  updateExpense,
  getExpenses,
};
