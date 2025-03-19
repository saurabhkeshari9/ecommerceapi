const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const { sendSMS } = require("../../helper/services");

exports.verifyOTP = async (req, res) => {
  try {
    const { email, mobile, otp, type } = req.body;

    // Find user by email or mobile
    const user = await User.findOne({ $or: [{ email }, { mobile }], isDeleted: false }).select("name email otp mobile gender").lean();
    if (!user) {
      return res.status(400).json({ statusCode: 400, message: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp || Date.now() > new Date(user.otpExpires).getTime()) {
      return res.status(400).json({ statusCode: 400, message: "Invalid or expired OTP" });
    }

    // If type is "register", mark the user as verified
    if (type === "register") {
        await sendSMS(user.mobile, "Your account has been registered successfully");
    }

    // If type is "login", generate a JWT token
    if (type === "login") {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      delete user.otp;
      return res.status(200).json({
        statusCode: 200,
        message: "Login successful",
        data: {
          ...user, token
        },
      });
    }

    // For registration, return a success message
    return res.status(200).json({ statusCode: 200, message: "User registered successfully", data: user });

  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ statusCode: 500, message: error.message});
  }
};