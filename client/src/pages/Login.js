import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./AddBudget.css";
import "./AuthSplit.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Remember-me removed for this layout; can be reintroduced later if needed
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Google Sign-In removed

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
  // Persist 'remember me' can be added here if required
// fetch profile
try {
  const profileRes = await API.get('/user/profile');
  const profileData = profileRes.data;
  
  // pass profile
  if (onLogin) onLogin(profileData);  
} catch (error_) {
  console.error("Profile fetch after login error:", error_);
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
  <div className="add-budget-container" aria-labelledby="login-heading">
      <section className="auth-split-card" style={{ maxWidth: 1040 }}>
        {/* Left: Sign In form */}
        <div className="auth-left">
          <h2 id="login-heading" className="auth-title">Sign In</h2>
{/* 
          <div className="social-row" aria-label="Sign in with social">
            <button className="social-btn google" type="button" onClick={() => handleSocial('Google')} title="Google" aria-label="Sign in with Google">G<span className="sr-only">oogle</span></button>
            <button className="social-btn facebook" type="button" onClick={() => handleSocial('Facebook')} title="Facebook" aria-label="Sign in with Facebook">f<span className="sr-only">acebook</span></button>
            <button className="social-btn github" type="button" onClick={() => handleSocial('GitHub')} title="GitHub" aria-label="Sign in with GitHub">GH<span className="sr-only"> GitHub</span></button>
            <button className="social-btn linkedin" type="button" onClick={() => handleSocial('LinkedIn')} title="LinkedIn" aria-label="Sign in with LinkedIn">in<span className="sr-only"> LinkedIn</span></button>
          </div>

          <div className="hint-line">or use your email password</div> */}

        

          <form onSubmit={handleSubmit} noValidate>
            <label className="field-label" htmlFor="login-email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">📧</span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="input-with-icon password-field">
              <span className="input-icon" aria-hidden="true">🔒</span>
              <input
                id="login-password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
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

            <div className="left-footer">
              <span></span>
              <Link to="/forgot-password" className="muted">Forgot Your Password?</Link>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
          </form>

          <div className="switch-footnote">
            Don’t have an account? <Link to="/register">Create an account</Link>
          </div>
        </div>

        {/* Right: Promo / switch to Sign Up */}
        <aside className="auth-right">

          <h3 className="title">Hello, Friend!</h3>
          <p className="subtitle">Register with your personal details to use all site features</p>
          <button className="btn-outline" onClick={() => navigate('/register')}>SIGN UP</button>
        </aside>
      </section>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func,
};

export default Login;
