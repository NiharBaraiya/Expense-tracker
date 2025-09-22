const nodemailer = require("nodemailer");

const sendOverspendEmail = async ({ email, category, budgetAmount, spentAmount }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "baraiyanihar106@gmail.com",
        pass: "osrl pdvv eiwn mjhe",
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
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
