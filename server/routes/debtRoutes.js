const express = require("express");
const { addDebt, getDebts, updateDebt, deleteDebt, addPayment } = require("../controllers/debtController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post("/", addDebt);
router.get("/", getDebts);
router.put("/:id", updateDebt);
router.delete("/:id", deleteDebt);
router.post("/:id/payment", addPayment);

module.exports = router;
