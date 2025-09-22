const express = require("express");
const router = express.Router();
const savingsController = require("../controllers/savingsController");

// GET all goals
router.get("/", savingsController.getAllGoals);

// POST create a new goal
router.post("/", savingsController.createGoal);

// PUT update a goal
router.put("/:id", savingsController.updateGoal);

// DELETE a goal
router.delete("/:id", savingsController.deleteGoal);

module.exports = router;
