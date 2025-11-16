// pages/AddSavingsGoal.js
import React, { useState, useEffect } from "react";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import API from "../api";
import "./AddSavingsGoal.css";

const AddSavingsGoal = () => {
  useBodyScrollLock(true);
  const [goalAmount, setGoalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goals, setGoals] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await API.get('/savings');
        setGoals(res.data);
      } catch (error) {
        console.error("Error fetching savings goals:", error);
      }
    };
    fetchGoals();
  }, []);

  const handleSaveGoal = async (e) => {
    e.preventDefault();

    if (!goalAmount || Number(goalAmount) <= 0) {
      alert("⚠️ Please enter a valid goal amount.");
      return;
    }

    const goalData = {
      amount: Number(goalAmount),
      deadline,
    };

    try {
      if (editingId) {
        const res = await API.put(`/savings/${editingId}`, goalData);
        setGoals(goals.map((g) => (g._id === editingId ? res.data : g)));
        alert("🎯 Savings goal updated successfully!");
      } else {
        const res = await API.post('/savings', goalData);
        setGoals([...goals, res.data]);
        alert("🎯 Savings goal saved successfully!");
      }

      setEditingId(null);
      setGoalAmount("");
      setDeadline("");
      // Blur active element so the existing list/background reappear (focus mode off)
      document.activeElement?.blur?.();
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("⚠️ Something went wrong!");
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal._id);
    setGoalAmount(goal.amount);
    setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await API.delete(`/savings/${id}`);
      setGoals(goals.filter((g) => g._id !== id));
      alert("Goal deleted successfully!");
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("⚠️ Something went wrong!");
    }
  };

  return (
    <>
      {/* Form Container */}
      <div className="add-saving-container">
        
        <form onSubmit={handleSaveGoal} className="saving-form">
          <h2>🎯 {editingId ? "Edit Savings Goal" : "Set Savings Goal"}</h2>
          <div className="form-group">
            <label htmlFor="goalAmount">Target Amount</label>
            <input
              id="goalAmount"
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
<br></br>
<br></br>
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
<br></br>
          <button type="submit" className="save-btn">
            {editingId ? "Update Goal" : "Save Goal"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setGoalAmount("");
                setDeadline("");
              }}
            >
              Cancel
            </button>
          )}
        </form>

        {/* Existing Goals Table placed after form inside overlay */}
        {goals.length > 0 && (
          <div className="saving-list-container">
            <h3>📋 Existing Savings Goals</h3>
            <table className="saving-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr key={goal._id}>
                  <td>₹ {goal.amount.toFixed(2)}</td>
                  <td>{goal.deadline ? goal.deadline.split("T")[0] : "-"}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(goal)}>
                      ✏️ Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(goal._id)}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AddSavingsGoal;
