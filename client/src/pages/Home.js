// pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="home-hero">
        <h1 className="home-title">💰 Welcome to Expense Tracker & Smart Budgeting</h1>
        <p className="home-subtitle">
          Take control of your finances with ease. Track your income, expenses, and goals in one place.
        </p>
        <Link to="/dashboard" className="home-cta-btn">
          Go to Dashboard
        </Link>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Use Expense Tracker?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📈 Real-Time Tracking</h3>
            <p>Monitor income and expenses instantly and stay on top of your budget.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Visual Reports</h3>
            <p>Analyze your financial habits with dynamic charts and statistics.</p>
          </div>
          <div className="feature-card">
            <h3>📅 Monthly Planning</h3>
            <p>Set financial goals and plan monthly budgets to meet them.</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Secure & Private</h3>
            <p>Your data is encrypted and your privacy is respected.</p>
          </div>
          
        </div>
      </section>

      {/* How It Works */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <ol className="steps-list">
          <li>1️⃣ Create an account and log in securely.</li>
          <li>2️⃣ Add income and expense entries as they happen.</li>
          <li>3️⃣ Categorize your transactions for clarity.</li>
          <li>4️⃣ View charts, insights, and manage your budget!</li>
        </ol>
      </section>

      {/* Testimonials Section */}
      <section  className="features-section">
        <h2 className="section-title">What Users Say</h2>
        <div className="testimonial">
          <p>👤 "Expense Tracker helped me save over $500 in just 3 months! The visual insights are amazing." - <em>Ravi M.</em></p>
        </div>
        <div className="testimonial">
          <p>👤 "A must-have for anyone who wants to control their finances. Easy and effective." - <em>Ananya P.</em></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="custom-footer">
        <div className="footer-content">
          <div className="footer-section contact-us">
            <h3>Contact Us</h3>
            <p>Expense Tracker Team</p>
            <p>Smart Budgeting Inc.</p>
            <p>Nadiad, Gujarat, India</p>
            <p>Email: nihar@gmail.com</p>
          </div>

          <div className="footer-section useful-links">
            <h3>Useful Links</h3>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/feedback">Feedback</Link></li>
              <li><a href="https://www.linkedin.com/in/niharbaraiya/">LinkedIn</a></li>
              <li><a href="https://github.com/NiharBaraiya">GitHub</a></li>
            </ul>
          </div>

          <div className="footer-section developer">
            <h3>Developer</h3>
            <p>Nihar Baraiya</p>
            <p>Full Stack Developer</p>
            <p>Contact: +91 987654321</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Expense Tracker. All rights reserved.</p>
          <p>Designed with ❤️ by Nihar Baraiya</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
