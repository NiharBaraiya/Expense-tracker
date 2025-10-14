const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
