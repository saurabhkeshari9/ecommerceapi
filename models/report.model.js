const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);