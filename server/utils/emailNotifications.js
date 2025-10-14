// utils/emailNotifications.js
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

// Generic email sender
const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: "baraiyanihar106@gmail.com",
      to,
      subject,
      html,
      text,
    });
    console.log(`✅ Email sent successfully to: ${to} - Subject: ${subject}`);
  } catch (error) {
    console.error(`❌ Failed to send email to: ${to} - Error:`, error.message);
  }
};

// 1. Budget Warning Notifications (75% and 90%)
const sendBudgetWarning = async ({ userEmail, category, budgetAmount, spentAmount, percentage }) => {
  const remaining = budgetAmount - spentAmount;
  const warningType = percentage >= 90 ? "CRITICAL" : "WARNING";
  const warningIcon = percentage >= 90 ? "🚨" : "⚠️";
  
  const subject = `${warningIcon} Budget ${warningType}: ${percentage}% Used in ${category}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${percentage >= 90 ? '#d32f2f' : '#f57c00'};">${warningIcon} Budget ${warningType}</h2>
      <p>Hello,</p>
      <p>You have used <strong>${percentage}%</strong> of your budget for <strong>${category}</strong>.</p>
      
      <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #f57c00;">Budget Status:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>📊 <strong>Budget:</strong> ₹${budgetAmount}</li>
          <li>💸 <strong>Spent:</strong> ₹${spentAmount}</li>
          <li>💰 <strong>Remaining:</strong> ₹${remaining}</li>
          <li>📈 <strong>Usage:</strong> ${percentage}%</li>
        </ul>
      </div>
      
      <p>${percentage >= 90 ? 
        'You are very close to exceeding your budget. Please review your upcoming expenses.' : 
        'Consider monitoring your remaining expenses to stay within budget.'}</p>
      
      <p style="font-size: 12px; color: #666;">
        This is an automated notification from your Expense Tracker app.
      </p>
    </div>
  `;
  
  const text = `${warningIcon} You have used ${percentage}% of your ${category} budget (₹${spentAmount} of ₹${budgetAmount}). Remaining: ₹${remaining}`;
  
  await sendEmail(userEmail, subject, html, text);
};

// 2. Large Expense Alert
const sendLargeExpenseAlert = async ({ userEmail, expenseTitle, amount, category, threshold }) => {
  const subject = `💳 Large Expense Alert: ₹${amount} spent on ${expenseTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">💳 Large Expense Alert</h2>
      <p>Hello,</p>
      <p>You have made a significant expense that exceeds your large expense threshold.</p>
      
      <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #d32f2f;">Expense Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>📝 <strong>Title:</strong> ${expenseTitle}</li>
          <li>💰 <strong>Amount:</strong> ₹${amount}</li>
          <li>📂 <strong>Category:</strong> ${category}</li>
          <li>⚡ <strong>Threshold:</strong> ₹${threshold}</li>
        </ul>
      </div>
      
      <p>Please ensure this expense was intentional and properly categorized.</p>
      
      <p style="font-size: 12px; color: #666;">
        This is an automated notification from your Expense Tracker app.
      </p>
    </div>
  `;
  
  const text = `💳 Large expense alert: ₹${amount} spent on "${expenseTitle}" in ${category} category (threshold: ₹${threshold})`;
  
  await sendEmail(userEmail, subject, html, text);
};

// 3. Recurring Payment Due
const sendRecurringDue = async ({ userEmail, recurringTitle, amount, type, nextDue, isOverdue }) => {
  const statusIcon = isOverdue ? "🚨" : "⏰";
  const statusText = isOverdue ? "OVERDUE" : "DUE TODAY";
  const subject = `${statusIcon} Recurring ${type.toUpperCase()} ${statusText}: ${recurringTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isOverdue ? '#d32f2f' : '#f57c00'};">${statusIcon} Recurring ${type.toUpperCase()} ${statusText}</h2>
      <p>Hello,</p>
      <p>Your recurring ${type} "<strong>${recurringTitle}</strong>" is ${isOverdue ? 'overdue' : 'due today'}.</p>
      
      <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #f57c00;">Recurring Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>📝 <strong>Title:</strong> ${recurringTitle}</li>
          <li>💰 <strong>Amount:</strong> ₹${amount}</li>
          <li>🔄 <strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</li>
          <li>📅 <strong>Due Date:</strong> ${nextDue}</li>
        </ul>
      </div>
      
      <p>${isOverdue ? 
        'Please process this overdue item as soon as possible.' : 
        'You can process this item in your Expense Tracker app.'}</p>
      
      <p style="font-size: 12px; color: #666;">
        This is an automated notification from your Expense Tracker app.
      </p>
    </div>
  `;
  
  const text = `${statusIcon} Your recurring ${type} "${recurringTitle}" (₹${amount}) is ${isOverdue ? 'overdue' : 'due today'}. Due date: ${nextDue}`;
  
  await sendEmail(userEmail, subject, html, text);
};

