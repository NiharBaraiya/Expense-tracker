// routes/expenseRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const User = require("../models/User");
const Income = require("../models/Income");
const Debt = require("../models/Debt");
const sendOverspendEmail = require("../utils/sendOverspendNotification");
const {
  sendBudgetWarning,
  sendLargeExpenseAlert,
  sendSavingsAchievement,
  sendNegativeSavingsAlert,
  sendHighInterestDebtWarning,
} = require("../utils/emailNotifications");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper: Check all notifications after expense changes
const checkAllNotifications = async ({ userId, category, budgetId, expenseAmount, expenseTitle }) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // 1. Budget notifications (overspend, 75%, 90%)
    if (budgetId) {
      const budget = await Budget.findOne({ _id: budgetId, userId });
      if (budget) {
        const expenses = await Expense.find({ userId, category });
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = budget.amount > 0 ? ((totalSpent / budget.amount) * 100).toFixed(1) : 0;

        if (totalSpent > budget.amount) {
          // Overspend email (existing functionality)
          await sendOverspendEmail({
            email: user.email,
            category,
            budgetAmount: budget.amount,
            spentAmount: totalSpent,
          });
        } else if (percentage >= 90) {
          // 90% warning
          await sendBudgetWarning({
            userEmail: user.email,
            category,
            budgetAmount: budget.amount,
            spentAmount: totalSpent,
            percentage: parseFloat(percentage)
          });
        } else if (percentage >= 75) {
          // 75% warning
          await sendBudgetWarning({
            userEmail: user.email,
            category,
            budgetAmount: budget.amount,
            spentAmount: totalSpent,
            percentage: parseFloat(percentage)
          });
        }
      }
    }

    // 2. Large expense alert (threshold: ₹5000)
    const LARGE_EXPENSE_THRESHOLD = 5000;
    if (expenseAmount >= LARGE_EXPENSE_THRESHOLD) {
      await sendLargeExpenseAlert({
        userEmail: user.email,
        expenseTitle,
        amount: expenseAmount,
        category,
        threshold: LARGE_EXPENSE_THRESHOLD
      });
    }

    // 3. Savings and financial health notifications
    const [allExpenses, allIncomes, allDebts] = await Promise.all([
      Expense.find({ userId }),
      Income.find({ userId }),
      Debt.find({ userId })
    ]);

    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = allIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalDebts = allDebts.reduce((sum, d) => sum + d.amount, 0);
    const currentSavings = totalIncome - totalExpenses - totalDebts;

    // Check for negative savings
    if (currentSavings < 0) {
      await sendNegativeSavingsAlert({
        userEmail: user.email,
        savingsAmount: currentSavings,
        totalExpenses,
        totalIncome
      });
    }

    // Check for savings achievements (milestones: 10k, 50k, 100k)
    const savingsMilestones = [10000, 50000, 100000];
    for (const milestone of savingsMilestones) {
      if (currentSavings >= milestone) {
        // Check if we just crossed this milestone (prevent duplicate notifications)
        const previousSavings = currentSavings - expenseAmount;
        if (previousSavings < milestone) {
          await sendSavingsAchievement({
            userEmail: user.email,
            savingsAmount: currentSavings,
            achievement: `Saved ₹${milestone.toLocaleString()}!`
          });
        }
      }
    }

    // 4. High interest debt warnings (threshold: 18% interest)
    const HIGH_INTEREST_THRESHOLD = 18;
    for (const debt of allDebts) {
      // Use 'interest' field from debt model
      const interestRate = debt.interest || 0;
      if (interestRate >= HIGH_INTEREST_THRESHOLD) {
        await sendHighInterestDebtWarning({
          userEmail: user.email,
          debtTitle: debt.title || 'Unnamed Debt',
          amount: debt.amount,
          interestRate: interestRate
        });
      }
    }

  } catch (error) {
    console.error("❌ Error checking notifications:", error.message);
  }
};

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    console.log("Fetching expenses for user:", userId);
    
    const expenses = await Expense.find({ userId });
    console.log("Found expenses:", expenses.length);
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ 
      error: "Failed to fetch expenses", 
      details: error.message 
    });
  }
});

// ADD new expense
router.post("/add", async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { title, amount, currency, category, budgetId, date, notes } = req.body;

    // Create new expense
    const newExpense = new Expense({
      userId,
      title,
      amount,
      currency,
      category,
      budgetId,
      date,
      notes,
    });

    const savedExpense = await newExpense.save();

    // Check all notifications after adding expense
    await checkAllNotifications({ 
      userId, 
      category, 
      budgetId, 
      expenseAmount: amount,
      expenseTitle: title 
    });

    res.status(201).json(savedExpense);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Failed to add expense", details: err.message });
  }
});

// UPDATE existing expense
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware
    const { title, amount, currency, category, budgetId, date, notes } = req.body;

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Update fields  
    expense.title = title || expense.title;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.currency = currency || expense.currency;
    expense.category = category || expense.category;
    expense.budgetId = budgetId || expense.budgetId;
    expense.date = date || expense.date;
    expense.notes = notes || expense.notes;

    const updatedExpense = await expense.save();

    // Check all notifications after updating expense
    await checkAllNotifications({ 
      userId, 
      category: updatedExpense.category, 
      budgetId: updatedExpense.budgetId, 
      expenseAmount: updatedExpense.amount,
      expenseTitle: updatedExpense.title 
    });

    res.status(200).json(updatedExpense);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense", details: err.message });
  }
});

// DELETE expense
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // From auth middleware

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense", details: err.message });
  }
});

module.exports = router;
