const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
const submitFeedback = async (req, res) => {
  const { name, email, message } = req.body;

  console.log("Submitting feedback:", req.body);

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    const feedback = new Feedback({ name, email, message });
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
