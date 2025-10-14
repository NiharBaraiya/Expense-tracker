// controllers/userController.js

const User = require("../models/User");

// Protected route: GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.userId;
    
    console.log("Fetching profile for user:", userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // You might want to send specific fields only
    const userProfile = {
      userId: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      // add other fields from User model if any
    };
    
    console.log("Profile fetched successfully:", userProfile);
    res.status(200).json(userProfile);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ 
      message: "Server error while fetching profile", 
      error: err.message 
    });
  }
};

module.exports = { getProfile };
