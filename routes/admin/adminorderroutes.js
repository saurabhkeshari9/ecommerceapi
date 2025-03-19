const express = require("express");
const {getAllOrders,getOrderById,deleteOrder,updateOrderStatus} = require("../../controllers/admin/adminOrderController");
const isAdmin = require("../../middleware/isAdmin");
const validateParams = require('../../middleware/validateparams');
const { orderIdSchema } = require("../../validation/admin/adminorder");

const router = express.Router();

// Get all orders
router.get("/getallorder", isAdmin,  getAllOrders);

// Get order by ID
router.get("/getallorderbyid/:orderId", isAdmin,validateParams(orderIdSchema), getOrderById);

// Delete order
router.delete("/deleteorder/:orderId", isAdmin,validateParams(orderIdSchema), deleteOrder);

// Update order status
router.put("/updateorderstatus/:orderId", isAdmin,validateParams(orderIdSchema), updateOrderStatus);

module.exports = router;