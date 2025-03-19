const express = require("express");
const { getProductFeed, getProductDetails, getCategoriesWithProducts } = require("../../controllers/user/productController");
const validateParams = require("../../middleware/validateparams");
const { productIdSchema } = require("../../validation/user/userproduct");
const isUser = require("../../middleware/isUser");
const { reportProduct } = require("../../controllers/user/productController");

const router = express.Router();

// Get product feed
router.get("/feed", getProductFeed);

// Get product details
router.get("/productdetail/:productId", validateParams(productIdSchema), getProductDetails);

// Get category by product
router.get("/getcategorybyproduct", getCategoriesWithProducts);

// Report a product
router.post("/report/:productId", isUser, validateParams(productIdSchema), reportProduct);

module.exports = router;