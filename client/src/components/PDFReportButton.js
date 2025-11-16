/* eslint-env browser, es2020 */
// components/PDFReportButton.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import Chart from "chart.js/auto";
import API from "../api";
import "./PDFStyles.css";

// Theme colors
const colors = {
  blue: [30, 136, 229],
  green: [46, 204, 113],
  red: [229, 57, 53],
};

// ASCII sanitization for PDF text (avoid unsupported glyphs)
const sanitizeText = (s = "") => {
  let out = String(s);
  out = out.replaceAll("•", "-");
  out = out.replaceAll("→", "->");
  out = out.replaceAll("“", '"').replaceAll("”", '"');
  out = out.replaceAll("‘", "'").replaceAll("’", "'");
  out = out.replaceAll(/[\u{1F300}-\u{1FAFF}]/gu, ""); // remove emojis
  out = out.replaceAll(/[^\x20-\x7E]/g, "");
  return out;
};

// Header bar
const drawHeaderBar = (doc) => {
  doc.setFillColor(...colors.blue);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Expense Tracker Report", 10, 12);
  doc.setTextColor(0);
  // accent line under header for polish
  doc.setFillColor(24, 119, 200);
  doc.rect(0, 18, 210, 1, "F");
};

// Helpers for repeated layout and page breaks
const makePager = (doc) => {
  let y = 24;
  const ensure = (space = 40) => {
    if (y + space > 270) {
      doc.addPage();
      drawHeaderBar(doc);
      y = 24;
    }
  };
  const getY = () => y;
  const setY = (v) => {
    y = v;
  };
  return { ensure, getY, setY };
};

// Draw a colored section header band and advance Y
const drawSectionHeader = (doc, pager, title, color = [52, 152, 219]) => {
  pager.ensure(14);
  const y = pager.getY();
  const left = 14;
  const width = 210 - left * 2;
  const height = 8;
  doc.setFillColor(...color);
  doc.rect(left, y, width, height, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(sanitizeText(title), left + 2.5, y + 5.5);
  doc.setTextColor(0);
  pager.setY(y + height + 4);
};

// General helpers
const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "-");
const detectCurrency = (budgets, expenses) => {
  const cands = [
    ...(budgets?.map((b) => b.currency).filter(Boolean) || []),
    ...(expenses?.map((e) => e.currency).filter(Boolean) || []),
  ];
  return cands[0] || "USD";
};
const fmtCurr = (v, c = "USD") => {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);
  } catch {
    return `${c} ${n.toFixed(2)}`;
  }
};

// Date utilities
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const getMonthRange = (d) => {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end };
};
const daysBetween = (a, b) => Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
const isWithinNextDays = (date, days) => {
  if (!date) return false;
  const now = Date.now();
  const diff = new Date(date).getTime() - now;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
};

