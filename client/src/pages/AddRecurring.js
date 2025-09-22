import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRecurring.css";

const API_URL = "http://localhost:5000/api/recurring";

const AddRecurring = () => {
  const navigate = useNavigate();
  const [recurringList, setRecurringList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchRecurring = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRecurringList(data);
    } catch (err) {
      console.error("Backend fetch failed, using localStorage fallback", err);
      const stored = JSON.parse(localStorage.getItem("recurring")) || [];
      setRecurringList(stored);
    }
  };

  useEffect(() => {
    fetchRecurring();

    const stored = JSON.parse(localStorage.getItem("recurring")) || [];
    const today = new Date().toISOString().split("T")[0];
    let updated = [...stored];
    let changed = false;

    stored.forEach((r) => {
      if (r.nextDue && r.nextDue <= today) {
        if (window.confirm(`⚡ ${r.title} is due today. Add to ${r.type}?`)) {
          const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
          const incomes = JSON.parse(localStorage.getItem("income")) || [];

          if (r.type === "expense") {
            expenses.push({
              id: Date.now().toString(),
              title: r.title,
              amount: r.amount,
              date: today,
              category: "Recurring",
            });
            localStorage.setItem("expenses", JSON.stringify(expenses));
          } else {
            incomes.push({
              id: Date.now().toString(),
              title: r.title,
              amount: r.amount,
              date: today,
              category: "Recurring",
            });
            localStorage.setItem("income", JSON.stringify(incomes));
          }

          const next = new Date(today);
          next.setMonth(next.getMonth() + 1);
          r.nextDue = next.toISOString().split("T")[0];
          changed = true;
        }
      }
    });

    if (changed) {
      setRecurringList(updated);
      localStorage.setItem("recurring", JSON.stringify(updated));
    }
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newRecurring = {
      title: form.title.value.trim(),
      amount: Number(form.amount.value),
      type: form.type.value,
      nextDue: form.nextDue.value,
    };

    if (!newRecurring.title || !newRecurring.amount || newRecurring.amount <= 0) {
      alert("⚠️ Please enter valid recurring details.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecurring),
      });
      const data = await res.json();

      setRecurringList([...recurringList, data]);
      const updatedLS = [...recurringList, { ...newRecurring, id: Date.now().toString() }];
      localStorage.setItem("recurring", JSON.stringify(updatedLS));

      form.reset();
      alert("✅ Recurring transaction added!");
    } catch (err) {
      console.error("Error adding recurring:", err);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r._id || r.id);
    setEditForm({ ...r });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      if (editForm._id) {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });
        const data = await res.json();
        setRecurringList((prev) => prev.map((r) => (r._id === id ? data : r)));
      } else {
        const updatedLS = recurringList.map((r) => (r.id === id ? { ...editForm, id } : r));
        setRecurringList(updatedLS);
        localStorage.setItem("recurring", JSON.stringify(updatedLS));
      }
      setEditingId(null);
      setEditForm({});
      alert("✅ Recurring updated successfully!");
    } catch (err) {
      console.error("Error updating recurring:", err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recurring transaction?")) return;

    try {
      const toDelete = recurringList.find((r) => r._id === id);
      if (toDelete) {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        setRecurringList((prev) => prev.filter((r) => r._id !== id));
      } else {
        const updatedLS = recurringList.filter((r) => r.id !== id);
        setRecurringList(updatedLS);
        localStorage.setItem("recurring", JSON.stringify(updatedLS));
      }
    } catch (err) {
      console.error("Error deleting recurring:", err);
    }
  };

  return (
    <>
      <div className="add-recurring-container">
        <h2> 📅 Add Recurring Transaction</h2>
        <form onSubmit={handleAdd} className="recurring-form">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" placeholder="e.g., Rent, Salary" required />

          <label htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" placeholder="Amount" required />

          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue="expense">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <label htmlFor="nextDue">Next Due Date</label>
          <input id="nextDue" name="nextDue" type="date" required />

          <button type="submit" className="save-btn">Save Recurring</button>
         
        </form>
      </div>

      {/* ✅ This part is now outside the main container */}
      {recurringList.length > 0 && (
        <div className="existing-recurring-container">
          <h3>Existing Recurring Transactions</h3>
          <table className="recurring-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Next Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recurringList.map((r) =>
                editingId === (r._id || r.id) ? (
                  <tr key={r._id || r.id}>
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
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <select name="type" value={editForm.type} onChange={handleChange}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        name="nextDue"
                        value={new Date(editForm.nextDue).toISOString().split("T")[0]}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <button className="save-btn" onClick={() => handleSave(r._id || r.id)}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={r._id || r.id}>
                    <td>{r.title}</td>
                    <td>₹ {Number(r.amount).toFixed(2)}</td>
                    <td>{r.type === "expense" ? "Expense" : "Income"}</td>
                    <td>{new Date(r.nextDue).toISOString().split("T")[0]}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(r)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(r._id || r.id)}>
                        Delete
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

export default AddRecurring;
