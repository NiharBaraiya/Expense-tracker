/* eslint-disable react/prop-types */
// pages/AddExpense.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import "./AddExpense.css"; // ✅ Make sure this file contains matching CSS

const AddExpense = ({ userId }) => {
  useBodyScrollLock(true);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    category: "Food",
    budgetId: "",
    date: "",
    notes: "",
  });

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await API.get("/budgets");
        setBudgets(res.data);
      } catch (err) {
        console.error(err);
        alert("❌ Failed to load budgets");
      }
    };
    fetchBudgets();

    const fetchExpenses = async () => {
      const res = await API.get("/expenses").catch(() => null);
      if (res) setExpenses(res.data);
    };
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("⚠ Please enter an expense title.");
      return;
    }
    if (form.amount <= 0 || isNaN(form.amount)) {
      alert("⚠ Please enter a valid amount greater than 0.");
      return;
    }
    if (!form.date) {
      alert("⚠ Please select a date.");
      return;
    }

    const existingExpense = expenses.find(
      (exp) => exp.category === form.category && exp.budgetId === form.budgetId
    );

    try {
      let res;
      const payload = {
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        budgetId: form.budgetId,
        date: form.date,
        notes: form.notes.trim(),
        userId,
      };

      if (existingExpense) {
        payload.amount += parseFloat(existingExpense.amount);
        res = await API.put(`/expenses/update/${existingExpense._id}`, payload);
      } else {
        res = await API.post('/expenses/add', payload);
      }

      // With axios, data is directly available in res.data
      const data = res.data;
      console.log("Saved/Updated expense:", data);
      alert("✅ Expense saved/updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert(`❌ Failed to save/update expense: ${error.message}`);
    }
  };

  return (
    <div className="add-expense-container">
    
      <form onSubmit={handleSubmit} className="expense-form">
        {/* Expense Title */}
          <h2>💰 Add Expense</h2>
        <label htmlFor="title">Expense Title</label>
        <input
          id="title"
          name="title"
          placeholder="Expense Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        {/* Amount */}
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        {/* Currency */}
        <label htmlFor="currency">Currency:</label>
        <select
          id="currency"
          name="currency"
          value={form.currency}
          onChange={handleChange}
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

        {/* Category */}
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
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

        {/* Budget Link */}
        {budgets.length > 0 && (
          <>
            <label htmlFor="budgetId">Link to Budget (Optional):</label>
            <select
              id="budgetId"
              name="budgetId"
              value={form.budgetId}
              onChange={handleChange}
            >
              <option value="">-- No Budget --</option>
              {budgets.map((b) => (
                <option key={b._id || b.id} value={b._id || b.id}>
                  {b.name} ({b.amount} {b.currency})
                </option>
              ))}
            </select>
          </>
        )}

        {/* Date */}
        <label htmlFor="date">Date:</label>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        {/* Notes */}
        <label htmlFor="notes">Notes (optional):</label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
        />

        {/* Submit */}
        <button type="submit" className="save-button">
          💾 Save Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
