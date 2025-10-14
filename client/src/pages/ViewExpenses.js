import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../api";

const ViewExpenses = ({ budgetId }) => {
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
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

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
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

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

  return (
    <div style={{ padding: "20px" }}>
      <h2>📋 All Expenses</h2>

      {expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
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
                <tr key={expense.id} style={{ background: "#fffae6" }}>
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
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
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
                    <button
                      onClick={handleSaveEdit}
                      style={{ background: "green", color: "white" }}
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{ marginLeft: "5px" }}
                    >
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
                  <td>{expense.date}</td>
                  <td>{expense.notes || "-"}</td>
                  <td>
                    <button
                      onClick={() => handleEditClick(expense)}
                      style={{
                        background: "orange",
                        color: "white",
                        padding: "4px 8px",
                        border: "none",
                        marginRight: "5px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      style={{
                        background: "red",
                        color: "white",
                        padding: "4px 8px",
                        border: "none",
                        marginRight: "5px",
                        cursor: "pointer",
                      }}
                    >
                      ❌ Delete
                    </button>
                    <button
                      onClick={() => handleViewBudget(expense.budgetId)}
                      style={{
                        background: "blue",
                        color: "white",
                        padding: "4px 8px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      📊 View Budget
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      {viewBudgetId && getBudgetById(viewBudgetId) && (
        <>
          <h3 style={{ marginTop: "20px" }}>📌 Budget Details</h3>
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
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
                  {getBudgetById(viewBudgetId).startDate} →{" "}
                  {getBudgetById(viewBudgetId).endDate}
                </td>
                <td>
                  <button
                    style={{
                      background: "orange",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      marginRight: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/edit-budget/${viewBudgetId}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    style={{
                      background: "red",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      marginRight: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDeleteBudget(viewBudgetId)}
                  >
                    ❌ Delete
                  </button>
                  <button
                    style={{
                      background: "blue",
                      color: "white",
                      padding: "6px 9px",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "5px",
                    }}
                    onClick={handleViewBudgetExpenses}
                  >
                    📄 View Expenses
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {showBudgetExpenses && viewBudgetId && (
        <>
          <h3 style={{ marginTop: "20px" }}>💰 Expenses for Selected Budget</h3>
          {expenses.filter((e) => String(e.budgetId) === String(viewBudgetId))
            .length === 0 ? (
            <p>No expenses found for this budget.</p>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
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
                      <td>{expense.date}</td>
                      <td>{expense.notes || "-"}</td>
                      <td>
                        <button
                          onClick={() => handleEditClick(expense)}
                          style={{
                            background: "orange",
                            color: "white",
                            padding: "4px 8px",
                            border: "none",
                            marginRight: "5px",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          style={{
                            background: "red",
                            color: "white",
                            padding: "4px 8px",
                            border: "none",
                            marginRight: "5px",
                            cursor: "pointer",
                          }}
                        >
                          ❌ Delete
                        </button>
                        <button
                          onClick={() => handleViewBudget(expense.budgetId)}
                          style={{
                            background: "blue",
                            color: "white",
                            padding: "4px 8px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          📊 View Budget
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <br />
      <button
        onClick={() => navigate("/add-expense")}
        style={{
          background: "blue",
          color: "white",
          padding: "8px 12px",
          border: "none",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        ➕ Add New Expense
      </button>
    </div>
  );
};

ViewExpenses.propTypes = {
  budgetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ViewExpenses;
