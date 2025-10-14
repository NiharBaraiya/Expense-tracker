// routes/incomeRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all incomes
router.get("/", getAllIncomes);

// POST new income
router.post("/", addIncome);

// PUT update income
router.put("/:id", updateIncome);

// DELETE income
router.delete("/:id", deleteIncome);

module.exports = router;
