const express = require("express");
const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post("/add", addBudget);
router.get("/", getBudgets);
router.put("/update/:id", updateBudget);   // ✅ now matches frontend
router.delete("/delete/:id", deleteBudget);

module.exports = router;