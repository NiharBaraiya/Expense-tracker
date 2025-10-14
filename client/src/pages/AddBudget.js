// pages/AddBudget.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AddBudget.css';  // <-- Import CSS here

const AddBudget = () => {
  // Budget form state
  const [form, setForm] = useState({
    id: Date.now(),
    name: '',
    description: '',
    amount: '',
    currency: 'USD',
    category: 'Food',
    startDate: '',
    endDate: '',
  });

  // Expense form state
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    date: '',
    notes: '',
  });

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const navigate = useNavigate();

  // Load expenses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, budgetsRes] = await Promise.all([
          API.get('/expenses'),
          API.get('/budgets')
        ]);
        setExpenses(expensesRes.data);
        setBudgets(budgetsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Handle budget form changes
  const handleBudgetChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle expense form changes
  const handleExpenseChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  // Submit budget form (with override by category)
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/budgets/add", {
        name: form.name.trim(),
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      const data = res.data;
      alert(`✅ Budget Saved Successfully! (${data.category}: ${data.amount})`);
      console.log("Saved budget:", data);

      // Reset form
      setForm({
        id: Date.now(),
        name: '',
        description: '',
        amount: '',
        currency: 'USD',
        category: 'Food',
        startDate: '',
        endDate: '',
      });

    } catch (error) {
      console.error("Error:", error);
      alert(`❌ Failed to save budget: ${error.message}`);
    }
  };

  // Submit expense form
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    // Get current budgets from state instead of localStorage
    // Note: budgets state is already loaded from API
    const budgetIndex = budgets.findIndex((b) => b.id === form.id);

    if (budgetIndex === -1) {
      alert("⚠ Budget not found!");
      return;
    }

    const budget = budgets[budgetIndex];

    // Calculate total spent for this budget
    const totalSpent = expenses
      .filter((exp) => exp.budgetId === budget.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const newTotal = totalSpent + parseFloat(expense.amount);

    if (newTotal > parseFloat(budget.amount)) {
      if (!window.confirm(`⚠ This expense exceeds your budget (${budget.amount}). Add anyway?`)) {
        return;
      }
    }

    const newExpense = {
      ...expense,
      id: Date.now(),
      budgetId: budget.id,
    };

    try {
      // Send expense to backend
      const res = await API.post('/expenses/add', newExpense);

      // Update local state only
      const updatedExpenses = [...expenses, res.data];
      setExpenses(updatedExpenses);

      alert("✅ Expense Added Successfully!");
      console.log("Saved expense:", res.data);

      navigate("/dashboard"); // redirect after adding

      // Reset expense form
      setExpense({
        title: '',
        amount: '',
        date: '',
        notes: '',
      });

    } catch (error) {
      console.error("Error:", error);
      alert(`❌ Failed to save expense: ${error.message}`);
    }
  };

  return (
    <div className="add-budget-container">
      {/* Budget Form */}
      <form onSubmit={handleBudgetSubmit} className="budget-form">
        <h2>💼 Add Budget</h2>

        <label>Budget Name</label>
        <input
          name="name"
          placeholder="Budget Name"
          value={form.name}
          onChange={handleBudgetChange}
          required
        />

        <label>Budget Description (optional)</label>
        <textarea
          name="description"
          placeholder="Budget Description (optional)"
          value={form.description}
          onChange={handleBudgetChange}
        />

        <label>Total Amount</label>
        <input
          name="amount"
          type="number"
          placeholder="Total Amount"
          value={form.amount}
          onChange={handleBudgetChange}
          required
        />

        <label>Currency:</label>
        <select
          name="currency"
          value={form.currency}
          onChange={handleBudgetChange}
          required
        >
          <option value="USD">USD ($)</option>
          <option value="INR">INR (₹)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="AUD">AUD (A$)</option>
          <option value="CAD">CAD (C$)</option>
          <option value="CNY">CNY (¥)</option>
          <option value="SGD">SGD (S$)</option>
          <option value="AED">AED (د.إ)</option>
          <option value="CHF">CHF (CHF)</option>
          <option value="ZAR">ZAR (R)</option>
          <option value="NZD">NZD (NZ$)</option>
          <option value="HKD">HKD (HK$)</option>
          <option value="SEK">SEK (kr)</option>
          <option value="NOK">NOK (kr)</option>
          <option value="DKK">DKK (kr)</option>
          <option value="KRW">KRW (₩)</option>
          <option value="THB">THB (฿)</option>
          <option value="MYR">MYR (RM)</option>
          <option value="PHP">PHP (₱)</option>
          <option value="IDR">IDR (Rp)</option>
          <option value="VND">VND (₫)</option>
          <option value="PKR">PKR (₨)</option>
          <option value="BDT">BDT (৳)</option>
          <option value="SAR">SAR (﷼)</option>
          <option value="KWD">KWD (د.ك)</option>
          <option value="BHD">BHD (ب.د)</option>
          <option value="QAR">QAR (ر.ق)</option>
        </select>

        <label>Category:</label>
        <select
          name="category"
          value={form.category}
          onChange={handleBudgetChange}
          required
        >
          <option value="Food">Food</option>
          <option value="Housing">Housing</option>
          <option value="Transport">Transport</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Savings">Savings</option>
          <option value="Travel">Travel</option>
          <option value="Clothing">Clothing</option>
          <option value="Groceries">Groceries</option>
          <option value="Electricity">Electricity</option>
          <option value="Dining Out">Dining Out</option>
          <option value="Fuel">Fuel</option>
          <option value="Public Transport">Public Transport</option>
          <option value="Rent">Rent</option>
          <option value="Mortgage">Mortgage</option>
          <option value="Water">Water</option>
          <option value="Internet">Internet</option>
          <option value="Phone">Phone</option>
          <option value="Streaming Services">Streaming Services</option>
          <option value="Movies & Events">Movies & Events</option>
          <option value="Gaming">Gaming</option>
          <option value="Medical Bills">Medical Bills</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="School Fees">School Fees</option>
          <option value="Books & Supplies">Books & Supplies</option>
          <option value="Investments">Investments</option>
          <option value="Retirement">Retirement</option>
          <option value="Flights">Flights</option>
          <option value="Hotels">Hotels</option>
          <option value="Shoes & Accessories">Shoes & Accessories</option>
          <option value="Subscriptions">Subscriptions</option>
          <option value="Charity">Charity</option>
          <option value="Gifts">Gifts</option>
          <option value="Personal Care">Personal Care</option>
          <option value="Insurance">Insurance</option>
          <option value="Pets">Pets</option>
          <option value="Pet Food">Pet Food</option>
          <option value="Vet Bills">Vet Bills</option>
          <option value="Electronics">Electronics</option>
          <option value="Sports & Fitness">Sports & Fitness</option>
          <option value="Gym Membership">Gym Membership</option>
          <option value="Home Maintenance">Home Maintenance</option>
          <option value="Repairs">Repairs</option>
          <option value="Garden & Outdoor">Garden & Outdoor</option>
          <option value="Business Expenses">Business Expenses</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Taxes">Taxes</option>
          <option value="Loan Payments">Loan Payments</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>

        <label>Start Date:</label>
        <input
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleBudgetChange}
          required
        />

        <label>End Date:</label>
        <input
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleBudgetChange}
          required
        />

        <button type="submit">Add Budget</button>
      </form>

      {/* Uncomment below if you want to use Expense Form */}
      {/*
      <form
        onSubmit={handleExpenseSubmit}
        className="expense-form"
        style={{ maxWidth: '450px', margin: '40px auto 0' }}
      >
        <h3>Add Expense</h3>

        <label>Title</label>
        <input
          name="title"
          placeholder="Expense Title"
          value={expense.title}
          onChange={handleExpenseChange}
          required
        />

        <label>Amount</label>
        <input
          name="amount"
          type="number"
          placeholder="Expense Amount"
          value={expense.amount}
          onChange={handleExpenseChange}
          required
        />

        <label>Date</label>
        <input
          name="date"
          type="date"
          value={expense.date}
          onChange={handleExpenseChange}
          required
        />

        <label>Notes (optional)</label>
        <textarea
          name="notes"
          placeholder="Notes"
          value={expense.notes}
          onChange={handleExpenseChange}
        />

        <button type="submit">Add Expense</button>
      </form>
      */}
    </div>
  );
};

export default AddBudget;