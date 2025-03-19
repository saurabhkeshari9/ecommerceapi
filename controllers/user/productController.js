const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
const Report = require("../../models/report.model");
const mongoose = require("mongoose");

// Get Product Feed
exports.getProductFeed = async (req, res) => {
  try {
    const { limit = 10, offset = 0, category, search } = req.query;

    // Build filter based on query parameters
    const filter = { isDeleted: false };
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Aggregation pipeline for product feed
    const productFeed = await Product.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "categories", // Join with the categories collection
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails", // Unwind category details
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          Productimages: 1,
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by latest products
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) },
    ]);

    // Count total products for pagination
    const totalProducts = await Product.countDocuments(filter);

    return res.status(200).json({
      statusCode: 200,
      message: "Product feed retrieved successfully",
      totalProducts,
      data: productFeed,
    });
  } catch (err) {
    console.error("Error retrieving product feed:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Get Product Details
exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    // Fetch product details with category and vendor information
    const product = await Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(productId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "categories", // Join with the categories collection
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $lookup: {
          from: "vendors", // Join with the vendors collection
          localField: "vendor",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$vendorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          Productimages: 1,
          category: "$categoryDetails.name",
          vendor: {
            name: "$vendorDetails.name",
            email: "$vendorDetails.email",
            mobile: "$vendorDetails.mobile",
          },
          createdAt: 1,
        },
      },
    ]);

    if (!product.length) {
      return res.status(400).json({
        statusCode: 400,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Product details retrieved successfully",
      data: product[0],
    });
  } catch (err) {
    console.error("Error retrieving product details:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Get Categories with Products
exports.getCategoriesWithProducts = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Aggregation pipeline to get all categories with their products
    const categoriesWithProducts = await Category.aggregate([
      {
        $match: {
          isDeleted: false, // Only show non-deleted categories
        },
      },
      {
        $lookup: {
          from: "products", // Join with products collection
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: "$products" }, // Count total products in each category
          products: {
            $slice: ["$products", parseInt(offset), parseInt(limit)], // Apply pagination
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          totalProducts: 1,
          "products._id": 1,
          "products.name": 1,
          "products.description": 1,
          "products.price": 1,
          "products.Productimages": 1,
        },
      },
    ]);

    if (!categoriesWithProducts.length) {
      return res.status(400).json({
        statusCode: 400,
        message: "No categories with products found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Categories with products retrieved successfully",
      data: categoriesWithProducts,
    });
  } catch (err) {
    console.error("Error fetching categories with products:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};



// Report a Product
exports.reportProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { reason } = req.body;

    // Check if the product exists
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(400).json({
        statusCode: 400,
        message: "Product not found",
      });
    }

    // Check if the user has already reported this product
    const existingReport = await Report.findOne({ product: productId, user: req.userAuth._id });
    if (existingReport) {
      return res.status(400).json({
        statusCode: 400,
        message: "You have already reported this product",
      });
    }

    // Create a new report
    const report = await Report.create({
      product: productId,
      user: req.userAuth._id,
      reason,
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Product reported successfully",
      data: report,
    });
  } catch (err) {
    console.error("Error reporting product:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};