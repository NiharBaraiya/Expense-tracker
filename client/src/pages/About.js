// src/pages/About.js
import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <header className="about-hero">
        <h1 className="about-title">📘 About Expense Tracker & Smart Budgeting</h1>
        <p className="about-subtitle">
          Your all-in-one solution for smart budgeting, expense management, and financial clarity.
        </p>
      </header>

      <section className="about-section">
        <h2 className="section-title">About</h2>
        <p>
          <strong>Expense Tracker & Smart budgeting</strong> is a next-generation financial platform designed to make personal budgeting effortless and effective.
          Whether you're a student tracking daily expenses, a family managing monthly bills, or a freelancer planning income — this app is tailored for you.
        </p>
        <p>
          With a blend of intuitive design and powerful features, we help make money management a simple and sustainable part of everyday life.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-title">Our Mission</h2>
        <p>
          Our mission is to empower users with the knowledge, tools, and confidence to take full control of their finances.
          We believe budgeting shouldn’t be complex or stressful — it should be smart, simple, and even satisfying.
        </p>
      </section>

      <section className="about-section">
        <h2 className="section-title">What is Smart Budgeting?</h2>
        <p>
          <strong>Smart Budgeting</strong> is more than just expense tracking — it's about forming habits that align with your financial goals. With Expense Tracker, you can:
        </p>
        <ul className="about-features-list">
          <li>📌 Set flexible budgets for different categories</li>
          <li>🔔 Get alerts before you overspend</li>
          <li>📈 Analyze your financial trends visually</li>
          <li>🎯 Keep your spending aligned with long-term goals</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="section-title">Core Features</h2>
        <ul className="about-features-list">
          <li>✅ Real-time tracking of income and expenses</li>
          <li>📊 Visual dashboards with graphs and reports</li>
          <li>🔒 Secure login and encrypted data storage</li>
          <li>🧾 Smart categorization and expense tagging</li>
          <li>📅 Monthly budget planner with savings tracker</li>
          <li>📁 Easy export and backup options</li>
        </ul>
      </section>

      <section className="about-section">
        <h2 className="section-title">Why We Built This</h2>
        <p>
          Many people struggle with managing money simply because the tools are too complex or uninspiring. We built Expense Tracker to change that.
          Our goal is to help users pay off debt, build savings, and feel confident about their finances — all through a clean and intuitive experience.
        </p>
      </section>

      <section className="about-section testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonial-box">
          “This app taught me how to budget properly — and I finally feel in control.” — <strong>Neha S.</strong>
        </div>
        <div className="testimonial-box">
          “I never realized how much I was spending on food until I started using Expense Tracker.” — <strong>Vikram R.</strong>
        </div>
      </section>

      <section className="about-section">
        <h2 className="section-title">Meet the Team</h2>
        <p>
          We're a passionate team of full-stack developers, UI/UX designers, and finance enthusiasts. We believe everyone deserves access to clean, smart, and secure budgeting tools.
        </p>
        <p>
          Our mission goes beyond code — we’re here to help users take back control of their financial lives and make budgeting feel empowering.
        </p>
      </section>

      <section className="about-section contact-section">
        <h2 className="section-title">Connect With Us</h2>
        <p>
          Have feedback, feature ideas, or want to report a bug? Let’s connect:
        </p>
        <ul className="about-features-list">
          <li>📧 Email: <a href="mailto:support@expensetracker.com">support@expensetracker.com</a></li>
          <li>🌐 Website: <a href="https://www.expensetracker.com" target="_blank" rel="noopener noreferrer">www.expensetracker.com</a></li>
          <li>💼 LinkedIn: <a href="https://www.linkedin.com/company/expensetracker" target="_blank" rel="noopener noreferrer">Expense Tracker on LinkedIn</a></li>
          <li>👨‍💻 GitHub: <a href="https://github.com/expensetracker" target="_blank" rel="noopener noreferrer">github.com/expensetracker</a></li>
        </ul>
      </section>

         {/* Footer */}
<footer className="custom-footer">
  <div className="footer-content">
    <div className="footer-section contact-us">
      <h3>Contact Us</h3>
      <p>Expense Tracker Team</p>
      <p>Smart Budgeting Inc.</p>
      <p>Nadiad, Gujarat</p>
      <p>India</p>
      <p>Email: support@expensetracker.com</p>
    </div>

    <div className="footer-section useful-links">
      <h3>Useful Links</h3>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/feedback">Feedback</Link></li>
        <li><Link to="/profile">My Profile</Link></li>
        <li><Link to="/contact">Support</Link></li>
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

export default About;
