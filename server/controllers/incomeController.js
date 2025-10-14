// controllers/incomeController.js
const Income = require("../models/Income");

// @desc    Get all incomes
// @route   GET /api/incomes
// @access  Private
const getAllIncomes = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Fetching incomes for user:", userId);
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    res.status(500).json({ 
      message: "Server error while fetching incomes", 
      error: error.message 
    });
  }
};

// @desc    Add new income
// @route   POST /api/incomes
// @access  Private
const addIncome = async (req, res) => {
  try {
    const { title, amount, source, date, notes } = req.body;
    const userId = req.userId; // From auth middleware

    console.log("Adding income for user:", userId, "Data:", req.body);

    if (!title || !amount || Number(amount) <= 0 || !date) {
      return res.status(400).json({ message: "Please provide valid income details" });
    }

    const newIncome = new Income({
      userId,
      title,
      amount,
      source,
      date,
      notes,
    });

    const savedIncome = await newIncome.save();
    console.log("Income saved successfully:", savedIncome);
    res.status(201).json(savedIncome);
  } catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({ 
      message: "Server error while adding income", 
      error: error.message 
    });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;
    const userId = req.userId; // From auth middleware
    
    console.log("Updating income:", incomeId, "for user:", userId, "Data:", req.body);
    
    const updatedIncome = await Income.findOneAndUpdate({ _id: incomeId, userId }, req.body, { new: true });
    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    console.log("Income updated successfully:", updatedIncome);
    res.status(200).json(updatedIncome);
  } catch (error) {
    console.error("Error updating income:", error);
    res.status(500).json({ 
      message: "Server error while updating income", 
      error: error.message 
    });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const incomeId = req.params.id;
    const userId = req.userId; // From auth middleware
    
    console.log("Deleting income:", incomeId, "for user:", userId);
    
    const deletedIncome = await Income.findOneAndDelete({ _id: incomeId, userId });
    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    console.log("Income deleted successfully:", deletedIncome);
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ 
      message: "Server error while deleting income", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
};
