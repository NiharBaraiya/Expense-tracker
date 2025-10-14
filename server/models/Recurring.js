const mongoose = require("mongoose");

const RecurringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["expense", "income"], required: true },
  nextDue: { type: Date, required: true },
});

module.exports = mongoose.model("Recurring", RecurringSchema);
