import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./Auth.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validate email and password
  const validateFields = () => {
    const errors = [];
    if (!email) errors.push("📧 Email is required.");
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("📧 Invalid email format.");
    if (!password) errors.push("🔒 Password is required.");
    else if (password.length < 6) errors.push("🔒 Password must be at least 6 characters.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFields();
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, username, userId } = res.data;

      // Check if token or userId is missing
      if (!token || !userId) {
        alert("⚠️ Authentication failed: token or userId missing from server response.");
        console.error("Server Response:", res.data);
        setLoading(false);
        return;
      }

      // Save credentials
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username || "");
      if (remember) localStorage.setItem("remember", "1");
// fetch profile
try {
  const profileRes = await API.get('/user/profile');
  const profileData = profileRes.data;
  
  // pass profile
  if (onLogin) onLogin(profileData);  
} catch (err2) {
  console.error("Profile fetch after login error:", err2);
  // you can still continue without profile or alert
}
      if (onLogin) onLogin(username || "");
      alert("✅ Login successful!");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ Login failed. Please try again.";
      alert(msg);
      console.error("Login Error:", err.response?.data || err.message);
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
        {/* Email */}
        <label htmlFor="login-email">Email</label>
        <div className="input-with-icon">
          <span className="input-icon" aria-hidden="true">📧</span>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <label htmlFor="login-password" className="label-margin-top">Password</label>
        <div className="input-with-icon password-field">
          <span className="input-icon" aria-hidden="true">🔒</span>
          <input
            id="login-password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="pwd-toggle"
            onClick={() => setShowPwd(prev => !prev)}
            aria-pressed={showPwd}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? "🔒" : "👁️"}
          </button>
        </div>

        {/* Remember me */}
        <div className="form-options">
        
          <Link to="/forgot-password" className="muted">Forgot password?</Link>
        </div>

        {/* Submit */}
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
