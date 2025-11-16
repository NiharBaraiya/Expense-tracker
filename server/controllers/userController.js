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
// Protected route: PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, phone, location, bio, avatarUrl } = req.body || {};

    const update = {};
    if (username != null) {
      const u = String(username).trim();
      if (u.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters." });
      update.username = u;
    }
    if (email != null) {
      const e = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(e)) return res.status(400).json({ message: "Invalid email format." });
      // ensure uniqueness if changed
      const existing = await User.findOne({ email: e, _id: { $ne: userId } });
      if (existing) return res.status(409).json({ message: "Email already in use." });
      update.email = e;
    }
    if (phone != null) update.phone = String(phone).trim();
    if (location != null) update.location = String(location).trim();
    if (bio != null) update.bio = String(bio).trim().slice(0, 500);
    if (avatarUrl != null) update.avatarUrl = String(avatarUrl).trim();

    const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, select: "-password" });
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      userId: updated._id,
      username: updated.username,
      email: updated.email,
      phone: updated.phone,
      location: updated.location,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Server error while updating profile", error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
