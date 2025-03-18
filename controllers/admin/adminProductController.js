const Product = require("../../models/product.model");

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