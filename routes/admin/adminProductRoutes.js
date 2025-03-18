const express = require("express");
const {getAllProducts,getProductById,deleteProduct} = require("../../controllers/admin/adminProductController");
const isAdmin = require("../../middleware/isAdmin");

const router = express.Router();

// Get all products
router.get("/getallproduct", isAdmin, getAllProducts);

// Get product by ID
router.get("/getproductbyid/:productId", isAdmin, getProductById);

// Delete product
router.delete("/deleteproduct/:productId", isAdmin, deleteProduct);

module.exports = router;