// pages/AuthNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // reuse same CSS

const AuthNavbar = () => (
  <nav className="navbar">
    <div className="navbar-left">
      <span className="logo">💰 Expense Tracker & Smart Budegting</span>
    </div>
    <div className="navbar-right">
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  </nav>
);

export default AuthNavbar;
