import React, { useEffect, useState, useCallback } from "react";
import ViewExpenses from "./ViewExpenses"; // Adjust path if needed
import API from "../api";

const ViewBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  // Fetch budgets and expenses from backend
  const loadData = useCallback(async () => {
    try {
      const [budgetsRes, expensesRes] = await Promise.all([
        API.get("/budgets"),
        API.get("/expenses"),
      ]);

      const budgetsData = budgetsRes.data;
      const expensesData = expensesRes.data;

      // Normalize budgets
      const normalizedBudgets = budgetsData.map((b) => ({
        ...b,
        id: b._id || b.id,
        amount: Number(b.amount) || 0,
        startDate: b.startDate
          ? new Date(b.startDate).toISOString().slice(0, 10)
          : "",
        endDate: b.endDate
          ? new Date(b.endDate).toISOString().slice(0, 10)
          : "",
      }));

      // Normalize expenses
      const normalizedExpenses = expensesData.map((e) => ({
        ...e,
        id: e._id || e.id,
        amount: Number(e.amount) || 0,
        date: e.date ? new Date(e.date).toISOString().slice(0, 10) : "",
      }));

      setBudgets(normalizedBudgets);
      setExpenses(normalizedExpenses);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("❌ Failed to load budgets or expenses from backend.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate total spent for a given budget
  const getTotalSpent = (budgetId) =>
    expenses
      .filter((e) => String(e.budgetId) === String(budgetId))
      .reduce((sum, e) => sum + e.amount, 0);

  // Delete budget by id
  const handleDelete = async (id) => {
    if (!window.confirm("🗑 Are you sure you want to delete this budget?")) return;

    try {
      await API.delete(`/budgets/delete/${id}`);
      await loadData();

      if (editId === id) {
        setEditId(null);
        setEditForm({
          name: "",
          description: "",
          amount: "",
          currency: "",
          category: "",
          startDate: "",
          endDate: "",
        });
      }
      if (selectedBudgetId === id) {
        setSelectedBudgetId(null);
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("❌ " + error.message);
    }
  };

  // Start editing a budget
  const handleEditClick = (budget) => {
    setEditId(budget.id);
    setEditForm({
      name: budget.name || "",
      description: budget.description || "",
      amount: String(budget.amount) || "",
      currency: budget.currency || "",
      category: budget.category || "",
      startDate: budget.startDate || "",
      endDate: budget.endDate || "",
    });
  };

  // Handle changes in edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Update budget with correct route
  const updateBudget = async (id, data) => {
    const res = await API.put(`/budgets/update/${id}`, data);
    return res.data;
  };

  // Save edited budget
  const handleSaveEdit = async () => {
    const amountNum = Number(editForm.amount);

    if (isNaN(amountNum) || amountNum < 0) {
      alert("Please enter a valid non-negative number for amount");
      return;
    }
    if (!editForm.name.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!editForm.category.trim()) {
      alert("Please enter a category");
      return;
    }
    if (!editForm.startDate || !editForm.endDate) {
      alert("Please enter valid start and end dates");
      return;
    }

    try {
      await updateBudget(editId, {
        name: editForm.name.trim(),
        description: editForm.description ? editForm.description.trim() : "",
        amount: amountNum,
        currency: editForm.currency.trim(),
        category: editForm.category.trim(),
        startDate: editForm.startDate,
        endDate: editForm.endDate,
      });

      await loadData();

      setEditId(null);
      setEditForm({
        name: "",
        description: "",
        amount: "",
        currency: "",
        category: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Error updating budget:", error);
      alert("❌ " + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({
      name: "",
      description: "",
      amount: "",
      currency: "",
      category: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💰 View Budgets</h2>

      {budgets.length === 0 ? (
        <p>No budgets found. Create one first!</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Spent</th>
                <th style={thStyle}>Remaining</th>
                <th style={thStyle}>Currency</th>
                <th style={thStyle}>Dates</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const spent = getTotalSpent(budget.id);
                const remaining = budget.amount - spent;

                if (editId === budget.id) {
                  return (
                    <tr key={budget.id} style={{ background: "#fffae6" }}>
                      <td style={tdStyle}>
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          placeholder="Name"
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          placeholder="Category"
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          min="0"
                        />
                      </td>
                      <td style={tdStyle}>
                        {spent} {budget.currency}
                      </td>
                      <td style={{ ...tdStyle, color: remaining < 0 ? "red" : "green" }}>
                        {remaining} {budget.currency}
                      </td>
                      <td style={tdStyle}>
                        <input
                          name="currency"
                          value={editForm.currency}
                          onChange={handleEditChange}
                          placeholder="Currency"
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="date"
                          name="startDate"
                          value={editForm.startDate}
                          onChange={handleEditChange}
                        />
                        <br />
                        <input
                          type="date"
                          name="endDate"
                          value={editForm.endDate}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={handleSaveEdit}
                          style={{ background: "green", color: "white", padding: "4px 8px", marginRight: 5, cursor: "pointer" }}
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ padding: "4px 8px", cursor: "pointer" }}
                        >
                          ❌ Cancel
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={budget.id}>
                    <td style={tdStyle}>{budget.name}</td>
                    <td style={tdStyle}>{budget.category}</td>
                    <td style={tdStyle}>
                      {budget.amount} {budget.currency}
                    </td>
                    <td style={tdStyle}>
                      {spent} {budget.currency}
                    </td>
                    <td style={{ ...tdStyle, color: remaining < 0 ? "red" : "green" }}>
                      {remaining} {budget.currency}
                    </td>
                    <td style={tdStyle}>{budget.currency}</td>
                    <td style={tdStyle}>
                      {budget.startDate} → {budget.endDate}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setSelectedBudgetId(budget.id)}
                        style={{
                          background: "blue",
                          color: "white",
                          padding: "8px 8px",
                          border: "none",
                          cursor: "pointer",
                          marginRight: 6,
                        }}
                      >
                        View Expenses
                      </button>
                      <button
                        onClick={() => handleEditClick(budget)}
                        style={{
                          padding: "5px 7px",
                          background: "orange",
                          color: "white",
                          marginRight: 6,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        style={{
                          padding: "6px 9px",
                          background: "red",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedBudgetId && (
        <div style={{ marginTop: 40 }}>
          <button
            onClick={() => setSelectedBudgetId(null)}
            style={{ marginBottom: 10, padding: "6px 12px", cursor: "pointer" }}
          >
            ← Back to Budgets
          </button>
          <ViewExpenses budgetId={selectedBudgetId} />
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ddd",
};

export default ViewBudgets;