const Order = require("../../models/order.model");
//const Product = require("../../models/product.model");

// Get Total Sales and Total Sales by Vendor
exports.getSalesData = async (req, res) => {
  try {
    // Total Sales
    const totalSalesAggregation = await Order.aggregate([
      {
        $match: {
          status: "completed", // Only include completed orders
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }, // Sum up the totalPrice of all orders
        },
      },
    ]);

    const totalRevenue = totalSalesAggregation[0]?.totalRevenue || 0;

    // Total Sales by Vendor
    const salesByVendorAggregation = await Order.aggregate([
      {
        $match: {
          status: "completed", // Only include completed orders
        },
      },
      {
        $unwind: "$items", // Split items array into individual documents
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
        $unwind: "$productDetails", // Unwind product details
      },
      {
        $group: {
          _id: "$productDetails.vendor", // Group by vendor ID
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }, // Calculate revenue per vendor
          totalProductsSold: { $sum: "$items.quantity" }, // Count total products sold per vendor
        },
      },
      {
        $lookup: {
          from: "vendors", // Join with the vendors collection
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails",
        },
      },
      {
        $unwind: "$vendorDetails", // Unwind vendor details
      },
      {
        $project: {
          _id: 0,
          vendorId: "$vendorDetails._id",
          vendorName: "$vendorDetails.name",
          vendorEmail: "$vendorDetails.email",
          totalRevenue: 1,
          totalProductsSold: 1,
        },
      },
    ]);

    return res.status(200).json({
      statusCode: 200,
      message: "Sales data retrieved successfully",
      data: {
        totalRevenue,
        salesByVendor: salesByVendorAggregation,
      },
    });
  } catch (err) {
    console.error("Error retrieving sales data:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};