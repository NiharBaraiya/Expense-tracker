import React, { useEffect, useState, useCallback } from "react";
import ViewExpenses from "./ViewExpenses"; // Adjust path if needed
import API from "../api";
import "./ViewTheme.css";

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
  <div className="view-container theme-bgr">
    

      {budgets.length === 0 ? (
        <p className="list-card" style={{ textAlign: "center" }}>No budgets found. Create one first!</p>
      ) : (
        <div className="list-card" style={{ overflowX: "auto" }}>
            <h2 className="view-heading">💰 View Budgets</h2>
            <br></br>
            <br></br>
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
              {budgets.map((budget) => {
                const spent = getTotalSpent(budget.id);
                const remaining = budget.amount - spent;

                if (editId === budget.id) {
                  return (
                    <tr key={budget.id} className="is-editing">
                      <td>
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          placeholder="Name"
                        />
                      </td>
                      <td>
                        <input
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          placeholder="Category"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          min="0"
                        />
                      </td>
                      <td>
                        {spent} {budget.currency}
                      </td>
                      <td className={remaining < 0 ? "remaining-negative" : "remaining-positive"}>
                        {remaining} {budget.currency}
                      </td>
                      <td>
                        <input
                          name="currency"
                          value={editForm.currency}
                          onChange={handleEditChange}
                          placeholder="Currency"
                        />
                      </td>
                      <td>
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
                      <td>
                        <button
                          className="btn btn-green"
                          onClick={handleSaveEdit}
                        >
                          💾 Save
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={handleCancelEdit}
                        >
                          ❌ Cancel
                        </button>
                      </td>
                      
                    </tr>
                    
                  );
                }

                return (
                  <tr key={budget.id}>
                    <td>{budget.name}</td>
                    <td>{budget.category}</td>
                    <td>
                      {budget.amount} {budget.currency}
                    </td>
                    <td>
                      {spent} {budget.currency}
                    </td>
                    <td className={remaining < 0 ? "remaining-negative" : "remaining-positive"}>
                      {remaining} {budget.currency}
                    </td>
                    <td>{budget.currency}</td>
                    <td className="actions-cell">
                      {budget.startDate} → {budget.endDate}
                    </td>
                    
                    <td>
                      <button
                        className="btn btn-blue"
                        onClick={() => setSelectedBudgetId(budget.id)}
                      >
                        View Expenses
                      </button>
                      <button
                        className="btn btn-orange"
                        onClick={() => handleEditClick(budget)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-red"
                        onClick={() => handleDelete(budget.id)}
                      >
                        Delete
                      </button>
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
            
          </table>
          <br></br>
           <div  style={{ marginTop: 10 }}>
        <button 
          className="btn btn-blue"
          onClick={() => window.location.href = "/add-budget"}
        >
          + Add New Budget  
        </button>
          
      </div>
        </div>
      )}
<br></br>
      {selectedBudgetId && (
        <div style={{ width: 'min(1100px,95vw)' }}>
          <button
            className="btn btn-ghost"
            style={{ marginBottom: 10 }}
            onClick={() => setSelectedBudgetId(null)}
          >
            ← Back to Budgets
          </button>
          <br></br>
          <br></br>
          <ViewExpenses budgetId={selectedBudgetId} embedded />

        </div>
      )}
     
    </div>
  );
};

export default ViewBudgets;