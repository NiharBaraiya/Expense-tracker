/* eslint-env browser, es2020 */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../api";
import "./ViewTheme.css";

const ViewExpenses = ({ budgetId, embedded = false }) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewBudgetId, setViewBudgetId] = useState(null);
  const [showBudgetExpenses, setShowBudgetExpenses] = useState(false);

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [expenseRes, budgetRes] = await Promise.all([
        API.get("/expenses"),
        API.get("/budgets"),
      ]);

      const expenseData = expenseRes.data;
      const budgetData = budgetRes.data;

      const normalizedExpenses = expenseData.map((e) => ({
        ...e,
        id: e._id || e.id,
        amount: Number(e.amount) || 0,
      }));

      const normalizedBudgets = budgetData.map((b) => ({
        ...b,
        id: b._id || b.id,
      }));

      if (budgetId) {
        setExpenses(
          normalizedExpenses.filter(
            (e) => String(e.budgetId) === String(budgetId)
          )
        );
      } else {
        setExpenses(normalizedExpenses);
      }

      setBudgets(normalizedBudgets);
    } catch (err) {
      console.error("Error loading data:", err);
      alert("❌ Failed to load data from backend.");
    }
  }, [budgetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBudgetById = (id) => {
    return budgets.find((b) => String(b.id) === String(id));
  };

  const getTotalSpent = (bId) => {
    return expenses
      .filter((exp) => String(exp.budgetId) === String(bId))
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleDeleteExpense = async (id) => {
    if (!globalThis?.confirm?.("Are you sure you want to delete this expense?")) return;

    try {
      await API.delete(`/expenses/delete/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete expense.");
    }
  };

  const handleEditClick = (expense) => {
    setEditId(expense.id);
    setEditForm({
      ...expense,
      amount: String(expense.amount),
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await API.put(`/expenses/update/${editId}`, {
        ...editForm,
        amount: Number(editForm.amount),
      });

      setEditId(null);
      setEditForm({});
      loadData();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update expense.");
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleDeleteBudget = async (id) => {
    if (!globalThis?.confirm?.("Are you sure you want to delete this budget?")) return;

    try {
      await API.delete(`/budgets/delete/${id}`);
      loadData();
      setViewBudgetId(null);
      setShowBudgetExpenses(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete budget.");
    }
  };

  const handleViewBudget = (bId) => {
    setViewBudgetId(bId);
    setShowBudgetExpenses(false);
  };

  const handleViewBudgetExpenses = () => {
    setShowBudgetExpenses(true);
  };

  const formatDate = (d) => (d ? String(d).substring(0, 10) : "-");

  return (
    <div className={embedded ? undefined : "view-container theme-bgr"}>
      {expenses.length === 0 ? (
        <p className="list-card" style={{ textAlign: "center" }}>
          No expenses found.
        </p>
      ) : (
        <div className="list-card" style={{ overflowX: "auto" }}>
          {!embedded && <h2 className="view-heading">📋 All Expenses</h2>}
          <br />
          <br />
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) =>
                editId === expense.id ? (
                  <tr key={expense.id} className="is-editing">
                    <td>
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <select
                        name="currency"
                        value={editForm.currency}
                        onChange={handleEditChange}
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
                    </td>
                    <td>
                      <input
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <select
                        name="budgetId"
                        value={editForm.budgetId}
                        onChange={handleEditChange}
                      >
                        <option value="">No Budget Linked</option>
                        {budgets.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.amount} {b.currency})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <input
                        name="notes"
                        value={editForm.notes}
                        onChange={handleEditChange}
                      />
                    </td>
                    <td>
                      <button className="btn btn-green" onClick={handleSaveEdit}>
                        💾 Save
                      </button>
                      <button className="btn btn-ghost" onClick={handleCancelEdit}>
                        ❌ Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td>{expense.amount.toFixed(2)}</td>
                    <td>{expense.currency}</td>
                    <td>{expense.category}</td>
                    <td>
                      {getBudgetById(expense.budgetId)
                        ? getBudgetById(expense.budgetId).name
                        : "No Budget Linked"}
                    </td>
                    <td>{formatDate(expense.date)}</td>
                    <td>{expense.notes || "-"}</td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-orange"
                        onClick={() => handleEditClick(expense)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-red"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        ❌ Delete
                      </button>
                      {expense.budgetId && (
                        <button
                          className="btn btn-blue"
                          onClick={() => handleViewBudget(expense.budgetId)}
                        >
                          📊 View Budget
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          {!embedded && (
            <>
              <br />
              <div style={{ marginTop: 10 }}>
                <button
                  className="btn btn-blue"
                  onClick={() => navigate("/add-expense")}
                >
                  + Add New Expense  
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!embedded && (viewBudgetId || showBudgetExpenses) && (
        <div style={{ width: 'min(1100px,95vw)' }}>
          <button
            className="btn btn-ghost"
            style={{ marginBottom: 10 }}
            onClick={() => {
              setViewBudgetId(null);
              setShowBudgetExpenses(false);
            }}
          >
            ← Back to Expenses
          </button>
          <br />
          <br />
        </div>
      )}

      {viewBudgetId && getBudgetById(viewBudgetId) && (
        <div className="list-card" style={{ width: "min(1100px,95vw)" }}>
          <h3 style={{ marginTop: 0 }}>📌 Budget Details</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Currency</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{getBudgetById(viewBudgetId).name}</td>
                <td>{getBudgetById(viewBudgetId).category}</td>
                <td>{getBudgetById(viewBudgetId).amount}</td>
                <td>{getTotalSpent(viewBudgetId)}</td>
                <td
                  style={{
                    color:
                      getBudgetById(viewBudgetId).amount -
                        getTotalSpent(viewBudgetId) <
                      0
                        ? "red"
                        : "green",
                  }}
                >
                  {getBudgetById(viewBudgetId).amount -
                    getTotalSpent(viewBudgetId)}
                </td>
                <td>{getBudgetById(viewBudgetId).currency}</td>
                <td>
                  {formatDate(getBudgetById(viewBudgetId).startDate)} →{" "}
                  {formatDate(getBudgetById(viewBudgetId).endDate)}
                </td>
                <td>
                  <button
                    className="btn btn-orange"
                    onClick={() => navigate(`/edit-budget/${viewBudgetId}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-red"
                    onClick={() => handleDeleteBudget(viewBudgetId)}
                  >
                    ❌ Delete
                  </button>
                  <button
                    className="btn btn-blue"
                    onClick={handleViewBudgetExpenses}
                  >
                    📄 View Expenses
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showBudgetExpenses && viewBudgetId && (
        <div className="list-card" style={{ width: "min(1100px,95vw)" }}>
          <h3 style={{ marginTop: 0 }}>💰 Expenses for Selected Budget</h3>
          {expenses.filter((e) => String(e.budgetId) === String(viewBudgetId))
            .length === 0 ? (
            <p>No expenses found for this budget.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((e) => String(e.budgetId) === String(viewBudgetId))
                  .map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.title}</td>
                      <td>{expense.amount.toFixed(2)}</td>
                      <td>{expense.currency}</td>
                      <td>{expense.category}</td>
                      <td>{formatDate(expense.date)}</td>
                      <td>{expense.notes || "-"}</td>
                      <td className="actions-cell">
                        <button
                          className="btn btn-orange"
                          onClick={() => navigate(`/edit-expense/${expense.id}`)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-red"
                          onClick={() => navigate(`/delete-expense/${expense.id}`)}
                        >
                          ❌ Delete
                        </button>
                        <button
                          className="btn btn-blue"
                          onClick={() => handleViewBudget(expense.budgetId)}
                        >
                          📊 View Budget
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

ViewExpenses.propTypes = {
  budgetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  embedded: PropTypes.bool,
};

export default ViewExpenses;
