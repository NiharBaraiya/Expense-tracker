// App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import API from './api';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Layout from './pages/Layout';
import ProtectedRoute from './pages/ProtectedRoute';
import AuthNavbar from './pages/AuthNavbar';
import AddBudget from './pages/AddBudget';
import AddExpense from './pages/AddExpense';
import ViewBudgets from './pages/ViewBudgets';
import ViewExpenses from './pages/ViewExpenses';
import AddIncome from './pages/AddIncome';
import AddDebt from './pages/AddDebt';
import AddRecurring from './pages/AddRecurring';
import AddSavingsGoal from './pages/AddSavingsGoal';
import UserProfile from './pages/UserProfile';

function AppRoutes({ username, user, onLogout, onRegister, onLogin, isLoggedIn, isRegistered }) {
  const getRootRedirect = () => {
    if (!isRegistered) return <Navigate to="/register" />;
    if (!isLoggedIn) return <Navigate to="/login" />;
    return <Navigate to="/home" />;
  };

  return (
    <Routes>
      {/* Public Routes with AuthNavbar */}
      <Route
        path="/register"
        element={
          <>
            <AuthNavbar />
            <Register onRegister={onRegister} />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <AuthNavbar />
            <Login onLogin={onLogin} />
          </>
        }
      />
      <Route path="/" element={getRootRedirect()} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Layout username={username} onLogout={onLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-budget" element={<AddBudget />} />
        <Route path="add-expense" element={<AddExpense />} />
        <Route path="budgets" element={<ViewBudgets />} />
        <Route path="expenses" element={<ViewExpenses />} />
        <Route path="add-income" element={<AddIncome />} />
        <Route path="add-debt" element={<AddDebt />} />
        <Route path="add-recurring" element={<AddRecurring />} />
        <Route path="add-savings-goal" element={<AddSavingsGoal />} />
        <Route path="about" element={<About />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="profile" element={<UserProfile user={user} />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isRegistered, setIsRegistered] = useState(localStorage.getItem('isRegistered') === 'true');
  const isLoggedIn = !!username;

  const handleRegister = (username) => {
    localStorage.setItem('isRegistered', 'true');
    localStorage.setItem('username', username);
    setIsRegistered(true);
    setUsername(username);
    window.location.href = '/login';
  };

  const handleLogin = async (username) => {
    localStorage.setItem('username', username);
    setUsername(username);
    await fetchUserProfile();
    window.location.href = '/home';
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUsername('');
    setUser(null);
    window.location.href = '/login';
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await API.get('/user/profile');
      setUser(res.data);
    } catch (err) {
      console.error("Auto fetch profile error:", err);
      handleLogout(); // logout on error (e.g. invalid/expired token)
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUserProfile();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Router>
      <AppRoutes
        username={username}
        user={user}
        onLogout={handleLogout}
        onRegister={handleRegister}
        onLogin={handleLogin}
        isLoggedIn={isLoggedIn}
        isRegistered={isRegistered}
      />
    </Router>
  );
}

AppRoutes.propTypes = {
  username: PropTypes.string,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isRegistered: PropTypes.bool.isRequired,
};

export default App;
