import React from 'react';
import './Feedback.css';


const Feedback = () => {
  return (
    <div className="feedback-container">
      <h2>Give Me Your Feedback</h2>
      <form className="feedback-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Feedback" required></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Feedback;
