const Order = require("../../models/order.model");

// Get Orders
exports.getOrders = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // Aggregation pipeline
    const ordersAggregation = await Order.aggregate([
      {
        $match: {
          user: req.userAuth._id, // Match orders for the authenticated user
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
        message: "No orders found",
      });
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
