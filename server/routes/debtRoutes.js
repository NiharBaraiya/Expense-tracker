const express = require("express");
const { addDebt, getDebts, updateDebt, deleteDebt, addPayment } = require("../controllers/debtController");

const router = express.Router();

router.post("/", addDebt);
router.get("/", getDebts);
router.put("/:id", updateDebt);
router.delete("/:id", deleteDebt);
router.post("/:id/payment", addPayment);

module.exports = router;
