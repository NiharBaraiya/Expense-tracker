import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Register = ({ onRegister }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validate fields and return array of error strings with emojis
  const validateFields = () => {
    const errors = [];

    if (!form.username.trim()) {
      errors.push("👤 Username is required.");
    } else if (form.username.trim().length < 3) {
      errors.push("👤 Username must be at least 3 characters.");
    }

    if (!form.email.trim()) {
      errors.push("📧 Email is required.");
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.push("📧 Please enter a valid email address.");
    }

    if (!form.password) {
      errors.push("🔒 Password is required.");
    } else if (form.password.length < 6) {
      errors.push("🔒 Password must be at least 6 characters.");
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFields();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    setLoading(true);

    try {
      const apiURL = (process.env.REACT_APP_API_URL || "") + "/api/auth/register";
      const response = await axios.post(apiURL, form);
      const { token, username, userId } = response.data;

      if (!token || !userId) {
        alert("❌ Registration failed: missing token or userId from server.");
        setLoading(false);
        return;
      }

      // Save data in localStorage for multi-user dashboard
      localStorage.setItem("token", token);
      localStorage.setItem("username", username || form.username);
      localStorage.setItem("userId", userId);

      // Notify parent if needed
      if (onRegister) onRegister({ username, userId });

      alert("✅ Registration successful! Redirecting to your dashboard...");
      navigate("/dashboard");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ Registration failed. Please try again.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container" aria-labelledby="register-heading">
      <div className="auth-brand">
        <h1 id="register-heading" className="auth-title-small">
          Expense Tracker & Smart Budgeting
        </h1>
        <p className="auth-subtitle">Create your account</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="register-username">Username</label>
        <div className="input-with-icon">
          <span className="input-icon" aria-hidden="true">
            👤
          </span>
          <input
            id="register-username"
            name="username"
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>

        <label htmlFor="register-email" className="label-margin-top">
          Email
        </label>
        <div className="input-with-icon">
          <span className="input-icon" aria-hidden="true">
            📧
          </span>
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <label htmlFor="register-password" className="label-margin-top">
          Password
        </label>
        <div className="input-with-icon password-field">
          <span className="input-icon" aria-hidden="true">
            🔒
          </span>
          <input
            id="register-password"
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="pwd-toggle"
            onClick={() => setShowPwd((prev) => !prev)}
            aria-pressed={showPwd}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? "🔒" : "👁️"}
          </button>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="login-redirect">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </main>
  );
};

Register.propTypes = {
  onRegister: PropTypes.func,
};

export default Register;
