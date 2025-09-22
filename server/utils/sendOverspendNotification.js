// utils/sendOverspendNotification.js
const nodemailer = require("nodemailer");

const sendOverspendEmail = async ({ email, category, budgetAmount, spentAmount }) => {
  if (!email) return;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "baraiyanihar106@gmail.com", // Your Gmail
        pass: "osrlpdvveiwnmjhe",         // Gmail App Password (no spaces)
      },
    });

    const mailOptions = {
      from: "baraiyanihar106@gmail.com",
      to: email,
      subject: `⚠ Overspent Budget Alert: ${category}`,
      text: `You have overspent in "${category}". Budget: ${budgetAmount}, Spent: ${spentAmount}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Overspend email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send overspend email:", err);
  }
};

module.exports = sendOverspendEmail;
