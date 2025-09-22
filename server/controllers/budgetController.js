const Budget = require("../models/Budget");

// Add or update by category
const addBudget = async (req, res) => {
  try {
    const { name, description, amount, currency, category, startDate, endDate } = req.body;
    if (!name || !amount || !category) {
      return res.status(400).json({ error: "Name, amount, and category are required" });
    }

    let existingBudget = await Budget.findOne({ category });
    if (existingBudget) {
      existingBudget.amount += parseFloat(amount);
      existingBudget.name = name.trim();
      existingBudget.description = description?.trim() || "";
      existingBudget.currency = currency || "USD";
      existingBudget.startDate = startDate || existingBudget.startDate;
      existingBudget.endDate = endDate || existingBudget.endDate;
      const updatedBudget = await existingBudget.save();
      return res.status(200).json(updatedBudget);
    }

    const newBudget = new Budget({
      name: name.trim(),
      description: description?.trim() || "",
      amount: parseFloat(amount),
      currency: currency || "USD",
      category,
      startDate,
      endDate,
    });

    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    console.error("❌ Error in addBudget:", error);
    res.status(500).json({ error: "Server error while saving budget" });
  }
};

// Get all
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({});
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
    const updated = await Budget.findByIdAndUpdate(id, req.body, { new: true });
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
    const deleted = await Budget.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteBudget:", error);
    res.status(500).json({ error: "Server error while deleting budget" });
  }
};

module.exports = { addBudget, getBudgets, updateBudget, deleteBudget };
