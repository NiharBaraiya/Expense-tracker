const express = require("express");
const {
  addBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const router = express.Router();

router.post("/add", addBudget);
router.get("/", getBudgets);
router.put("/update/:id", updateBudget);   // ✅ now matches frontend
router.delete("/delete/:id", deleteBudget);

module.exports = router;
