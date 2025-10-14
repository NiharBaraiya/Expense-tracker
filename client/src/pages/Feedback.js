import React, { useState } from 'react';
import API from '../api';
import './Feedback.css';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');

    try {
      const result = await API.post('/feedback', formData);

      if (result.data.success) {
        setResponseMessage('✅ Thank you for your feedback!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResponseMessage(`❌ ${result.data.message}`);
      }
    } catch (error) {
      setResponseMessage('❌ Server error. Please try again later.');
    }

    setLoading(false);
  };

  return (
    <div className="feedback-container">
      <h2>Give Me Your Feedback</h2>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Feedback"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {responseMessage && <p style={{ marginTop: '20px', textAlign: 'center' }}>{responseMessage}</p>}
    </div>
  );
};

export default Feedback;
