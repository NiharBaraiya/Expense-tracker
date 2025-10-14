// components/PDFReportButton.js
import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Chart from "chart.js/auto";
import API from "../api";
import "./PDFStyles.css";

const PDFReportButton = ({ expenses, budgets, debts, income, recurring }) => {
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null); // NEW: store Blob

  const generatePDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const reportDate = new Date().toLocaleString();

    // ===== Header =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Expense Tracker Report", 105, 15, { align: "center" });

    doc.setDrawColor(150);
    doc.line(20, 20, 190, 20);

    doc.setFontSize(15);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${reportDate}`, 20, 25);

    let currentY = 32;

    const checkAddPage = (neededSpace = 40) => {
      if (currentY + neededSpace > 270) {
        doc.addPage();
        currentY = 20;
      }
    };

    // ===== Expenses Table =====
    if (expenses.length > 0) {
      checkAddPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Expenses", 14, currentY);

      const expenseRows = expenses.map((exp) => [
        exp.date || "-",
        exp.category || "-",
        exp.title || exp.description || "-",
        `${exp.currency || "₹"} ${Number(exp.expenseAmount || exp.amount || 0).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Date", "Category", "Description", "Expense Amount"]],
        body: expenseRows,
        styles: { fontSize: 15 },
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      });

      currentY = doc.lastAutoTable.finalY + 12;
    }

    // ===== Budgets Table =====
    if (budgets.length > 0) {
      checkAddPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Budgets", 14, currentY);

      const budgetRows = budgets.map((b) => [
        b.name || "-",
        `${b.currency || "₹"} ${Number(b.amount || 0).toFixed(2)}`,
        b.category || "-",
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Budget Name", "Budget Amount", "Category"]],
        body: budgetRows,
        styles: { fontSize: 15 },
        headStyles: { fillColor: [39, 174, 96], textColor: 255 },
      });

      currentY = doc.lastAutoTable.finalY + 12;
    }

    // ===== Financial Summary =====
    if (budgets.length > 0) {
      checkAddPage();
      const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
      const totalExpenses = expenses.reduce(
        (sum, e) => sum + Number(e.expenseAmount || e.amount || 0),
        0
      );
      const remainingBalance = totalBudget - totalExpenses;
      const percentUsed = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Financial Summary", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        body: [
          ["Total Budget", `   ${totalBudget.toFixed(2)}`],
          ["Total Expenses", ` ${totalExpenses.toFixed(2)}`],
          ["Remaining Balance", ` ${remainingBalance.toFixed(2)}`],
          ["% of Budget Used", `${percentUsed}%`],
        ],
        theme: "grid",
        styles: { fontSize: 15 },
        columnStyles: { 0: { fontStyle: "bold", halign: "left" }, 1: { halign: "center" } },
      });

      currentY = doc.lastAutoTable.finalY + 12;
    }

    // ===== Smart Notifications =====
    let tips = [];
    budgets.forEach((b) => {
      const totalSpent = expenses
        .filter((e) => e.category === b.category)
        .reduce((sum, e) => sum + Number(e.expenseAmount || e.amount || 0), 0);
      const percentage = (totalSpent / b.amount) * 100;

      if (percentage >= 100) tips.push(`Overspent in "${b.category}" → Budget: ${b.currency}${b.amount}, Spent: ${b.currency}${totalSpent.toFixed(2)}`);
      else if (percentage >= 90) tips.push(`Nearly overspent: "${b.category}" budget 90%+ used`);
      else if (percentage >= 75) tips.push(`Warning: "${b.category}" budget 75% used`);
      else if (percentage >= 50) tips.push(`ℹ Half of "${b.category}" budget is used`);
      else if (percentage < 25 && totalSpent > 0) tips.push(`Good! "${b.category}" spending is under 25%`);
    });

    if (expenses.length === 0) tips.push("Add your first expense to start tracking!");

    if (tips.length > 0) {
      checkAddPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Smart Notifications & Tips", 14, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(15);

      tips.forEach((tip, i) => {
        checkAddPage(14);
        doc.text(`• ${tip}`, 16, currentY + (i + 1) * 6);
      });

      currentY += tips.length * 6 + 15;
    }

    // ===== Charts =====
    if (expenses.length > 0) {
      const categoryTotals = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.expenseAmount || e.amount || 0);
        return acc;
      }, {});
      const chartColors = ["#3498db", "#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#9b59b6"];

      // PIE CHART
      checkAddPage(180);
      const chartContainer = document.createElement("div");
      chartContainer.style.width = "400px";
      chartContainer.style.height = "300px";
      const canvas = document.createElement("canvas");
      chartContainer.appendChild(canvas);
      document.body.appendChild(chartContainer);

      new Chart(canvas, {
        type: "pie",
        data: { labels: Object.keys(categoryTotals), datasets: [{ data: Object.values(categoryTotals), backgroundColor: chartColors }] },
        options: { animation: false, plugins: { legend: { position: "bottom" } } },
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      const canvasImg = await html2canvas(chartContainer).then((c) => c.toDataURL("image/png"));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Expense Distribution by Category", 105, currentY, { align: "center" });
      doc.addImage(canvasImg, "PNG", 35, currentY + 5, 140, 100);
      document.body.removeChild(chartContainer);
      currentY += 120;

      // BAR CHART
      const budgetVsExpense = budgets.map((b) => {
        const spent = expenses
          .filter((e) => e.category === b.category)
          .reduce((sum, e) => sum + Number(e.expenseAmount || e.amount || 0), 0);
        return { category: b.category, budget: b.amount, spent, remaining: b.amount - spent };
      });

      checkAddPage(120);
      const chartContainer2 = document.createElement("div");
      chartContainer2.style.width = "400px";
      chartContainer2.style.height = "300px";
      const canvas2 = document.createElement("canvas");
      chartContainer2.appendChild(canvas2);
      document.body.appendChild(chartContainer2);

      new Chart(canvas2, {
        type: "bar",
        data: {
          labels: budgetVsExpense.map((d) => d.category),
          datasets: [
            { label: "Budget", data: budgetVsExpense.map((d) => d.budget), backgroundColor: "#2ecc71" },
            { label: "Spent", data: budgetVsExpense.map((d) => d.spent), backgroundColor: "#e74c3c" },
            { label: "Remaining", data: budgetVsExpense.map((d) => d.remaining), backgroundColor: "#3498db" },
          ],
        },
        options: { responsive: false, plugins: { legend: { position: "bottom" } } },
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      const canvasImg2 = await html2canvas(chartContainer2).then((c) => c.toDataURL("image/png"));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Budget vs Expenses per Category", 105, currentY, { align: "center" });
      doc.addImage(canvasImg2, "PNG", 20, currentY + 5, 170, 90);
      document.body.removeChild(chartContainer2);
      currentY += 110;
    }

    // ===== Footer =====
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated by Smart Expense Tracker | Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    // Save PDF locally
    doc.save("Expense_Report.pdf");

    // Store Base64 & Blob for email
    const base64 = doc.output("datauristring");
    setPdfBase64(base64);
    setPdfBlob(doc.output("blob")); // NEW: Blob for backend upload
  };

  const sendEmailReport = async () => {
    if (!pdfBlob) {
      alert("⚠️ Generate PDF first!");
      return;
    }

    const recipientEmail = prompt("Enter recipient email:");
    if (!recipientEmail) return;

    try {
      const formData = new FormData();
      formData.append("email", recipientEmail);
      formData.append("subject", "Expense Tracker Report");
      formData.append("text", "Here is your financial report from Expense Tracker.");
      formData.append("pdf", pdfBlob, "Expense_Report.pdf");

      await API.post("/email/send-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("📧 Email sent successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send email.");
    }
  };

  return (
    <div className="pdf-buttons-container">
      <button onClick={generatePDF} className="pdf-export-button">
        📄 Download Report
      </button>
      <button onClick={sendEmailReport} className="email-report-button">
        📧 Send Email Report
      </button>
    </div>
  );
};

export default PDFReportButton;
