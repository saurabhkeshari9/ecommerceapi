const Product = require("../../models/product.model");
const Report = require("../../models/report.model");

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const { limit = 10, offset = 0, category } = req.query;

    // Build filter based on query parameters
    const filter = { isDeleted: false };
   
    if (category) {
      filter.category = category;
    }

    // Count total products
    const totalProducts = await Product.countDocuments(filter);

    // Fetch products with pagination
    const products = await Product.aggregate([
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
        $lookup: {
          from: "vendors", // Join with the vendors collection
          localField: "vendor",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      { $unwind: "$vendorDetails" },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          Productimages: 1,
          category: "$categoryDetails.name",
          vendor: "$vendorDetails.name",
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by latest products
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) },
    ]);
    if (!products.length) {
        return res.status(400).json({
          statusCode: 400,
          message: "No products found",
        });
      }

    return res.status(200).json({
      statusCode: 200,
      message: "Products retrieved successfully",
      totalProducts,
      data: products,
    });
  } catch (err) {
    console.error("Error retrieving products:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // Fetch product details with category and vendor information
    const product = await Product.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(productId),
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
      { $unwind: "$categoryDetails" },
      { $unwind: "$vendorDetails" },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          Productimages: 1,
          category: "$categoryDetails.name",
          vendor: "$vendorDetails.name",
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
      message: "Product retrieved successfully",
      data: product[0],
    });
  } catch (err) {
    console.error("Error retrieving product:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};


// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(400).json({
        statusCode: 400,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};


// Get All Reported Products
exports.getReportedProducts = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const reports = await Report.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          reason: 1,
          status: 1,
          createdAt: 1,
          "productDetails._id": 1,
          "productDetails.name": 1,
          "productDetails.description": 1,
          "productDetails.price": 1,
          "productDetails.Productimages": 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
        },
      },
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) },
    ]);

    return res.status(200).json({
      statusCode: 200,
      message: "Reported products retrieved successfully",
      data: reports,
    });
  } catch (err) {
    console.error("Error retrieving reported products:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Delete Reported Product
exports.deleteReportedProduct = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Use aggregation to fetch the report and associated product details
    const reportAggregation = await Report.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(reportId),
          status: "pending", // Only fetch pending reports
        },
      },
      {
        $lookup: {
          from: "products", // Join with the products collection
          localField: "product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Unwind the product details
      },
      {
        $project: {
          _id: 1,
          reason: 1,
          status: 1,
          "productDetails._id": 1,
          "productDetails.isDeleted": 1,
        },
      },
    ]);

    // Check if the report exists
    if (!reportAggregation.length) {
      return res.status(400).json({
        statusCode: 400,
        message: "Report not found or already reviewed",
      });
    }

    const report = reportAggregation[0];
    const productId = report.productDetails._id;

    // Check if the product is already deleted
    if (report.productDetails.isDeleted) {
      return res.status(400).json({
        statusCode: 400,
        message: "Product is already deleted",
      });
    }

    // Soft-delete the product
    const product = await Product.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({
        statusCode: 400,
        message: "Product not found",
      });
    }

    // Mark the report as reviewed
    await Report.findOneAndUpdate(
      { _id: reportId },
      { status: "reviewed" },
      { new: true }
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Reported product deleted successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error deleting reported product:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};