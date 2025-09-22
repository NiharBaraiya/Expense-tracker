// Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Navbar.css';

const Navbar = ({ username, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="navbar">
      <h2 className="navbar-brand">💰 Expense Tracker & Smart Budgeting</h2>
      <div className="navbar-links">
        {username && !isAuthPage ? (
          <>
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
           <Link to="/about"className="nav-link">About</Link>
<Link to="/feedback"className="nav-link">Feedback</Link>

            <span className="nav-user">👤 {username}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  username: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};

export default Navbar;
