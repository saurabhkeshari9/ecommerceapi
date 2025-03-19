const express = require("express");
const {getAllProducts,getProductById,deleteProduct} = require("../../controllers/admin/adminProductController");
const isAdmin = require("../../middleware/isAdmin");
const validateParams = require('../../middleware/validateparams');
const { productIdSchema } = require("../../validation/admin/adminproduct");
const { reportIdSchema } = require("../../validation/admin/adminreport");
const { getReportedProducts, deleteReportedProduct } = require("../../controllers/admin/adminProductController");
const router = express.Router();

// Get all products
router.get("/getallproduct", isAdmin, getAllProducts);

// Get product by ID
router.get("/getproductbyid/:productId", isAdmin, validateParams(productIdSchema), getProductById);

// Delete product
router.delete("/deleteproduct/:productId", isAdmin, validateParams(productIdSchema), deleteProduct);

// Get all reported products
router.get("/reported", isAdmin, getReportedProducts);

// Delete reported product
router.delete("/reported/:reportId", isAdmin, validateParams(reportIdSchema), deleteReportedProduct);

module.exports = router;