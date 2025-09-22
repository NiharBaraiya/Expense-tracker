const express = require("express");
const router = express.Router();
const recurringController = require("../controllers/recurringController");

router.get("/", recurringController.getRecurring);
router.post("/", recurringController.addRecurring);
router.put("/:id", recurringController.updateRecurring);
router.delete("/:id", recurringController.deleteRecurring);

module.exports = router;
