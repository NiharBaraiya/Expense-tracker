const SavingsGoal = require("../models/SavingsGoal");

// Get all savings goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { amount, deadline } = req.body;
    const newGoal = new SavingsGoal({ amount, deadline });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, deadline } = req.body;
    const updatedGoal = await SavingsGoal.findByIdAndUpdate(
      id,
      { amount, deadline },
      { new: true }
    );
    if (!updatedGoal) return res.status(404).json({ message: "Goal not found" });
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGoal = await SavingsGoal.findByIdAndDelete(id);
    if (!deletedGoal) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
