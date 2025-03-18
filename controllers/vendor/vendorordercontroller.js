const Order = require("../../models/order.model");
const Product = require("../../models/product.model");

// Get Orders for Vendor
exports.getVendorOrders = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Aggregation pipeline to fetch orders containing vendor's products
    const ordersAggregation = await Order.aggregate([
      {
        $match: {
          "items.product": { $in: await Product.find({ vendor: req.vendorAuth._id }).distinct("_id") },
        },
      },
      {
        $lookup: {
          from: "products", // Join with the products collection
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $lookup: {
          from: "addresses", // Join with the addresses collection
          localField: "address",
          foreignField: "_id",
          as: "addressDetails",
        },
      },
      {
        $unwind: "$addressDetails", // Unwind the address details array
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productDetails",
                          as: "product",
                          cond: {
                            $eq: ["$$product._id", "$$item.product"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          "items.name": 1,
          "items.description": 1,
          "items.product": 1,
          "items.quantity": 1,
          "items.price": 1,
          "items.Productimages": 1,
          "addressDetails.street": 1,
          "addressDetails.city": 1,
          "addressDetails.state": 1,
          "addressDetails.postalCode": 1,
        },
      },
      {
        $facet: {
          paginatedResults: [
            { $skip: parseInt(offset) },
            { $limit: parseInt(limit) },
          ],
          totalCount: [{ $count: "totalOrders" }],
        },
      },
    ]);

    const paginatedResults = ordersAggregation[0]?.paginatedResults || [];
    const totalOrders = ordersAggregation[0]?.totalCount[0]?.totalOrders || 0;

    if (!paginatedResults.length) {
      return res.status(400).json({
        statusCode: 400,
        message: "No orders found for your products",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Orders retrieved successfully",
      totalOrders,
      data: paginatedResults,
    });
  } catch (err) {
    console.error("Error retrieving vendor orders:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Update Order Status for Vendor
exports.updateVendorOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ statusCode: 400, message: "Invalid status value" });
    }

    // Find the order and ensure it contains products belonging to the vendor
    const order = await Order.findOne({
      _id: orderId,
      "items.product": { $in: await Product.find({ vendor: req.vendorAuth._id }).distinct("_id") },
    });

    if (!order) {
      return res.status(400).json({ statusCode: 400, message: "Order not found or not related to your products" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    return res.status(200).json({
      statusCode: 200,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Vendor Analytics
exports.getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendorAuth._id;

    // Total Revenue and Total Orders
    const revenueAndOrders = await Order.aggregate([
      {
        $match: {
          "items.product": { $in: await Product.find({ vendor: vendorId }).distinct("_id") },
        },
      },
      {
        $unwind: "$items", // Split items array into individual documents
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Unwind product details
      },
      {
        $match: {
          "productDetails.vendor": vendorId, // Ensure the product belongs to the vendor
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueAndOrders[0]?.totalRevenue || 0;
    const totalOrders = revenueAndOrders[0]?.totalOrders || 0;

    // Total Products
    const totalProducts = await Product.countDocuments({ vendor: vendorId, isDeleted: false });

    // Top-Selling Products
    const topSellingProducts = await Order.aggregate([
      {
        $match: {
          "items.product": { $in: await Product.find({ vendor: vendorId }).distinct("_id") },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $match: {
          "productDetails.vendor": vendorId,
        },
      },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$productDetails.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      {
        $sort: { totalSold: -1 }, // Sort by total quantity sold in descending order
      },
      {
        $limit: 5, // Limit to top 5 products
      },
    ]);

    return res.status(200).json({
      statusCode: 200,
      message: "Vendor analytics retrieved successfully",
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        topSellingProducts,
      },
    });
  } catch (err) {
    console.error("Error retrieving vendor analytics:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};