// utils/monthlySummaryEmail.js
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Income = require("../models/Income");
const Debt = require("../models/Debt");
const Recurring = require("../models/Recurring");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: "baraiyanihar106@gmail.com",
      pass: "osrlpdvveiwnmjhe",
    },
  });
};

const sendMonthlySummaryEmail = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.log("❌ User not found or no email");
      return;
    }

    // Get current month data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Fetch all data for current month
    const [expenses, budgets, incomes, debts, recurring] = await Promise.all([
      Expense.find({ 
        userId, 
        date: { $gte: startOfMonth, $lte: endOfMonth } 
      }),
      Budget.find({ userId }),
      Income.find({ 
        userId, 
        date: { $gte: startOfMonth, $lte: endOfMonth } 
      }),
      Debt.find({ userId }),
      Recurring.find({ userId })
    ]);

    // Calculate summaries
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const totalDebts = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);
    const netSavings = totalIncome - totalExpenses - totalDebts;

    // Top expense categories
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + (exp.amount || 0);
      return acc;
    }, {});
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Budget analysis
    const budgetAnalysis = budgets.map(budget => {
      const spent = expenses
        .filter(exp => exp.category === budget.category)
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const percentage = budget.amount > 0 ? ((spent / budget.amount) * 100).toFixed(1) : 0;
      const status = percentage >= 100 ? 'Over Budget' : 
                    percentage >= 90 ? 'Critical' : 
                    percentage >= 75 ? 'Warning' : 'Good';
      return { ...budget.toObject(), spent, percentage, status };
    });

    // Upcoming recurring items
    const upcomingRecurring = recurring.filter(item => {
      const dueDate = new Date(item.nextDue);
      const today = new Date();
      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && daysDiff >= 0; // Next 7 days
    });

    // Create email content
    const subject = `📊 Monthly Financial Summary - ${monthName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1976d2; text-align: center;">📊 Monthly Financial Summary</h1>
        <h2 style="color: #666; text-align: center;">${monthName}</h2>
        
        <!-- Financial Overview -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: white;">💰 Financial Overview</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
            <div>
              <strong>Total Income:</strong><br>
              <span style="font-size: 1.2em;">₹${totalIncome.toLocaleString()}</span>
            </div>
            <div>
              <strong>Total Expenses:</strong><br>
              <span style="font-size: 1.2em;">₹${totalExpenses.toLocaleString()}</span>
            </div>
            <div>
              <strong>Total Debts:</strong><br>
              <span style="font-size: 1.2em;">₹${totalDebts.toLocaleString()}</span>
            </div>
            <div>
              <strong>Net Savings:</strong><br>
              <span style="font-size: 1.2em; color: ${netSavings >= 0 ? '#4caf50' : '#f44336'};">
                ₹${netSavings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <!-- Top Expense Categories -->
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">📈 Top Expense Categories</h3>
          ${topCategories.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              ${topCategories.map(([category, amount]) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px; font-weight: bold;">${category}</td>
                  <td style="padding: 8px; text-align: right;">₹${amount.toLocaleString()}</td>
                  <td style="padding: 8px; text-align: right; color: #666;">
                    ${((amount / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : '<p>No expenses recorded this month.</p>'}
        </div>

        <!-- Budget Analysis -->
        <div style="background-color: #fff3e0; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f57c00;">🎯 Budget Analysis</h3>
          ${budgetAnalysis.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f57c00; color: white;">
                  <th style="padding: 10px; text-align: left;">Category</th>
                  <th style="padding: 10px; text-align: right;">Budget</th>
                  <th style="padding: 10px; text-align: right;">Spent</th>
                  <th style="padding: 10px; text-align: right;">%</th>
                  <th style="padding: 10px; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${budgetAnalysis.map(budget => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; font-weight: bold;">${budget.category}</td>
                    <td style="padding: 8px; text-align: right;">₹${budget.amount.toLocaleString()}</td>
                    <td style="padding: 8px; text-align: right;">₹${budget.spent.toLocaleString()}</td>
                    <td style="padding: 8px; text-align: right;">${budget.percentage}%</td>
                    <td style="padding: 8px; text-align: center;">
                      <span style="
                        padding: 4px 8px; 
                        border-radius: 12px; 
                        font-size: 0.8em; 
                        color: white;
                        background-color: ${
                          budget.status === 'Over Budget' ? '#f44336' :
                          budget.status === 'Critical' ? '#ff9800' :
                          budget.status === 'Warning' ? '#ffc107' : '#4caf50'
                        };
                      ">${budget.status}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No budgets set up yet.</p>'}
        </div>

        <!-- Upcoming Recurring Items -->
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4caf50;">🔄 Upcoming Recurring Items (Next 7 Days)</h3>
          ${upcomingRecurring.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #4caf50; color: white;">
                  <th style="padding: 10px; text-align: left;">Title</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                  <th style="padding: 10px; text-align: center;">Type</th>
                  <th style="padding: 10px; text-align: center;">Due Date</th>
                </tr>
              </thead>
              <tbody>
                ${upcomingRecurring.map(item => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; font-weight: bold;">${item.title}</td>
                    <td style="padding: 8px; text-align: right;">₹${item.amount.toLocaleString()}</td>
                    <td style="padding: 8px; text-align: center;">
                      ${item.type === 'expense' ? '💸 Expense' : '💰 Income'}
                    </td>
                    <td style="padding: 8px; text-align: center;">
                      ${new Date(item.nextDue).toLocaleDateString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No recurring items due in the next 7 days.</p>'}
        </div>

        <!-- Financial Health Tips -->
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1976d2;">💡 Financial Health Tips</h3>
          <ul style="color: #333; line-height: 1.6;">
            ${netSavings < 0 ? 
              '<li>⚠️ Your expenses exceed income. Consider reducing discretionary spending.</li>' : 
              '<li>✅ Great job maintaining positive savings!</li>'
            }
            ${budgetAnalysis.some(b => b.percentage >= 90) ? 
              '<li>🎯 Some budgets are near or over limit. Review high-spending categories.</li>' : 
              '<li>🎯 Your budget management looks good this month.</li>'
            }
            ${upcomingRecurring.length > 0 ? 
              `<li>🔄 You have ${upcomingRecurring.length} recurring items due soon. Don't forget to process them.</li>` : 
              '<li>🔄 No recurring items due soon.</li>'
            }
            <li>📊 Track your spending patterns to identify areas for improvement.</li>
            <li>💰 Consider setting aside an emergency fund if you haven't already.</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            This automated monthly summary was generated by your Expense Tracker app.<br>
            Keep up the great work managing your finances! 💪
          </p>
        </div>
      </div>
    `;

    const text = `
Monthly Financial Summary - ${monthName}

Financial Overview:
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Expenses: ₹${totalExpenses.toLocaleString()}
- Total Debts: ₹${totalDebts.toLocaleString()}
- Net Savings: ₹${netSavings.toLocaleString()}

Top Categories: ${topCategories.map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString()}`).join(', ')}

Budget Status: ${budgetAnalysis.filter(b => b.percentage >= 90).length} budgets need attention.

Upcoming Recurring: ${upcomingRecurring.length} items due in next 7 days.
    `;

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: "baraiyanihar106@gmail.com",
      to: user.email,
      subject,
      html,
      text,
    });

    console.log(`✅ Monthly summary email sent to: ${user.email}`);
    return { success: true, email: user.email };

  } catch (error) {
    console.error("❌ Failed to send monthly summary email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMonthlySummaryEmail };