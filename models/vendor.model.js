const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true }, 
  isDeleted: { type: Boolean, default: false },
  approvedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }] 
});

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
