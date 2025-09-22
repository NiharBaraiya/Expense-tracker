const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const router = express.Router();

// Configure multer to store file in memory
const upload = multer();

router.post("/send-report", upload.single("pdf"), async (req, res) => {
  try {
    const { email, subject, text } = req.body;
    const pdfBuffer = req.file?.buffer;

    if (!pdfBuffer) {
      return res.status(400).json({ success: false, message: "PDF file is missing" });
    }

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "baraiyanihar106@gmail.com", // your Gmail
        pass: "osrl pdvv eiwn mjhe",    // Gmail App Password
      },
    });

    const mailOptions = {
      from: "baraiyanihar106@gmail.com",
      to: email,
      subject: subject || "Expense Tracker Report",
      text: text || "Here is your financial report from Expense Tracker.",
      attachments: [
        {
          filename: "Financial_Report.pdf",
          content: pdfBuffer, // send the PDF buffer directly
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

module.exports = router;
