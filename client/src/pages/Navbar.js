// Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Navbar.css';

const Navbar = ({ username, onLogout }) => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  // Helper: check active page
  const isActive = (path) => location.pathname === path;

  // If login/register page → hide sidebar
  if (isAuthPage) return null;

  return (
    <div className="sidebar">
      {/* === Header / Logo === */}
      <div className="sidebar-header">
        <h2>💰 Expense Tracker</h2>
        <h2>Smart Budgeting</h2>
        <br></br>
      </div>

      {/* === Sidebar Navigation === */}
      <div className="sidebar-menu">
        <Link to="/home" className={isActive('/home') ? 'active' : ''}>
          🏠 Home
        </Link>
        <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
          📊 Dashboard
        </Link>
        <Link to="/about" className={isActive('/about') ? 'active' : ''}>
          ℹ️ About
        </Link>
        <Link to="/feedback" className={isActive('/feedback') ? 'active' : ''}>
          💬 Feedback
        </Link>
        <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
          👤 Profile
        </Link>
      </div>

      {/* === Footer / Logout === */}
      <div className="sidebar-footer">
        {username && (
          <>
            <div className="nav-user">👋{username}</div>
            <br></br>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

Navbar.propTypes = {
  username: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
