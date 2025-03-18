const Vendor = require("../models/vendor.model");
const { getTokenFromHeader, verifyToken } = require("../helper/verifytoken");

const isVendor = async (req, res, next) => {
  try {
    // Extract token
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ statusCode: 498, message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(498).json({ statusCode: 498, message: "Invalid or expired token." });
    }

    // Check if user is a Vendor
    const vendor = await Vendor.findById(decoded.id);
    if (!vendor || vendor.isDeleted) {
      return res.status(498).json({ statusCode: 498, message: "Access denied. Vendor not found or inactive." });
    }

    // Attach vendor details to request
    req.vendorAuth = vendor;
    next();

  } catch (error) {
    console.error("Vendor Middleware Error:", error.message);
    return res.status(500).json({ statusCode: 500, message: "Internal server error." });
  }
};

module.exports = isVendor;