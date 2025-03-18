const express = require("express");
const {getAllOrders,getOrderById} = require("../../controllers/admin/adminOrderController");
const isAdmin = require("../../middleware/isAdmin");

const router = express.Router();

// Get all orders
router.get("/getallorder", isAdmin, getAllOrders);

// Get order by ID
router.get("/getallorder/:orderId", isAdmin, getOrderById);

module.exports = router;