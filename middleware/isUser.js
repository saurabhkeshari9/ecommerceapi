const User = require("../models/user.model");
const { getTokenFromHeader, verifyToken } = require("../helper/verifytoken");

const isUser = async (req, res, next) => {
  try {
    // Extract & verify token
    const token = getTokenFromHeader(req);
    const decodedUser = verifyToken(token);

    if (!decodedUser || !decodedUser.id) {
      return res.status(498).json({ statusCode: 498, message: "Invalid or expired token." });
    }

    // Find user in database
    const user = await User.findById(decodedUser.id);
    if (!user || user.isBlocked) {
      return res.status(498).json({ statusCode: 498, message: "User not found or Your acccount is blocked." });
    }
    console.log("User Middleware:", user);
    // Attach user details to request
    req.userAuth = user;
    next();

  } catch (error) {
    console.error("User Middleware Error:", error.message);
    return res.status(500).json({ statusCode: 500, message: "Internal server error." });
  }
};

module.exports = isUser;
