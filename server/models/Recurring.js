const mongoose = require("mongoose");

const RecurringSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["expense", "income"], required: true },
  nextDue: { type: Date, required: true },
});

module.exports = mongoose.model("Recurring", RecurringSchema);
