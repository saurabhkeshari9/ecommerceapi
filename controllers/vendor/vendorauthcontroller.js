const Vendor = require('../../models/vendor.model');
const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Vendor Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email, isDeleted: false }).select("name email password").lean();
    if (!vendor) {
      return res.status(400).json({ statusCode: 400, message: "Vendor is not active or does not exist" });
    }

    if (!(await bcrypt.compare(password, vendor.password))) {
      return res.status(400).json({ statusCode: 400, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    delete vendor.password;

    return res.status(200).json({
      statusCode: 200,
      message: "Vendor login successful",
      data: { ...vendor, token },
    });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Get Vendor Profile
exports.getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.vendorAuth._id, isDeleted: false }).select("-password");
    if (!vendor) {
      return res.status(400).json({ statusCode: 400, message: "Vendor not found" });
    }
    return res.status(200).json({ statusCode: 200, message: "Vendor Profile", data: vendor });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const existingCategory = await Category.findOne({ _id: category, isDeleted: false });
    if (!existingCategory) {
      return res.status(400).json({ statusCode: 400, message: 'Category not found' });
    }
    const Productimages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    console.log(Productimages)
    const newProduct = await Product.create({ name, description, price, category, Productimages, vendor: req.vendorAuth._id });

    return res.status(200).json({ statusCode: 200, message: 'Product added successfully', data: newProduct });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
      let { limit = 10, offset = 0 } = req.query;
      limit = parseInt(limit);
      offset = parseInt(offset);
  
      const filter = { vendor: req.vendorAuth._id, isDeleted: false };
  
      const result = await Product.aggregate([
        { $match: filter }, // Filter by vendor and isDeleted
        { $sort: { createdAt: -1 } }, // Sort by latest products first
        { $facet: {
            metadata: [{ $count: "totalProducts" }], // Get total count
            data: [
              { $skip: offset }, // Apply offset
              { $limit: limit }, // Apply limit
              {
                $lookup: {
                  from: "categories", // Join with categories collection
                  localField: "category",
                  foreignField: "_id",
                  as: "categoryInfo"
                }
              },
              { $unwind: "$categoryInfo" }, // Convert category array to object
              {
                $project: {
                  name: 1,
                  price: 1,
                  description: 1,
                  Productimages: 1,
                  category: "$categoryInfo.name", // Extract category name
                  createdAt: 1
                }
              }
            ]
        }}
      ]);
  
      // Extract total count and paginated products
      const totalProducts = result[0].metadata.length ? result[0].metadata[0].totalProducts : 0;
      const products = result[0].data;
  
      return res.status(200).json({
        statusCode: 200,
        message: "Products retrieved successfully",
        totalProducts,
        data: products
      });
  
    } catch (err) {
      return res.status(500).json({ statusCode: 500, message: err.message });
    }
  };
  

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category } = req.body;
    const Productimages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const product = await Product.findOneAndUpdate(
      { _id: productId, vendor: req.vendorAuth._id, isDeleted: false },
      { name, description, price, category, Productimages },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({ statusCode: 400, message: 'Product not found' });
    }

    return res.status(200).json({ statusCode: 200, message: 'Product updated successfully', data: product });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, vendor: req.vendorAuth._id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({ statusCode: 400, message: 'Product not found' });
    }

    return res.status(200).json({ statusCode: 200, message: 'Product deleted successfully', data: product });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};