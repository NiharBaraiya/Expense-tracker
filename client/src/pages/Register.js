import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./AddBudget.css";
import "./AuthSplit.css";

const Register = ({ onRegister }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  // Google Sign-Up removed

  // Validate form fields
  const validateFields = () => {
    const errors = [];
    if (!form.username.trim()) errors.push("👤 Username is required.");
    else if (form.username.trim().length < 3) errors.push("👤 Username must be at least 3 characters.");

    if (!form.email.trim()) errors.push("📧 Email is required.");
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.push("📧 Invalid email format.");

    if (!form.password) errors.push("🔒 Password is required.");
    else if (form.password.length < 6) errors.push("🔒 Password must be at least 6 characters.");

    if (!form.confirmPassword) errors.push("🔒 Confirm Password is required.");
    else if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      errors.push("🔒 Password and Confirm Password do not match.");
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const payload = { username: form.username, email: form.email, password: form.password };
      const response = await API.post('/auth/register', payload);

      const { token, username, userId } = response.data || {};

      // ✅ Alert if token or userId is missing
      if (!token || !userId) {
        alert("❌ Registration failed: token or userId missing from server response.");
        console.error("Server Response:", response.data);
        setLoading(false);
        return;
      }

      // Save user info to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username || form.username);

      if (onRegister) onRegister({ username, userId });

      alert("✅ Registration successful! Redirecting to your dashboard...");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "❌ Registration failed. Please try again.";
      alert(msg);
      console.error("Registration Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="add-budget-container" aria-labelledby="register-heading">
      <section className="auth-split-card" style={{ maxWidth: 1040 }}>
        {/* Left: Sign Up form */}
        <div className="auth-left">
         
          <h2 id="register-heading" className="auth-title">Sign Up</h2>
         


          <form onSubmit={handleSubmit} noValidate>
            <label className="field-label" htmlFor="register-username">Username</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">👤</span>
              <input
                id="register-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="username"
                required
              />
            </div>

            <label className="field-label" htmlFor="register-email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">📧</span>
              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <label className="field-label" htmlFor="register-password">Password</label>
            <div className="input-with-icon password-field">
              <span className="input-icon" aria-hidden="true">🔒</span>
              <input
                id="register-password"
                name="password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your Password"
                autoComplete="new-password"
                aria-describedby="pwd-hint-register"
                required
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

            <label className="field-label" htmlFor="register-confirm">Confirm Password</label>
            <div className="input-with-icon password-field">
              <span className="input-icon" aria-hidden="true">🔒</span>
              <input
                id="register-confirm"
                name="confirmPassword"
                type={showPwd ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your Password"
                autoComplete="new-password"
                aria-describedby="pwd-hint-register"
                required
              />
            </div>
           

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Registering..." : "SIGN UP"}
            </button>
            <div className="switch-footnote">Already have an account? <Link to="/login">Login</Link></div>
          </form>
        </div>

        {/* Right: Switch to Login */}
        <aside className="auth-right">
        
          <h3 className="title">Welcome Back!</h3>
          <p className="subtitle">To keep connected with us please login with your personal info</p>
          <button className="btn-outline" onClick={() => navigate('/login')}>SIGN IN</button>
        </aside>
      </section>
    </div>
  );
};

Register.propTypes = {
  onRegister: PropTypes.func,
};

export default Register;
