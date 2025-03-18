const express = require("express");
const {getSalesData} = require("../../controllers/admin/adminanalyticscontroller");
const isAdmin = require("../../middleware/isAdmin");

const router = express.Router();

// Get total sales and sales by vendor
router.get("/sales", isAdmin, getSalesData);

module.exports = router;