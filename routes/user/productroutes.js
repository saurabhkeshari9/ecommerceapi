const express = require("express");
const { getProductFeed, getProductDetails, getCategoriesWithProducts } = require("../../controllers/user/productController");
const validateParams = require("../../middleware/validateparams");
const { productIdSchema } = require("../../validation/user/userproduct");

const router = express.Router();

// Get product feed
router.get("/feed", getProductFeed);

// Get product details
router.get("/productdetail/:productId", validateParams(productIdSchema), getProductDetails);

// Get category by product
router.get("/getcategorybyproduct", getCategoriesWithProducts);
module.exports = router;