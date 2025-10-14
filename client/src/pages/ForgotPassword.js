import React, { useState } from 'react';
import API from '../api';
import './Auth.css'; // Optional: use existing auth styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Reset link sent successfully');
      setIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending reset link');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && (
        <div
          className={`alert ${isError ? 'alert-error' : 'alert-success'}`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
