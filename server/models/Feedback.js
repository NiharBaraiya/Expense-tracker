const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    enum: ['General', 'Bug Report', 'Feature Request', 'Design/UX', 'Performance', 'Other'],
    default: 'General',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  consent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
