const jwt = require("jsonwebtoken");
const Vendor = require("../../models/vendor.model");

// Verify Vendor OTP
exports.verifyVendorOTP = async (req, res) => {
    try {
        const { email, mobile, otp } = req.body;
  
      // Find vendor by email or mobile
    const vendor = await Vendor.findOne({
        $or: [{ email }, { mobile }],
        isDeleted: false,
      }).select("name email mobile otp").lean();
      if (!vendor) {
        return res.status(400).json({ statusCode: 400, message: "Vendor not found" });
      }
  
      // Check if OTP matches and is not expired
      if (vendor.otp !== otp || Date.now() > new Date(vendor.otpExpires).getTime()) {
        return res.status(400).json({ statusCode: 400, message: "Invalid or expired OTP" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        delete vendor.otp;
      return res.status(200).json({
        statusCode: 200,
        message: "Login successful",
        data: {
          ...vendor,token
        },
      });
    } catch (err) {
      console.error("Error verifying vendor OTP:", err.message);
      return res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
  };