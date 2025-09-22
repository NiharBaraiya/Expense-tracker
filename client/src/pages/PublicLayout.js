import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <>
      <nav style={{ backgroundColor: '#eee', padding: '10px' }}>
        <h2>Expense Tracker</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;
