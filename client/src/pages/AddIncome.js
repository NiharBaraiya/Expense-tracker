// pages/AddIncome.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import './AddIncome.css';

const AddIncome = () => {
  const navigate = useNavigate();
  const [incomeList, setIncomeList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch existing incomes from backend
  const fetchIncomes = async () => {
    try {
      const res = await API.get("/incomes");
      setIncomeList(res.data);
    } catch (err) {
      console.error("Error fetching incomes:", err);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  // Handle new income add
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newIncome = {
      title: form.title.value,
      amount: Number(form.amount.value),
      source: form.source.value,
      date: form.date.value,
      notes: form.notes.value,
    };

    if (!newIncome.title || !newIncome.amount || newIncome.amount <= 0) {
      alert("⚠️ Please enter valid income details.");
      return;
    }

    try {
      const res = await API.post("/incomes", newIncome);
      setIncomeList([res.data, ...incomeList]);
      form.reset();
      alert("✅ Income added successfully!");
    } catch (err) {
      console.error("Error adding income:", err);
      alert("❌ Failed to add income!");
    }
  };

  // Start editing
  const handleEdit = (inc) => {
    setEditingId(inc._id);
    setEditForm({ ...inc });
  };

  // Change in edit form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // Save edit
  const handleSave = async (id) => {
    try {
      const res = await API.put(`/incomes/${id}`, editForm);
      const updated = incomeList.map((inc) => (inc._id === id ? res.data : inc));
      setIncomeList(updated);
      setEditingId(null);
      setEditForm({});
      alert("✅ Income updated!");
    } catch (err) {
      console.error("Error updating income:", err);
      alert("❌ Failed to update income!");
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Delete income
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;

    try {
      await API.delete(`/incomes/${id}`);
      setIncomeList(incomeList.filter((inc) => inc._id !== id));
    } catch (err) {
      console.error("Error deleting income:", err);
      alert("❌ Failed to delete income!");
    }
  };

  return (
    <>
      {/* Form container */}
      <div className="add-income-container">
        <h2>💵 Add Income</h2>
        <form className="income-form" onSubmit={handleAdd}>
           <label>Income Title:</label>
          <input name="title" placeholder="Income Title" required />
          <label>Amount:</label>
          <input name="amount" type="number" placeholder="Amount" required />
            <label>Source:</label>
          <input name="source" placeholder="Source (optional)" />
          <label>Date:</label>
          <input
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            required
          />
            <label>Notes:</label>
          <textarea name="notes" placeholder="Notes (optional)" />
          <button type="submit">➕ Save Income</button>
          
        </form>
      </div>

      {/* List outside the form container */}
      {incomeList.length > 0 && (
        <div className="existing-incomes-container">
          <h3 >📋 Existing Incomes</h3>
          <table className="income-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.map((inc) =>
                editingId === inc._id ? (
                  <tr key={inc._id}>
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="source"
                        value={editForm.source}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="notes"
                        value={editForm.notes}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <button
                        className="save-btn"
                        onClick={() => handleSave(inc._id)}
                      >
                        💾 Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        ❌ Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={inc._id}>
                    <td>{inc.date}</td>
                    <td>{inc.title}</td>
                    <td>{inc.source || "-"}</td>
                    <td>₹ {Number(inc.amount).toFixed(2)}</td>
                    <td>{inc.notes || "-"}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(inc)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(inc._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default AddIncome;
