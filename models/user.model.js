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
      match: [/^\+\d{1,15}$/, "Please enter a valid phone number in E.164 format"] 
    },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    otp: { type: String }, 
    otpExpires: { type: Date },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
