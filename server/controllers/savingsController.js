const SavingsGoal = require("../models/SavingsGoal");

// Get all savings goals
exports.getAllGoals = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Fetching savings goals for user:", userId);
    
    const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    res.status(500).json({ 
      message: "Server error while fetching savings goals", 
      error: error.message 
    });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { amount, deadline } = req.body;
    const userId = req.userId; // From auth middleware
    
    console.log("Creating savings goal for user:", userId, "Data:", req.body);
    
    const newGoal = new SavingsGoal({ userId, amount, deadline });
    const savedGoal = await newGoal.save();
    console.log("Savings goal created successfully:", savedGoal);
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error("Error creating savings goal:", error);
    res.status(500).json({ 
      message: "Server error while creating savings goal", 
      error: error.message 
    });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, deadline } = req.body;
    const userId = req.userId; // From auth middleware
    
    console.log("Updating savings goal:", id, "for user:", userId, "Data:", req.body);
    
    const updatedGoal = await SavingsGoal.findOneAndUpdate(
      { _id: id, userId },
      { amount, deadline },
      { new: true }
    );
    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    console.log("Savings goal updated successfully:", updatedGoal);
    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error("Error updating savings goal:", error);
    res.status(500).json({ 
      message: "Server error while updating savings goal", 
      error: error.message 
    });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware
    
    console.log("Deleting savings goal:", id, "for user:", userId);
    
    const deletedGoal = await SavingsGoal.findOneAndDelete({ _id: id, userId });
    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    console.log("Savings goal deleted successfully:", deletedGoal);
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    res.status(500).json({ 
      message: "Server error while deleting savings goal", 
      error: error.message 
    });
  }
};
