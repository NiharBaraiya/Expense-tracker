import React, { useState, useEffect } from "react";
import API from "../api";
import "./AddRecurring.css";
import useBodyScrollLock from "../utils/useBodyScrollLock";

const AddRecurring = () => {
  useBodyScrollLock(true);
  const [recurringList, setRecurringList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchRecurring = async () => {
    try {
      const res = await API.get('/recurring');
      setRecurringList(res.data);
    } catch (err) {
      console.error("Error fetching recurring items:", err);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const isDue = (r) => Boolean(r.nextDue) && r.nextDue <= today;

    const addTransactionFromRecurring = async (r) => {
      const payload = {
        title: r.title,
        amount: r.amount,
        date: today,
        notes: `Auto-added from recurring: ${r.title}`,
      };
      if (r.type === "expense") {
        return API.post('/expenses/add', { ...payload, category: "Recurring" });
      }
      return API.post('/incomes', payload);
    };

    const updateNextDue = async (r) => {
      const next = new Date(today);
      next.setMonth(next.getMonth() + 1);
      return API.put(`/recurring/${r._id}`, { ...r, nextDue: next.toISOString().split("T")[0] });
    };

    const processItem = async (r) => {
      if (!window.confirm(`⚡ ${r.title} is due today. Add to ${r.type}?`)) return;
      try {
        await addTransactionFromRecurring(r);
        await updateNextDue(r);
      } catch (err) {
        console.error("Error processing recurring item:", err);
      }
    };

    const processDueRecurring = async () => {
      const dueList = recurringList.filter(isDue);
      for (const r of dueList) {
        // eslint-disable-next-line no-await-in-loop
        await processItem(r);
      }
      fetchRecurring();
    };

    if (recurringList.length > 0) {
      processDueRecurring();
    }
  }, [recurringList]);

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
      const res = await API.post('/recurring', newRecurring);
      setRecurringList([...recurringList, res.data]);
      form.reset();
      alert("✅ Recurring transaction added!");
      document.activeElement?.blur?.();
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
      const res = await API.put(`/recurring/${id}`, editForm);
      setRecurringList((prev) => prev.map((r) => (r._id === id ? res.data : r)));
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
      await API.delete(`/recurring/${id}`);
      setRecurringList((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting recurring:", err);
    }
  };

  return (
      <div className="add-recurring-container">
       
        <form onSubmit={handleAdd} className="recurring-form">
           <h2> 📅 Add Recurring Transaction</h2>
          <label htmlFor="recTitle">Title</label>
          <input id="recTitle" name="title" placeholder="e.g., Rent, Salary" required />

          <label htmlFor="recAmount">Amount</label>
          <input id="recAmount" name="amount" type="number" placeholder="Amount" required />

          <label htmlFor="recType">Type</label>
          <select id="recType" name="type" defaultValue="expense">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <label htmlFor="recNextDue">Next Due Date</label>
          <input id="recNextDue" name="nextDue" type="date" required />

          <button type="submit" className="save-btn">Save Recurring</button>
        </form>

        {/* Existing Recurring Transactions placed after form inside overlay */}
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
      </div>
  );
};

export default AddRecurring;
