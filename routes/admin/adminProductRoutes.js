const express = require("express");
const {getAllProducts,getProductById,deleteProduct} = require("../../controllers/admin/adminProductController");
const isAdmin = require("../../middleware/isAdmin");
const validateParams = require('../../middleware/validateparams');
const { productIdSchema } = require("../../validation/admin/adminproduct");

const router = express.Router();

// Get all products
router.get("/getallproduct", isAdmin, getAllProducts);

// Get product by ID
router.get("/getproductbyid/:productId", isAdmin, validateParams(productIdSchema), getProductById);

// Delete product
router.delete("/deleteproduct/:productId", isAdmin, validateParams(productIdSchema), deleteProduct);

module.exports = router;