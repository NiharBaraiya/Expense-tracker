import React, { useState } from 'react';
import API from '../api';
import './AddBudget.css';

const Feedback = () => {
  // For Feedback, keep background interactive until hover; no global scroll lock here

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General',
    rating: 5,
    message: '',
    consent: false,
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    let next = value;
    if (name === 'rating') next = Number(value);
    if (name === 'message') next = value.slice(0, 1000);
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');

    try {
      const result = await API.post('/feedback', formData);
      if (result.data.success) {
        setResponseMessage('✅ Thank you for your feedback!');
        setFormData({ name: '', email: '', topic: 'General', rating: 5, message: '', consent: false });
      } else {
        setResponseMessage(`❌ ${result.data.message}`);
      }
    } catch (error) {
      console.error('Feedback submit failed:', error);
      setResponseMessage('❌ Server error. Please try again later.');
    }

    setLoading(false);
  };

  return (
  <div className="add-budget-container feedback-overlay">
      <form className="budget-form" onSubmit={handleSubmit}>
        <h2>💬 Send Feedback</h2>
        <p style={{ gridColumn: '1 / -1', marginTop: -6, marginBottom: 8, textAlign: 'center', color: '#6b7280' }}>
          Help us improve your experience. We read every message.
        </p>

        <label htmlFor="fbName">Your Name</label>
        <input
          id="fbName"
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="fbEmail">Your Email</label>
        <input
          id="fbEmail"
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="fbTopic">Topic</label>
        <select
          id="fbTopic"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          required
        >
          <option>General</option>
          <option>Bug Report</option>
          <option>Feature Request</option>
          <option>Design/UX</option>
          <option>Performance</option>
          <option>Other</option>
        </select>

        <label htmlFor="fbRating">Rating</label>
        <select
          id="fbRating"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
        >
          <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
          <option value={4}>⭐⭐⭐⭐ Good</option>
          <option value={3}>⭐⭐⭐ Okay</option>
          <option value={2}>⭐⭐ Needs work</option>
          <option value={1}>⭐ Poor</option>
        </select>

        <label htmlFor="fbMessage">Your Feedback</label>
        <textarea
          id="fbMessage"
          name="message"
          placeholder="Your Feedback"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <div style={{ gridColumn: '1 / -1', textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>
          {formData.message.length}/1000
        </div>


        <div style={{ gridColumn: '5 / span 8', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            id="fbConsent"
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
          />
          <span style={{ color: '#6b7280' }}>I agree to be contacted about my feedback.</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>

        {responseMessage && (
          <p style={{ gridColumn: '1 / -1', marginTop: 12, textAlign: 'center' }}>
            {responseMessage}
          </p>
        )}
      </form>
    </div>
  );
};

export default Feedback;
