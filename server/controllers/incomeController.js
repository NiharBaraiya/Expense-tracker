// controllers/incomeController.js
const Income = require("../models/Income");

// @desc    Get all incomes
// @route   GET /api/incomes
// @access  Public (later can protect with auth)
const getAllIncomes = async (req, res) => {
  try {
    const incomes = await Income.find().sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Add new income
// @route   POST /api/incomes
// @access  Public
const addIncome = async (req, res) => {
  try {
    const { title, amount, source, date, notes } = req.body;

    if (!title || !amount || Number(amount) <= 0 || !date) {
      return res.status(400).json({ message: "Please provide valid income details" });
    }

    const newIncome = new Income({
      title,
      amount,
      source,
      date,
      notes,
    });

    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Public
const updateIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;
    const updatedIncome = await Income.findByIdAndUpdate(incomeId, req.body, { new: true });
    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.status(200).json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Public
const deleteIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;
    const deletedIncome = await Income.findByIdAndDelete(incomeId);
    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getAllIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
};
