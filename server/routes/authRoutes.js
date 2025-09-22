const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const router = express.Router();

// ✅ Keep consistent paths
router.post("/login", loginUser);

// ✅ Register Route
router.post("/register", registerUser);

module.exports = router;