// Section renderers
const renderExpenses = (doc, pager, expenses, currency) => {
  if (!Array.isArray(expenses) || expenses.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Expenses", colors.blue);
  const startY = pager.getY();

  const expenseRows = expenses.map((exp) => [
    fmtDate(exp.date),
    sanitizeText(exp.category || "-"),
    sanitizeText(exp.title || exp.description || "-"),
    exp.currency ? fmtCurr(exp.expenseAmount ?? exp.amount, exp.currency) : fmtCurr(exp.expenseAmount ?? exp.amount, currency),
  ]);

  autoTable(doc, {
    startY: startY,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenseRows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: colors.blue, textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { halign: "center" }, 3: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderBudgets = (doc, pager, budgets, expenses, currency) => {
  if (!Array.isArray(budgets) || budgets.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Budgets", colors.green);
  const startY = pager.getY();

  const budgetRows = budgets.map((b) => {
    const spent = (expenses || [])
      .filter((e) => (e.budgetId ? String(e.budgetId) === String(b._id || b.id) : e.category === b.category))
      .reduce((sum, e) => sum + Number(e.expenseAmount ?? e.amount ?? 0), 0);
    const remaining = Number(b.amount || 0) - spent;
    return [
      sanitizeText(b.name || "-"),
      sanitizeText(b.category || "-"),
      fmtCurr(b.amount, b.currency || currency),
      fmtCurr(spent, b.currency || currency),
      fmtCurr(remaining, b.currency || currency),
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [["Name", "Category", "Amount", "Spent", "Remaining"]],
    body: budgetRows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: colors.green, textColor: 255, fontStyle: "bold" },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderSummary = (doc, pager, budgets, expenses, currency) => {
  if (!Array.isArray(budgets) || budgets.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Financial Summary", [22, 160, 133]);
  const startY = pager.getY();
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.expenseAmount || e.amount || 0),
    0
  );
  const remainingBalance = totalBudget - totalExpenses;
  const percentUsed = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0;

  autoTable(doc, {
    startY: startY,
    body: [
      ["Total Budget", fmtCurr(totalBudget, currency)],
      ["Total Expenses", fmtCurr(totalExpenses, currency)],
      ["Remaining Balance", fmtCurr(remainingBalance, currency)],
      ["% of Budget Used", `${percentUsed}%`],
    ],
    theme: "grid",
    styles: { fontSize: 12 },
    columnStyles: { 0: { fontStyle: "bold", halign: "left" }, 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 10);
};

const renderDataSummary = (doc, pager, { expenses, budgets, income, debts, recurring }) => {
  pager.ensure();
  drawSectionHeader(doc, pager, "Data Summary", [127, 140, 141]);
  const startY = pager.getY();
  const categories = new Set((expenses || []).map((e) => e.category).filter(Boolean));
  const currencies = new Set([
    ...((expenses || []).map((e) => e.currency).filter(Boolean)),
    ...((budgets || []).map((b) => b.currency).filter(Boolean)),
    ...((income || []).map((i) => i.currency).filter(Boolean)),
  ]);
  autoTable(doc, {
    startY: startY,
    body: [
      ["Expenses", String((expenses || []).length)],
      ["Budgets", String((budgets || []).length)],
      ["Income Records", String((income || []).length)],
      ["Debts", String((debts || []).length)],
      ["Recurring Items", String((recurring || []).length)],
      ["Categories", String(categories.size)],
      ["Currencies", String(currencies.size) || "-"],
    ],
    theme: "grid",
    styles: { fontSize: 12 },
    columnStyles: { 0: { fontStyle: "bold", halign: "left" }, 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderTips = (doc, pager, budgets, expenses) => {
  let tips = [];
  for (const b of budgets || []) {
    const totalSpent = (expenses || [])
      .filter((e) => e.category === b.category)
      .reduce((sum, e) => sum + Number(e.expenseAmount || e.amount || 0), 0);
    const percentage = b.amount ? (totalSpent / b.amount) * 100 : 0;

    if (percentage >= 100) tips.push(`Overspent in "${b.category}" -> Budget: ${b.currency}${b.amount}, Spent: ${b.currency}${totalSpent.toFixed(2)}`);
    else if (percentage >= 90) tips.push(`Nearly overspent: "${b.category}" budget 90%+ used`);
    else if (percentage >= 75) tips.push(`Warning: "${b.category}" budget 75% used`);
    else if (percentage >= 50) tips.push(`Half of "${b.category}" budget is used`);
    else if (percentage < 25 && totalSpent > 0) tips.push(`Good! "${b.category}" spending is under 25%`);
  }
  if ((expenses || []).length === 0) tips.push("Add your first expense to start tracking!");
  if (tips.length === 0) return;

  pager.ensure();
  drawSectionHeader(doc, pager, "Smart Notifications & Tips", [255, 167, 38]);
  const startY = pager.getY();

  autoTable(doc, {
    startY: startY,
    head: [["Tip"]],
    body: tips.map((t) => [sanitizeText(t)]),
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 2 },
    headStyles: { fillColor: [255, 167, 38], textColor: 0, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 180 } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderIncome = (doc, pager, income, currency) => {
  if (!Array.isArray(income) || income.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Income", [76, 175, 80]);
  const startY = pager.getY();

  const incomeRows = income.map((i) => [
    fmtDate(i.date || i.receivedDate),
    sanitizeText(i.source || i.title || i.category || "-"),
    fmtCurr(i.amount, i.currency || currency),
    sanitizeText(i.notes || i.description || ""),
  ]);

  autoTable(doc, {
    startY: startY,
    head: [["Date", "Source", "Amount", "Notes"]],
    body: incomeRows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { halign: "center" }, 2: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderDebts = (doc, pager, debts, currency) => {
  if (!Array.isArray(debts) || debts.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Debts", [231, 76, 60]);
  const startY = pager.getY();

  const debtRows = debts.map((d) => [
    sanitizeText(d.name || d.title || "-"),
    fmtCurr(d.amount, d.currency || currency),
    d.interestRate == null ? "-" : `${Number(d.interestRate)}%`,
    fmtDate(d.dueDate || d.nextPaymentDate),
    sanitizeText(d.status || ""),
  ]);

  autoTable(doc, {
    startY: startY,
    head: [["Name", "Amount", "Interest", "Due", "Status"]],
    body: debtRows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [244, 81, 30], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderRecurring = (doc, pager, recurring, currency) => {
  if (!Array.isArray(recurring) || recurring.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Recurring Payments", [33, 150, 243]);
  const startY = pager.getY();

  const recRows = recurring.map((r) => [
    sanitizeText(r.title || r.name || r.category || "-"),
    fmtCurr(r.amount, r.currency || currency),
    sanitizeText(r.frequency || r.interval || ""),
    fmtDate(r.nextDate || r.startDate),
  ]);

  autoTable(doc, {
    startY: startY,
    head: [["Title", "Amount", "Frequency", "Next Due"]],
    body: recRows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderCharts = async (doc, pager, expenses, budgets) => {
  if (!Array.isArray(expenses) || expenses.length === 0) return;
  const pageWidth = doc.internal.pageSize.getWidth();
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.expenseAmount || e.amount || 0);
    return acc;
  }, {});
  const chartColors = ["#1e88e5", "#2ecc71", "#f1c40f", "#e67e22", "#e53935", "#9b59b6"];

  // PIE CHART
  pager.ensure(140);
  // draw header and place image using current Y
  const chartContainer = document.createElement("div");
  chartContainer.style.width = "400px";
  chartContainer.style.height = "300px";
  chartContainer.className = "chart-container pdf-chart";
  const canvas = document.createElement("canvas");
  chartContainer.appendChild(canvas);
  document.body.appendChild(chartContainer);

  const pieChart = new Chart(canvas, {
    type: "pie",
    data: { labels: Object.keys(categoryTotals), datasets: [{ data: Object.values(categoryTotals), backgroundColor: chartColors, borderColor: "#ffffff", borderWidth: 2 }] },
    options: {
      animation: false,
      layout: { padding: 10 },
      plugins: {
        legend: { position: "bottom", labels: { color: "#2c3e50", font: { family: "Helvetica", size: 11 } } },
        tooltip: { enabled: false },
      },
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 500));
  const canvasImg = await html2canvas(chartContainer, { backgroundColor: "#ffffff" }).then((c) => c.toDataURL("image/png"));

  const pieW = 140, pieH = 100;
  const pieX = (pageWidth - pieW) / 2;
  drawSectionHeader(doc, pager, "Expense Distribution by Category", colors.blue);
  doc.addImage(canvasImg, "PNG", pieX, pager.getY(), pieW, pieH);
  pieChart.destroy();
  chartContainer.remove();
  pager.setY(pager.getY() + 120);

  // BAR CHART
  const budgetVsExpense = (budgets || []).map((b) => {
    const spent = (expenses || [])
      .filter((e) => e.category === b.category)
      .reduce((sum, e) => sum + Number(e.expenseAmount || e.amount || 0), 0);
    return { category: b.category, budget: b.amount, spent, remaining: b.amount - spent };
  });

  pager.ensure(110);
  const chartContainer2 = document.createElement("div");
  chartContainer2.style.width = "400px";
  chartContainer2.style.height = "300px";
  chartContainer2.className = "chart-container pdf-chart";
  const canvas2 = document.createElement("canvas");
  chartContainer2.appendChild(canvas2);
  document.body.appendChild(chartContainer2);

  const barChart = new Chart(canvas2, {
    type: "bar",
    data: {
      labels: budgetVsExpense.map((d) => d.category),
      datasets: [
        { label: "Budget", data: budgetVsExpense.map((d) => d.budget), backgroundColor: "#2ecc71", borderColor: "#27ae60", borderWidth: 1 },
        { label: "Spent", data: budgetVsExpense.map((d) => d.spent), backgroundColor: "#e74c3c", borderColor: "#c0392b", borderWidth: 1 },
        { label: "Remaining", data: budgetVsExpense.map((d) => d.remaining), backgroundColor: "#3498db", borderColor: "#2980b9", borderWidth: 1 },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: 10 },
      plugins: { legend: { position: "bottom", labels: { color: "#2c3e50", font: { family: "Helvetica", size: 11 } } }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { color: "#ecf0f1" }, ticks: { color: "#34495e", font: { family: "Helvetica", size: 10 } } },
        y: { beginAtZero: true, grid: { color: "#ecf0f1" }, ticks: { color: "#34495e", font: { family: "Helvetica", size: 10 } } },
      },
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 500));
  const canvasImg2 = await html2canvas(chartContainer2, { backgroundColor: "#ffffff" }).then((c) => c.toDataURL("image/png"));
  const barW = 170, barH = 90;
  const barX = (pageWidth - barW) / 2;
  drawSectionHeader(doc, pager, "Budget vs Expenses per Category", [52, 152, 219]);
  doc.addImage(canvasImg2, "PNG", barX, pager.getY(), barW, barH);
  barChart.destroy();
  chartContainer2.remove();
  pager.setY(pager.getY() + 110);
};

const renderFooter = (doc) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated by Smart Expense Tracker | Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
  }
};

const groupByCategoryTotals = (expenses = []) => {
  const totals = {};
  for (const e of expenses) {
    const key = e.category || "Uncategorized";
    totals[key] = (totals[key] || 0) + Number(e.expenseAmount || e.amount || 0);
  }
  return totals;
};

const renderCategoryOverview = (doc, pager, budgets, expenses, currency) => {
  const spentByCat = groupByCategoryTotals(expenses);
  // Build a set of categories from budgets and expenses
  const categories = Array.from(new Set([
    ...Object.keys(spentByCat),
    ...((budgets || []).map((b) => b.category || "").filter(Boolean)),
  ])).sort((a, b) => a.localeCompare(b));

  if (categories.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Category Overview", [52, 152, 219]);
  const startY = pager.getY();

  const rows = categories.map((cat) => {
    const b = (budgets || []).find((x) => x.category === cat);
    const budgetAmt = Number(b?.amount || 0);
    const curr = b?.currency || currency;
    const spent = Number(spentByCat[cat] || 0);
    const remaining = budgetAmt - spent;
    const pct = budgetAmt > 0 ? ((spent / budgetAmt) * 100) : 0;
    let status = "OK";
    if (pct >= 100) status = "Overspent";
    else if (pct >= 90) status = "Critical";
    else if (pct >= 75) status = "High";
    return [
      sanitizeText(cat || "-"),
      fmtCurr(budgetAmt, curr),
      fmtCurr(spent, curr),
      fmtCurr(remaining, curr),
      budgetAmt ? `${pct.toFixed(1)}%` : "-",
      status,
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [["Category", "Budget", "Spent", "Remaining", "% Used", "Status"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "center" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderTopExpenses = (doc, pager, expenses, currency, limit = 5) => {
  if (!Array.isArray(expenses) || expenses.length === 0) return;
  const sorted = [...expenses].sort((a, b) => Number(b.expenseAmount || b.amount || 0) - Number(a.expenseAmount || a.amount || 0));
  const top = sorted.slice(0, limit);
  pager.ensure();
  drawSectionHeader(doc, pager, `Top ${limit} Expenses`, [41, 128, 185]);
  const startY = pager.getY();

  const rows = top.map((e) => [
    fmtDate(e.date),
    sanitizeText(e.category || "-"),
    sanitizeText(e.title || e.description || "-"),
    fmtCurr(e.expenseAmount ?? e.amount, e.currency || currency),
  ]);

  autoTable(doc, {
    startY: startY,
    head: [["Date", "Category", "Description", "Amount"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { halign: "center" }, 3: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 8);
};

const monthlyKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const buildMonthlySeries = (items, dateSelector, amountSelector = (x) => x) => {
  items = items || [];
  const map = new Map();
  for (const it of items) {
    const dt = dateSelector(it);
    const amt = Number(amountSelector(it) || 0);
    if (!dt || Number.isNaN(amt)) continue;
    const key = monthlyKey(new Date(dt));
    map.set(key, (map.get(key) || 0) + amt);
  }
  // sort by key
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
};

const renderMonthlyTrends = async (doc, pager, expenses, income) => {
  const expSeries = buildMonthlySeries(expenses, (e) => e.date, (e) => e.expenseAmount || e.amount);
  const incSeries = buildMonthlySeries(income || [], (i) => i.date || i.receivedDate, (i) => i.amount);
  if (expSeries.length === 0 && incSeries.length === 0) return;

  const pageWidth = doc.internal.pageSize.getWidth();
  drawSectionHeader(doc, pager, "Monthly Trends: Income vs Expenses", [52, 152, 219]);
  pager.ensure(110);
  const y = pager.getY();
  const chartContainer = document.createElement("div");
  chartContainer.style.width = "440px";
  chartContainer.style.height = "260px";
  const cvs = document.createElement("canvas");
  chartContainer.appendChild(cvs);
  document.body.appendChild(chartContainer);

  // Merge x-axis labels
  const labels = Array.from(new Set([...(expSeries.map(([k]) => k)), ...(incSeries.map(([k]) => k))])).sort((a, b) => a.localeCompare(b));
  const expData = labels.map((k) => (expSeries.find(([x]) => x === k)?.[1] || 0));
  const incData = labels.map((k) => (incSeries.find(([x]) => x === k)?.[1] || 0));

  const line = new Chart(cvs, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Expenses", data: expData, borderColor: "#e74c3c", backgroundColor: "rgba(231,76,60,0.2)", tension: 0.25 },
        { label: "Income", data: incData, borderColor: "#2ecc71", backgroundColor: "rgba(46,204,113,0.2)", tension: 0.25 },
      ],
    },
    options: { responsive: false, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } },
  });

  await new Promise((r) => setTimeout(r, 500));
  const png = await html2canvas(chartContainer, { backgroundColor: "#ffffff" }).then((c) => c.toDataURL("image/png"));
  const w = 170, h = 100;
  const x = (pageWidth - w) / 2;
  doc.addImage(png, "PNG", x, y, w, h);
  line.destroy();
  chartContainer.remove();
  pager.setY(y + 120);
};

const renderForecast = (doc, pager, budgets, expenses, currency) => {
  if (!Array.isArray(expenses) || expenses.length === 0) return;
  pager.ensure();
  const today = new Date();
  drawSectionHeader(doc, pager, `Forecast (${monthKey(today)})`, [39, 174, 96]);
  const startY = pager.getY();
  const { start, end } = getMonthRange(today);
  const monthExpenses = (expenses || []).filter((e) => {
    const dt = e.date ? new Date(e.date) : null;
    return dt && dt >= start && dt <= end;
  });
  const spentSoFar = monthExpenses.reduce((s, e) => s + Number(e.expenseAmount || e.amount || 0), 0);
  const daysElapsed = Math.max(1, daysBetween(start, new Date()));
  const daysTotal = daysBetween(start, new Date(end.getFullYear(), end.getMonth(), end.getDate())) + 1;
  const daysLeft = Math.max(0, daysTotal - daysElapsed);
  const avgDaily = spentSoFar / daysElapsed;
  const forecast = spentSoFar + avgDaily * daysLeft;
  const totalBudget = (budgets || []).reduce((s, b) => s + Number(b.amount || 0), 0);
  const projectedRemaining = totalBudget - forecast;
  let risk = "OK";
  if (projectedRemaining < 0) risk = "Overspend";
  else if (projectedRemaining / (totalBudget || 1) < 0.1) risk = "Tight";

  autoTable(doc, {
    startY: startY,
    body: [
      ["Days (elapsed/total)", `${daysElapsed}/${daysTotal}`],
      ["Spent so far", fmtCurr(spentSoFar, currency)],
      ["Forecast month-end spend", fmtCurr(forecast, currency)],
      ["Total Budget", fmtCurr(totalBudget, currency)],
      ["Projected Remaining", fmtCurr(projectedRemaining, currency)],
      ["Risk", risk],
    ],
    theme: "grid",
    styles: { fontSize: 12 },
    columnStyles: { 0: { fontStyle: "bold", halign: "left" }, 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  pager.setY(doc.lastAutoTable.finalY + 10);
};

const renderUpcomingRecurring = (doc, pager, recurring, currency, days = 30) => {
  const upcoming = (recurring || []).filter((r) => isWithinNextDays(r.nextDate || r.startDate, days));
  if (upcoming.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, `Upcoming Recurring (next ${days} days)`, [52, 73, 94]);
  const startY = pager.getY();
  const rows = upcoming.map((r) => {
    const dt = r.nextDate || r.startDate;
    const due = dt ? new Date(dt) : null;
    const daysLeft = due ? daysBetween(new Date(), due) : null;
    return [
      sanitizeText(r.title || r.name || r.category || "-"),
      fmtCurr(r.amount, r.currency || currency),
      fmtDate(dt),
      daysLeft == null ? "-" : `${daysLeft} days`,
    ];
  });
  autoTable(doc, {
    startY: startY,
    head: [["Title", "Amount", "Next Due", "Time Left"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" }, 3: { halign: "center" } },
    margin: { left: 14, right: 14 },
  });
  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderDebtInterest = (doc, pager, debts, currency) => {
  const withRates = (debts || []).filter((d) => d.interestRate != null);
  if (withRates.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Debt Interest Projection", [231, 76, 60]);
  const startY = pager.getY();
  const rows = withRates.map((d) => {
    const amt = Number(d.amount || 0);
    const rate = Number(d.interestRate || 0);
    const monthly = (amt * (rate / 100)) / 12;
    return [sanitizeText(d.name || d.title || "-"), fmtCurr(amt, d.currency || currency), `${rate}%`, fmtCurr(monthly, d.currency || currency)];
  });
  autoTable(doc, {
    startY: startY,
    head: [["Debt", "Amount", "APR", "Est. Monthly Interest"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" }, 3: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  pager.setY(doc.lastAutoTable.finalY + 8);
};

const estimateMonthlyFromFrequency = (freqRaw) => {
  const freq = String(freqRaw || "").toLowerCase();
  if (!freq) return 0;
  if (freq.includes("week")) return 4.33; // weekly
  if (freq.includes("bi") && freq.includes("week")) return 2.165; // bi-weekly
  if (freq.includes("day")) return 30;
  if (freq.includes("quarter")) return 1 / 3;
  if (freq.includes("year")) return 1 / 12;
  if (freq.includes("month")) return 1;
  return 1; // default assume monthly
};

const renderKPIs = (doc, pager, budgets, expenses, income, recurring, currency) => {
  pager.ensure();
  drawSectionHeader(doc, pager, "Key Indicators", [52, 73, 94]);
  const startY = pager.getY();
  const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.expenseAmount || e.amount || 0), 0);
  const totalIncome = (income || []).reduce((s, i) => s + Number(i.amount || 0), 0);
  const net = totalIncome - totalExpenses;
  const dates = (expenses || []).map((e) => e.date && new Date(e.date)).filter(Boolean).sort((a, b) => a - b);
  const days = dates.length ? Math.max(1, Math.ceil((dates.at(-1) - dates[0]) / (1000 * 60 * 60 * 24))) : 30;
  const avgDaily = totalExpenses / days;
  const spentByCat = groupByCategoryTotals(expenses);
  const overspentCount = (budgets || []).filter((b) => (spentByCat[b.category] || 0) > (b.amount || 0)).length;
  const topCategory = Object.entries(spentByCat).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const monthlyRecurring = (recurring || []).reduce((s, r) => s + Number(r.amount || 0) * estimateMonthlyFromFrequency(r.frequency || r.interval), 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "-";

  autoTable(doc, {
    startY: startY,
    body: [
      ["Total Income", fmtCurr(totalIncome, currency)],
      ["Total Expenses", fmtCurr(totalExpenses, currency)],
      ["Net (Income - Expenses)", fmtCurr(net, currency)],
      ["Avg Daily Spend", fmtCurr(avgDaily, currency)],
      ["Overspent Categories", String(overspentCount)],
      ["Top Spending Category", sanitizeText(topCategory)],
      ["Baseline Monthly Recurring", fmtCurr(monthlyRecurring, currency)],
      ["Savings Rate", typeof savingsRate === "string" ? savingsRate : `${savingsRate}%`],
    ],
    theme: "grid",
    styles: { fontSize: 12 },
    columnStyles: { 0: { fontStyle: "bold", halign: "left" }, 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  pager.setY(doc.lastAutoTable.finalY + 10);
};

const renderSavingsGoals = (doc, pager, savingsGoals, currency) => {
  if (!Array.isArray(savingsGoals) || savingsGoals.length === 0) return;
  pager.ensure();
  drawSectionHeader(doc, pager, "Savings Goals", [22, 160, 133]);
  const startY = pager.getY();
  const rows = savingsGoals.map((g) => {
    const deadline = g.deadline ? new Date(g.deadline) : null;
    const now = Date.now();
    const daysLeft = deadline ? Math.ceil((deadline.getTime() - now) / (1000 * 60 * 60 * 24)) : null;
    let status;
    if (daysLeft == null) status = "-";
    else if (daysLeft >= 0) status = `${daysLeft} days left`;
    else status = `${Math.abs(daysLeft)} days overdue`;
    return [fmtCurr(g.amount, g.currency || currency), fmtDate(g.deadline), status];
  });
  autoTable(doc, {
    startY: startY,
    head: [["Goal Amount", "Deadline", "Status"]],
    body: rows,
    theme: "striped",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  pager.setY(doc.lastAutoTable.finalY + 8);
};

const renderRecommendations = (doc, pager) => {
  pager.ensure();
  drawSectionHeader(doc, pager, "Smart Budgeting Recommendations", [127, 140, 141]);
  const startY = pager.getY();
  const recs = [
    ["Use 50/30/20", "50% needs, 30% wants, 20% savings/investing"],
    ["Set alerts", "Notify at 75% and 90% of budget used"],
    ["Automate savings", "Transfer to savings on payday to pay yourself first"],
    ["Review subscriptions", "Cancel low-value recurring charges"],
    ["Build emergency fund", "Target 3–6 months of expenses"],
  ];
  autoTable(doc, {
    startY: startY,
    head: [["Recommendation", "Why it helps"]],
    body: recs.map(([a, b]) => [sanitizeText(a), sanitizeText(b)]),
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 2.5 },
    headStyles: { fillColor: [127, 140, 141], textColor: 255, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
  });
  pager.setY(doc.lastAutoTable.finalY + 8);
};

const PDFReportButton = ({ expenses, budgets, debts, income, recurring, savingsGoals }) => {

  const [pdfBlob, setPdfBlob] = useState(null); // NEW: store Blob

  const generatePDF = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const primaryCurrency = detectCurrency(budgets, expenses);

    // Report period
    const dates = (expenses || [])
      .map((e) => (e.date ? new Date(e.date) : null))
      .filter(Boolean)
      .sort((a, b) => a - b);
    const fromDate = dates[0] ? dates[0].toISOString().slice(0, 10) : null;
    const toDate = dates.length ? dates.at(-1).toISOString().slice(0, 10) : null;
    const reportDate = new Date().toLocaleString();

    // Header
    drawHeaderBar(doc);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Period: ${fromDate || '-'} to ${toDate || '-'}`, 10, 20);
    doc.text(`Generated: ${reportDate}`, 200, 20, { align: "right" });
    doc.setTextColor(0);

  // Pager state
    const pager = makePager(doc);

    // Main sections
  renderKPIs(doc, pager, budgets, expenses, income, recurring, primaryCurrency);
  renderDataSummary(doc, pager, { expenses, budgets, income, debts, recurring });
  renderCategoryOverview(doc, pager, budgets, expenses, primaryCurrency);
  renderForecast(doc, pager, budgets, expenses, primaryCurrency);
    renderExpenses(doc, pager, expenses, primaryCurrency);
  renderTopExpenses(doc, pager, expenses, primaryCurrency, 5);
    renderBudgets(doc, pager, budgets, expenses, primaryCurrency);
    renderSummary(doc, pager, budgets, expenses, primaryCurrency);
    renderTips(doc, pager, budgets, expenses);
    renderIncome(doc, pager, income, primaryCurrency);
    renderDebts(doc, pager, debts, primaryCurrency);
    renderDebtInterest(doc, pager, debts, primaryCurrency);
    renderRecurring(doc, pager, recurring, primaryCurrency);
    renderUpcomingRecurring(doc, pager, recurring, primaryCurrency, 30);
    await renderCharts(doc, pager, expenses, budgets);
  await renderMonthlyTrends(doc, pager, expenses, income);
  renderSavingsGoals(doc, pager, savingsGoals, primaryCurrency);
  renderRecommendations(doc, pager);

    // Footer
    renderFooter(doc);

    // Save PDF locally
    doc.save("Expense_Report.pdf");

    // Store Base64 & Blob for email
  // Also keep a Blob for backend upload
  setPdfBlob(doc.output("blob")); // NEW: Blob for backend upload
  };

  const sendEmailReport = async () => {
    if (!pdfBlob) {
      alert("⚠️ Generate PDF first!");
      return;
    }

    const recipientEmail = globalThis?.prompt?.("Enter recipient email:");
    if (!recipientEmail) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

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
      <br></br>
      <br></br>
      <button onClick={sendEmailReport} className="email-report-button">
        📧 Send Email Report
      </button>
    </div>
  );
};

export default PDFReportButton;

PDFReportButton.propTypes = {
  expenses: PropTypes.arrayOf(PropTypes.object),
  budgets: PropTypes.arrayOf(PropTypes.object),
  debts: PropTypes.arrayOf(PropTypes.object),
  income: PropTypes.arrayOf(PropTypes.object),
  recurring: PropTypes.arrayOf(PropTypes.object),
  savingsGoals: PropTypes.arrayOf(PropTypes.object),
};

PDFReportButton.defaultProps = {
  expenses: [],
  budgets: [],
  debts: [],
  income: [],
  recurring: [],
  savingsGoals: [],
};
