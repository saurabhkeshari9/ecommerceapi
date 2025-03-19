const Admin = require("../../models/admin.model");
const User = require("../../models/user.model");
const Vendor = require('../../models/vendor.model');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const {sendSMS} = require("../../helper/services");
require("dotenv").config();

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, isActive: true }).select("name email password").lean();
    
    if (!admin ||!(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ statusCode: 400, message: "Invalid credentials or not active" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    delete admin.password;

    return res.status(200).json({
      statusCode: 200,
      message: "Admin login successful",
      data: {...admin, token} ,
    });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let { offset = 0, limit = 10 } = req.query;

    // Default values agar frontend se nahi aaye
    offset = parseInt(offset); // Default offset = 0
    limit = parseInt(limit);  // Default limit = 10

    // Get total users count (excluding deleted users)
    const totalUsers = await User.countDocuments({ isDeleted: false });

    // Fetch users with offset-based pagination
    const users = await User.find({ isDeleted: false })
      .select("-password")  // Password field hide karega
      .skip(offset)         // Skip previous records
      .limit(limit)         // Sirf required number of records fetch karega
      .sort({ createdAt: -1 }); // Newest first

    return res.status(200).json({
      statusCode: 200,
      message: "Users data retrieved successfully",
      totalUsers,
      data: users,
    });

  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ statusCode: 400, message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      statusCode: 200,
      message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Create Vendor
exports.createVendor = async (req, res) => {
  try {
    const { name, email, password, mobile, address, approvedCategories } = req.body;

    const existingVendor = await Vendor.findOne({ $or: [{ email }, { mobile }], isDeleted: false });
    if (existingVendor) {
      return res.status(400).json({ statusCode: 400, message: "Vendor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = await Vendor.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      address, 
      approvedCategories
    });
    const vendorData = newVendor.toObject();
    delete vendorData.password;
    await sendSMS(newVendor.mobile, "Your vendor account has been created successfully");
    return res.status(200).json({ statusCode: 200, message: "Vendor created successfully", data: vendorData });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Get All Vendors
exports.getAllVendors = async (req, res) => {
  try {
    let { limit = 10, offset = 0, category } = req.query;
    limit = parseInt(limit);
    offset = parseInt(offset);

    let filter = { isDeleted: false };

    // Apply category filter if provided
    if (category) {
      filter.approvedCategories = { $in: category.split(",") }; //check the approve category
    }

    // Get total vendors count
    const totalVendors = await Vendor.countDocuments(filter);

    // Fetch vendors using offset instead of page
    const vendors = await Vendor.find(filter)
      .sort({ createdAt: -1 }) // Sort by latest
      .skip(offset) 
      .limit(limit)
      .select("-password -updatedAt -__v") // Exclude sensitive fields
      .lean();

    return res.status(200).json({
      statusCode: 200,
      message: "Vendors retrieved successfully",
      totalVendors,
      data: vendors,
    });

  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};


// Get Vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findOne({ _id: vendorId, isDeleted: false }).select("-password");
    if (!vendor) {
      return res.status(400).json({ statusCode: 400, message: 'Vendor not found' });
    }

    return res.status(200).json({ statusCode: 200, message: 'Vendor retrieved successfully', data: vendor });
  } catch (err) {
    console.error("Error retrieving vendor:", err.message);
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendors = await Vendor.findOne({ _id: vendorId, isDeleted: false });
    if (!vendors) {
      return res.status(400).json({ statusCode: 400, message: 'Vendor not found' });
    }
    const { name, email, password, mobile, address, approvedCategories } = req.body;

    const updateData = { name, email, mobile, address, approvedCategories };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const vendor = await Vendor.findOneAndUpdate(
      { _id: vendorId, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!vendor) {
      return res.status(400).json({ statusCode: 400, message: 'Vendor not found' });
    }
    await sendSMS(vendor.mobile, "Your vendor account has been updated successfully");

    return res.status(200).json({ statusCode: 200, message: 'Vendor updated successfully', data: vendor });
  } catch (err) {
    console.error("Error updating vendor:", err.message);
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findOneAndUpdate(
      { _id: vendorId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!vendor) {
      return res.status(400).json({ statusCode: 400, message: 'Vendor not found' });
    }
    await sendSMS(vendor.mobile, "Your vendor account has been deleted.");
    return res.status(200).json({ statusCode: 200, message: 'Vendor deleted successfully', data: vendor });
  } catch (err) {
    console.error("Error deleting vendor:", err.message);
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};