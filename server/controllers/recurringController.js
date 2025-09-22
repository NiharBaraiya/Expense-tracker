const Recurring = require("../models/Recurring");

// Get all recurring
exports.getRecurring = async (req, res) => {
  try {
    const list = await Recurring.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new recurring
exports.addRecurring = async (req, res) => {
  try {
    const newRecurring = new Recurring(req.body);
    await newRecurring.save();
    res.json(newRecurring);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update recurring
exports.updateRecurring = async (req, res) => {
  try {
    const updated = await Recurring.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete recurring
exports.deleteRecurring = async (req, res) => {
  try {
    await Recurring.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