// 4. Savings Achievement
const sendSavingsAchievement = async ({ userEmail, savingsAmount, achievement }) => {
  const subject = `🎉 Savings Achievement: ${achievement}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4caf50;">🎉 Savings Achievement Unlocked!</h2>
      <p>Hello,</p>
      <p>Congratulations! You have achieved a savings milestone.</p>
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #4caf50;">Achievement Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>🎯 <strong>Achievement:</strong> ${achievement}</li>
          <li>💰 <strong>Current Savings:</strong> ₹${savingsAmount}</li>
        </ul>
      </div>
      
      <p>Keep up the great work with your financial goals!</p>
      
      <p style="font-size: 12px; color: #666;">
        This is an automated notification from your Expense Tracker app.
      </p>
    </div>
  `;
  
  const text = `🎉 Savings achievement unlocked: ${achievement}! Current savings: ₹${savingsAmount}`;
  
  await sendEmail(userEmail, subject, html, text);
};

// 5. Negative Savings Alert
const sendNegativeSavingsAlert = async ({ userEmail, savingsAmount, totalExpenses, totalIncome }) => {
  const deficit = Math.abs(savingsAmount);
  const subject = `⚠️ Negative Savings Alert: -₹${deficit}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">⚠️ Negative Savings Alert</h2>
      <p>Hello,</p>
      <p>Your current savings are negative, meaning your expenses exceed your income.</p>
      
      <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #d32f2f;">Financial Summary:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>💰 <strong>Total Income:</strong> ₹${totalIncome}</li>
          <li>💸 <strong>Total Expenses:</strong> ₹${totalExpenses}</li>
          <li>⚠️ <strong>Deficit:</strong> -₹${deficit}</li>
        </ul>
      </div>
      
      <p>Consider reviewing your expenses and finding areas to reduce spending, or look for ways to increase your income.</p>
      
      <p style="font-size: 12px; color: #666;">
        This is an automated notification from your Expense Tracker app.
      </p>
    </div>
  `;
  
  const text = `⚠️ Negative savings alert: Your expenses (₹${totalExpenses}) exceed your income (₹${totalIncome}) by ₹${deficit}`;
  
  await sendEmail(userEmail, subject, html, text);
};

// 6. High Interest Debt Warning
const sendHighInterestDebtWarning = async ({ userEmail, debtTitle, amount, interestRate }) => {
  const subject = `🔴 High Interest Debt Warning: ${debtTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d32f2f;">🔴 High Interest Debt Warning</h2>
      <p>Hello,</p>
      <p>You have a high-interest debt that requires immediate attention.</p>
      
      <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #d32f2f;">Debt Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li>📝 <strong>Debt:</strong> ${debtTitle}</li>
          <li>💰 <strong>Amount:</strong> ₹${amount}</li>
          <li>📈 <strong>Interest Rate:</strong> ${interestRate}%</li>
        </ul>
      </div>
      
      <p>Consider prioritizing this debt payment to avoid accumulating excessive interest charges.</p>
      
      <p style="font-size: 12px; color: #666;">
        This is an automated notification from your Expense Tracker app.
      </p>
    </div>
  `;
  
  const text = `🔴 High interest debt warning: "${debtTitle}" (₹${amount}) has ${interestRate}% interest rate. Consider prioritizing payment.`;
  
  await sendEmail(userEmail, subject, html, text);
};

module.exports = {
  sendBudgetWarning,
  sendLargeExpenseAlert,
  sendRecurringDue,
  sendSavingsAchievement,
  sendNegativeSavingsAlert,
  sendHighInterestDebtWarning,
};