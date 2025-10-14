// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendMonthlySummaryEmail } = require("../utils/monthlySummaryEmail");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Send monthly summary email for current user
router.post("/monthly-summary", async (req, res) => {
  try {
    const userId = req.userId;
    const result = await sendMonthlySummaryEmail(userId);
    
    if (result.success) {
      res.json({ 
        message: "Monthly summary email sent successfully", 
        email: result.email 
      });
    } else {
      res.status(500).json({ 
        error: "Failed to send monthly summary email", 
        details: result.error 
      });
    }
  } catch (error) {
    console.error("Error sending monthly summary:", error);
    res.status(500).json({ error: "Failed to send monthly summary" });
  }
});

// Test all notifications for current user (development/testing only)
router.post("/test-notifications", async (req, res) => {
  try {
    const userId = req.userId;
    const User = require("../models/User");
    const user = await User.findById(userId);
    
    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      sendBudgetWarning,
      sendLargeExpenseAlert,
      sendRecurringDue,
      sendSavingsAchievement,
      sendNegativeSavingsAlert,
      sendHighInterestDebtWarning,
    } = require("../utils/emailNotifications");

    // Send test notifications
    await Promise.all([
      sendBudgetWarning({
        userEmail: user.email,
        category: "Test Category",
        budgetAmount: 1000,
        spentAmount: 900,
        percentage: 90
      }),
      sendLargeExpenseAlert({
        userEmail: user.email,
        expenseTitle: "Test Large Expense",
        amount: 6000,
        category: "Test",
        threshold: 5000
      }),
      sendSavingsAchievement({
        userEmail: user.email,
        savingsAmount: 15000,
        achievement: "Saved ₹15,000!"
      })
    ]);

    res.json({ 
      message: "Test notifications sent successfully", 
      email: user.email 
    });
  } catch (error) {
    console.error("Error sending test notifications:", error);
    res.status(500).json({ error: "Failed to send test notifications" });
  }
});

module.exports = router;