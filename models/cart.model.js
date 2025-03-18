const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // Index for fast lookup
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Store price at the time of adding
      },
    ],
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    totalPrice: { type: Number, default: 0 }, // Store total cart value
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);