const Order = require("../../models/order.model");
const User = require("../../models/user.model");
//const Product = require("../../models/product.model");

// Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Aggregation pipeline to fetch all orders
    const ordersAggregation = await Order.aggregate([
      {
        $lookup: {
          from: "users", // Join with the users collection
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Unwind user details
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
        $unwind: "$addressDetails", // Unwind address details
      },
      {
        $project: {
          _id: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
          "items.product": 1,
          "items.quantity": 1,
          "items.price": 1,
          "productDetails.name": 1,
          "productDetails.description": 1,
          "productDetails.Productimages": 1,
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
      return res.status(400).json({statusCode: 400,message: "No orders found",});
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Orders retrieved successfully",
      totalOrders,
      data: paginatedResults,
    });
  } catch (err) {
    console.error("Error retrieving orders:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch order details
    const order = await Order.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: "users", // Join with the users collection
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Unwind user details
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
        $unwind: "$addressDetails", // Unwind address details
      },
      {
        $project: {
          _id: 1,
          totalPrice: 1,
          status: 1,
          createdAt: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
          "items.product": 1,
          "items.quantity": 1,
          "items.price": 1,
          "productDetails.name": 1,
          "productDetails.description": 1,
          "productDetails.Productimages": 1,
          "addressDetails.street": 1,
          "addressDetails.city": 1,
          "addressDetails.state": 1,
          "addressDetails.postalCode": 1,
        },
      },
    ]);

    if (!order.length) {
      return res.status(400).json({
        statusCode: 400,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (err) {
    console.error("Error retrieving order:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid status value",
      });
    }

    // Find and update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(400).json({
        statusCode: 400,
        message: "Order not found",
      });
    }
   
    return res.status(200).json({
      statusCode: 200,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find and soft-delete the order
    const deletedOrder = await Order.findOneAndUpdate(
      { _id: orderId, isDeleted: false }, // Check for non-deleted order
      { isDeleted: true },
      { new: true }
    );

    if (!deletedOrder) {
      return res.status(400).json({
        statusCode: 400,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (err) {
    console.error("Error deleting order:", err.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};