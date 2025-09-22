const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  remaining: Number,
  interest: Number,
  dueDate: Date,
  paid: Boolean,
  payments: [
    {
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ],
});

module.exports = mongoose.model("Debt", debtSchema);
