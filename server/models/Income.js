// models/income.js
const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  source: { type: String },
  date: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true }); // automatically adds createdAt and updatedAt

module.exports = mongoose.model("Income", incomeSchema);
