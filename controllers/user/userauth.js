const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, gender } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { mobile }], 
      isDeleted: false 
    });

    if (existingUser) {
      const message = existingUser.email === email ? 'Email already exists' : 'Mobile number already exists';
      return res.status(400).json({ statusCode: 400, message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ 
      name, 
      email, 
      mobile, 
      password: hashedPassword, 
      gender
    });

    const { password: _, ...userData } = newUser.toObject();

    return res.status(200).json({ 
      statusCode: 200, 
      message: 'User registered successfully', 
      data: userData 
    });

  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { mobile }], isDeleted: false }).select("name email password ").lean();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ statusCode: 400, error: "Invalid credentials or User is deleted" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    delete user.password;
    return res.status(200).json({ statusCode: 200, message: 'User login successfully', data: { ...user, token } });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userAuth, isDeleted: false }).select("-password");
    if (!user) {
      return res.status(400).json({ statusCode: 400, message: "User not found" });
    }
    return res.status(200).json({ statusCode: 200, message: "User Profile", data: user });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, gender } = req.body;
    const user = await User.findOne({ _id: req.userAuth, isDeleted: false }).select("-password");
    if (!user) {
      return res.status(400).json({ statusCode: 400, message: "User not found" });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.gender = gender || user.gender;
    await user.save();
    return res.status(200).json({ statusCode: 200, message: 'Profile updated successfully', data: user });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Delete User Profile
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ _id: req.userAuth, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!user) {
      return res.status(400).json({ statusCode: 400, message: "User not found" });
    }
    return res.status(200).json({ statusCode: 200, message: 'Profile deleted successfully' });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};