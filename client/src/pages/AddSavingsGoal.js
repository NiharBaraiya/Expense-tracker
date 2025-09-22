// pages/AddSavingsGoal.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddSavingsGoal.css";

const AddSavingsGoal = () => {
  const navigate = useNavigate();
  const [goalAmount, setGoalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goals, setGoals] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:5000/api/savings";

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setGoals(data);
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
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
        const updatedGoal = await res.json();
        setGoals(goals.map((g) => (g._id === editingId ? updatedGoal : g)));
        alert("🎯 Savings goal updated successfully!");
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
        const newGoal = await res.json();
        setGoals([...goals, newGoal]);
        alert("🎯 Savings goal saved successfully!");
      }

      setEditingId(null);
      setGoalAmount("");
      setDeadline("");
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
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
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
        <h2>🎯 {editingId ? "Edit Savings Goal" : "Set Savings Goal"}</h2>
        <form onSubmit={handleSaveGoal} className="saving-form">
          <div className="form-group">
            <label>Target Amount</label>
            <br></br>
            <br></br>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="form-group">
            <label>Deadline</label>
            <br></br>
            <br></br>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

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
      </div>

      {/* Existing Goals Table - Outside the Container */}
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
    </>
  );
};

export default AddSavingsGoal;
