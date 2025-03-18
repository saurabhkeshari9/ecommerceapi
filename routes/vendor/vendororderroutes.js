const express = require("express");
const { getVendorOrders, updateVendorOrderStatus, getVendorAnalytics } = require("../../controllers/vendor/vendorordercontroller");
const isVendor = require("../../middleware/isVendor");

const router = express.Router();

// Get all orders for vendor's products
router.get("/getorder", isVendor, getVendorOrders);

// Update order status for vendor's products
router.put("/updateorder/:orderId", isVendor, updateVendorOrderStatus);

// Get vendor analytics
router.get("/analytics", isVendor, getVendorAnalytics);

module.exports = router;