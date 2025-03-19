const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true, match: [/^\+\d{1,15}$/, "Please enter a valid phone number in E.164 format"]  },
  address: { type: String, required: true }, 
  otp: { type: String }, 
  otpExpires: { type: Date },
  isDeleted: { type: Boolean, default: false },
  approvedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }] 
});

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
