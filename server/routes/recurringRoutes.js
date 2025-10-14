const express = require("express");
const router = express.Router();
const recurringController = require("../controllers/recurringController");
const authMiddleware = require("../middleware/authMiddleware");
const { sendRecurringDue } = require("../utils/emailNotifications");
const Recurring = require("../models/Recurring");
const User = require("../models/User");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", recurringController.getRecurring);
router.post("/", recurringController.addRecurring);
router.put("/:id", recurringController.updateRecurring);
router.delete("/:id", recurringController.deleteRecurring);

// Check and send recurring payment due notifications
router.get("/check-due", async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = new Date().toISOString().split("T")[0];
    const recurringItems = await Recurring.find({ userId });
    
    let sentNotifications = 0;
    
    for (const item of recurringItems) {
      const dueDate = new Date(item.nextDue).toISOString().split("T")[0];
      const isOverdue = dueDate < today;
      const isDueToday = dueDate === today;
      
      if (isOverdue || isDueToday) {
        await sendRecurringDue({
          userEmail: user.email,
          recurringTitle: item.title,
          amount: item.amount,
          type: item.type,
          nextDue: dueDate,
          isOverdue
        });
        sentNotifications++;
      }
    }
    
    res.json({ 
      message: `Checked recurring items, sent ${sentNotifications} notifications`,
      sentNotifications 
    });
  } catch (error) {
    console.error("Error checking recurring due:", error);
    res.status(500).json({ error: "Failed to check recurring items" });
  }
});

module.exports = router;
