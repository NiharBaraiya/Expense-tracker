// pages/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import PropTypes from 'prop-types';

const Layout = ({ username, onLogout }) => {
  return (
    <>
      <Navbar username={username} onLogout={onLogout} />
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </>
  );
};

Layout.propTypes = {
  username: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};

Layout.defaultProps = {
  username: '',
};

export default Layout;
