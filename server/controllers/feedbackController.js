const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
const submitFeedback = async (req, res) => {
  const { name, email, topic = 'General', rating = 5, message, consent = false } = req.body;

  console.log("Submitting feedback:", req.body);

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // basic validations aligned with frontend
    const allowedTopics = ['General', 'Bug Report', 'Feature Request', 'Design/UX', 'Performance', 'Other'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (String(message || '').length > 1000) {
      return res.status(400).json({ success: false, message: 'Message must be 1000 characters or less.' });
    }

    const normalizedTopic = String(topic).trim();
    if (!allowedTopics.includes(normalizedTopic)) {
      return res.status(400).json({ success: false, message: 'Invalid topic.' });
    }
    // normalize values
    const normalized = {
      name: String(name).trim(),
      email: String(email).trim(),
      topic: normalizedTopic,
      rating: numericRating,
      message: String(message).trim(),
      consent: Boolean(consent),
    };

    const feedback = new Feedback(normalized);
    await feedback.save();

    console.log("Feedback saved successfully:", feedback);

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: feedback,
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      error: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
};
