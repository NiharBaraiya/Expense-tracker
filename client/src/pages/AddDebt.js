// pages/AddDebt.js
import React, { useState, useEffect } from "react";
import API from "../api";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import './AddDebt.css';

const AddDebt = () => {
  useBodyScrollLock(true);
  const [debtList, setDebtList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [paymentAmount, setPaymentAmount] = useState({});

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await API.get('/debts');
      setDebtList(res.data);
    } catch (err) {
      console.error("Error fetching debts:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newDebt = {
      title: form.title.value,
      amount: Number(form.amount.value),
      remaining: Number(form.amount.value),
      interest: form.interest.value,
      dueDate: form.dueDate.value,
      paid: form.paid.checked,
      payments: [],
    };

    if (!newDebt.title || !newDebt.amount || newDebt.amount <= 0) {
      alert("⚠️ Please enter valid debt details.");
      return;
    }

    try {
      await API.post('/debts', newDebt);
      fetchDebts();
      form.reset();
      alert("✅ Debt added successfully!");
      // Remove focus so the existing list becomes visible again
      document.activeElement?.blur?.();
    } catch (err) {
      console.error("Error adding debt:", err);
      alert("❌ Failed to add debt.");
    }
  };

  const handleEdit = (debt) => {
    setEditingId(debt._id);
    setEditForm({ ...debt });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/debts/${id}`, editForm);
      fetchDebts();
      setEditingId(null);
      setEditForm({});
      alert("✅ Debt updated successfully!");
    } catch (err) {
      console.error("Error updating debt:", err);
      alert("❌ Failed to update debt.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this debt?")) {
      try {
        await API.delete(`/debts/${id}`);
        fetchDebts();
      } catch (err) {
        console.error("Error deleting debt:", err);
        alert("❌ Failed to delete debt.");
      }
    }
  };

  const handlePayment = async (debtId) => {
    const amount = Number(paymentAmount[debtId]);
    if (!amount || amount <= 0) {
      alert("⚠️ Enter a valid payment amount.");
      return;
    }

    try {
      await API.post(`/debts/${debtId}/payment`, { amount });
      fetchDebts();
      setPaymentAmount({ ...paymentAmount, [debtId]: "" });
      alert("💰 Payment recorded!");
    } catch (err) {
      console.error("Error recording payment:", err);
      alert("❌ Failed to record payment.");
    }
  };

  return (
      <div className="add-debt-container">
     
        <form onSubmit={handleAdd} className="debt-form">
             <h2>💳 Add Debt / Loan</h2>
             <br></br>
            
          <label htmlFor="title">Title</label>
          <input id="title" name="title" placeholder="Debt Title" required />

          <label htmlFor="amount">Amount</label>
          <input id="amount" name="amount" type="number" placeholder="Amount" required />

          <label htmlFor="interest">Interest (%)</label>
          <input id="interest" name="interest" type="number" placeholder="Interest (%)" />

          <label htmlFor="dueDate">Due Date</label>
          <input id="dueDate" name="dueDate" type="date" required />

          <label htmlFor="paid" style={{ display: "flex", alignItems: "left", gap: "0.5rem" }}>
            Paid: <input name="paid" type="checkbox" />
          </label>
<br></br>


        <button type="submit">💾 Save Debt</button>
          
        </form>

        {/* Existing Debts Table placed after form inside overlay */}
        {debtList.length > 0 && (
          <div className="existing-debts-container">
            <h3>📋 Existing Debts</h3>
            <table className="debt-table">
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Title</th>
                <th>Total Amount</th>
                <th>Remaining</th>
                <th>Interest %</th>
                <th>Paid</th>
                <th>Payments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {debtList.map((d) =>
                editingId === d._id ? (
                  <tr key={d._id}>
                    <td>
                      <input
                        type="date"
                        name="dueDate"
                        value={editForm.dueDate}
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
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleChange}
                      />
                    </td>
                    <td>{editForm.remaining}</td>
                    <td>
                      <input
                        type="number"
                        name="interest"
                        value={editForm.interest}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        name="paid"
                        checked={editForm.paid}
                        onChange={handleChange}
                      />
                    </td>
                    <td>-</td>
                    <td>
                      <button
                        className="save-btn"
                        onClick={() => handleSave(d._id)}
                      >
                        💾 Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        ❌ Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={d._id}>
                    <td>{d.dueDate}</td>
                    <td>{d.title}</td>
                    <td>₹ {Number(d.amount).toFixed(2)}</td>
                    <td>₹ {Number(d.remaining).toFixed(2)}</td>
                    <td>{d.interest || "-"}</td>
                    <td>{d.paid ? "✅ Yes" : "❌ No"}</td>
                    <td>
                      {d.payments && d.payments.length > 0 ? (
                        <ul style={{ paddingLeft: "20px", textAlign: "left" }}>
                          {d.payments.map((p) => (
                            <li key={`${p.date}-${p.amount}`}>
                              ₹ {p.amount} on {p.date}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No payments yet"
                      )}
                      {!d.paid && (
                        <div style={{ marginTop: "5px" }}>
                          <input
                            type="number"
                            placeholder="Enter payment"
                            value={paymentAmount[d._id] || ""}
                            onChange={(e) =>
                              setPaymentAmount({
                                ...paymentAmount,
                                [d._id]: e.target.value,
                              })
                            }
                            style={{ width: "100px" }}
                          />
                          <button
                            className="pay-btn"
                            onClick={() => handlePayment(d._id)}
                          >
                            ➕ Pay
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(d)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(d._id)}
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
      </div>
  );
};

export default AddDebt;
