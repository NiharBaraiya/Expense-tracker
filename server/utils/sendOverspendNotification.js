// utils/sendOverspendNotification.js
const nodemailer = require("nodemailer");

const sendOverspendEmail = async ({ email, category, budgetAmount, spentAmount }) => {
  if (!email) {
    console.log("❌ No email provided for overspend notification");
    return;
  }

  console.log(`📧 Preparing to send overspend email to: ${email}`);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "baraiyanihar106@gmail.com", // Your Gmail (sender account)
        pass: "osrlpdvveiwnmjhe",         // Gmail App Password (no spaces)
      },
    });

    // Calculate overspent amount
    const overspentAmount = spentAmount - budgetAmount;
    const percentageOver = ((overspentAmount / budgetAmount) * 100).toFixed(1);

    const mailOptions = {
      from: "baraiyanihar106@gmail.com", // Sender (admin Gmail)
      to: email, // Recipient (user's email)
      subject: `⚠️ Budget Alert: You've Overspent in ${category}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">⚠️ Budget Overspend Alert</h2>
          <p>Hello,</p>
          <p>You have exceeded your budget limit for the <strong>${category}</strong> category.</p>
          
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #f57c00;">Budget Summary:</h3>
            <ul style="list-style: none; padding: 0;">
              <li>📊 <strong>Budget:</strong> ₹${budgetAmount}</li>
              <li>💸 <strong>Spent:</strong> ₹${spentAmount}</li>
              <li>⚠️ <strong>Overspent:</strong> ₹${overspentAmount} (${percentageOver}% over budget)</li>
            </ul>
          </div>
          
          <p>Consider reviewing your expenses and adjusting your spending to stay within your budget.</p>
          
          <p style="font-size: 12px; color: #666;">
            This is an automated notification from your Expense Tracker app.
          </p>
        </div>
      `,
      text: `⚠️ Budget Alert: You have overspent in "${category}". Budget: ₹${budgetAmount}, Spent: ₹${spentAmount}, Overspent: ₹${overspentAmount} (${percentageOver}% over budget).`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Overspend email successfully sent to: ${email}`);
  } catch (err) {
    console.error("❌ Failed to send overspend email to:", email);
    console.error("Error details:", err.message);
  }
};

module.exports = sendOverspendEmail;
