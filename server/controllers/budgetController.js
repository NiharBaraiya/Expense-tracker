const Budget = require("../models/Budget");

// Add or update by category
const addBudget = async (req, res) => {
  try {
    console.log("=== Add Budget Request ===");
    console.log("Request body:", req.body);
    console.log("User ID from auth:", req.userId);
    
    const { name, description, amount, currency, category, startDate, endDate } = req.body;
    const userId = req.userId; // From auth middleware
    
    if (!name || !amount || !category) {
      console.log("❌ Validation failed - missing required fields");
      return res.status(400).json({ error: "Name, amount, and category are required" });
    }

    if (!userId) {
      console.log("❌ No userId from auth middleware");
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log("Checking for existing budget with category:", category, "and userId:", userId);
    let existingBudget = await Budget.findOne({ category, userId });
    
    if (existingBudget) {
      console.log("Found existing budget, updating...");
      existingBudget.amount += parseFloat(amount);
      existingBudget.name = name.trim();
      existingBudget.description = description?.trim() || "";
      existingBudget.currency = currency || "USD";
      existingBudget.startDate = startDate || existingBudget.startDate;
      existingBudget.endDate = endDate || existingBudget.endDate;
      const updatedBudget = await existingBudget.save();
      console.log("✅ Budget updated successfully:", updatedBudget);
      return res.status(200).json(updatedBudget);
    }

    console.log("Creating new budget...");
    const newBudget = new Budget({
      userId,
      name: name.trim(),
      description: description?.trim() || "",
      amount: parseFloat(amount),
      currency: currency || "USD",
      category,
      startDate,
      endDate,
    });

    console.log("New budget object created:", newBudget);
    const savedBudget = await newBudget.save();
    console.log("✅ Budget saved successfully:", savedBudget);
    res.status(201).json(savedBudget);
  } catch (error) {
    console.error("❌ Error in addBudget:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Server error while saving budget",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all
const getBudgets = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const budgets = await Budget.find({ userId });
    res.json(budgets);
  } catch (error) {
    console.error("❌ Error in getBudgets:", error);
    res.status(500).json({ error: "Server error while fetching budgets" });
  }
};

// ✅ Update by ID
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware
    const updated = await Budget.findOneAndUpdate({ _id: id, userId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Budget not found" });
    res.json(updated);
  } catch (error) {
    console.error("❌ Error in updateBudget:", error);
    res.status(500).json({ error: "Server error while updating budget" });
  }
};

// ✅ Delete by ID
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware
    const deleted = await Budget.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteBudget:", error);
    res.status(500).json({ error: "Server error while deleting budget" });
  }
};

module.exports = { addBudget, getBudgets, updateBudget, deleteBudget };