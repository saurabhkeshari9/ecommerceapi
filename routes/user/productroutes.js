const express = require("express");
const { getProductFeed, getProductDetails, getCategoriesWithProducts } = require("../../controllers/user/productController");

const router = express.Router();

// Get product feed
router.get("/feed", getProductFeed);

// Get product details
router.get("/productdetail/:productId", getProductDetails);

// Get category by product
router.get("/getcategorybyproduct", getCategoriesWithProducts);
module.exports = router;