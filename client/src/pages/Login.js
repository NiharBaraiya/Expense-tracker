import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL || "";

  // Validate and return array of error strings
  const validateFields = () => {
  const errors = [];

  if (!email) {
    errors.push("📧 Email is required.");
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("📧 Please enter a valid email address.");
  }

  if (!password) {
    errors.push("🔒 Password is required.");
  } else if (password.length < 6) {
    errors.push("🔒 Password must be at least 6 characters.");
  }

  return errors;
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
    const apiURL = API_BASE
      ? `${API_BASE.replace(/\/$/, "")}/api/auth/login`
      : "/api/auth/login";

    const response = await axios.post(apiURL, { email, password });
    const { token, username } = response.data || {};

    if (!token) {
      alert("⚠️ Authentication token missing from server response.");
      setLoading(false);
      return;
    }

    localStorage.setItem("token", token);
    if (username) localStorage.setItem("username", username);
    if (remember) localStorage.setItem("remember", "1");

    if (onLogin) onLogin(username || "");

    alert("✅ Login successful!");
    navigate("/dashboard");
  } catch (err) {
    const errorMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "❌ Login failed. Please try again.";
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="auth-container" aria-labelledby="login-heading">
      <div className="auth-brand" style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 id="login-heading" className="auth-title-small">
          Expense Tracker & Smart Budgeting
        </h1>
        <p>Sign in to your account</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Email</label>
        <div className="input-with-icon">
          <span className="input-icon" aria-hidden>
            📧
          </span>
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <label htmlFor="login-password" className="label-margin-top">
          Password
        </label>
        <div className="input-with-icon password-field">
          <span className="input-icon" aria-hidden>
            🔒
          </span>
          <input
            id="login-password"
            name="password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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

        <div className="form-options">
       
          <Link to="/forgot-password" className="muted">
            Forgot password?
          </Link>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="login-redirect">
        Don’t have an account? <Link to="/register">Create an account</Link>
      </div>
    </main>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func,
};

export default Login;
