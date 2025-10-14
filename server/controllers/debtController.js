const Debt = require("../models/Debt");

// ➕ Add a new debt
const addDebt = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Adding debt for user:", userId, "Data:", req.body);
    
    const debt = new Debt({ ...req.body, userId });
    await debt.save();
    console.log("Debt saved successfully:", debt);
    res.status(201).json(debt);
  } catch (err) {
    console.error("Error adding debt:", err);
    res.status(500).json({ 
      error: "Server error while adding debt", 
      details: err.message 
    });
  }
};

// 📋 Get all debts
const getDebts = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Fetching debts for user:", userId);
    
    const debts = await Debt.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(debts);
  } catch (err) {
    console.error("Error fetching debts:", err);
    res.status(500).json({ 
      error: "Server error while fetching debts", 
      details: err.message 
    });
  }
};

// ✏️ Update a debt
const updateDebt = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Updating debt:", req.params.id, "for user:", userId, "Data:", req.body);
    
    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }
    console.log("Debt updated successfully:", debt);
    res.status(200).json(debt);
  } catch (err) {
    console.error("Error updating debt:", err);
    res.status(500).json({ 
      error: "Server error while updating debt", 
      details: err.message 
    });
  }
};

// 🗑️ Delete a debt
const deleteDebt = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Deleting debt:", req.params.id, "for user:", userId);
    
    const debt = await Debt.findOneAndDelete({ _id: req.params.id, userId });
    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }
    console.log("Debt deleted successfully:", debt);
    res.status(200).json({ message: "Debt deleted" });
  } catch (err) {
    console.error("Error deleting debt:", err);
    res.status(500).json({ 
      error: "Server error while deleting debt", 
      details: err.message 
    });
  }
};

// 💰 Add a payment to a debt
const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.userId; // From auth middleware

    console.log("Adding payment to debt:", id, "Amount:", amount, "User:", userId);

    const debt = await Debt.findOne({ _id: id, userId });
    if (!debt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    // Deduct payment
    debt.remaining -= amount;
    debt.payments.push({ amount, date: new Date() });

    // Mark as fully paid if balance is zero or less
    if (debt.remaining <= 0) {
      debt.remaining = 0;
      debt.paid = true;
    }

    await debt.save();
    console.log("Payment added successfully:", debt);
    res.status(200).json(debt);
  } catch (err) {
    console.error("Error adding payment to debt:", err);
    res.status(500).json({ 
      error: "Server error while adding payment", 
      details: err.message 
    });
  }
};

module.exports = {
  addDebt,
  getDebts,
  updateDebt,
  deleteDebt,
  addPayment,
};
