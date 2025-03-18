const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true,  
      trim: true, 
      lowercase: true, 
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"] 
    },
    mobile: { 
      type: String, 
      required: true,  
      trim: true, 
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"] 
    },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
