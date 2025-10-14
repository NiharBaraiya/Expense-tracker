const Recurring = require("../models/Recurring");

// Get all recurring
exports.getRecurring = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Fetching recurring items for user:", userId);
    
    const list = await Recurring.find({ userId });
    res.status(200).json(list);
  } catch (err) {
    console.error("Error fetching recurring items:", err);
    res.status(500).json({ 
      message: "Server error while fetching recurring items", 
      error: err.message 
    });
  }
};

// Add new recurring
exports.addRecurring = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Adding recurring item for user:", userId, "Data:", req.body);
    
    const newRecurring = new Recurring({ ...req.body, userId });
    await newRecurring.save();
    console.log("Recurring item saved successfully:", newRecurring);
    res.status(201).json(newRecurring);
  } catch (err) {
    console.error("Error adding recurring item:", err);
    res.status(400).json({ 
      message: "Server error while adding recurring item", 
      error: err.message 
    });
  }
};

// Update recurring
exports.updateRecurring = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Updating recurring item:", req.params.id, "for user:", userId, "Data:", req.body);
    
    const updated = await Recurring.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Recurring item not found" });
    }
    console.log("Recurring item updated successfully:", updated);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating recurring item:", err);
    res.status(400).json({ 
      message: "Server error while updating recurring item", 
      error: err.message 
    });
  }
};

// Delete recurring
exports.deleteRecurring = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Deleting recurring item:", req.params.id, "for user:", userId);
    
    const deleted = await Recurring.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Recurring item not found" });
    }
    console.log("Recurring item deleted successfully:", deleted);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting recurring item:", err);
    res.status(500).json({ 
      message: "Server error while deleting recurring item", 
      error: err.message 
    });
  }
};
