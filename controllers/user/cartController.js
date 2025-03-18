const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const Order = require("../../models/order.model");
const Address = require("../../models/useraddress.model");

// Add Item to Cart
exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Find product and ensure it's not deleted in one query
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(400).json({ statusCode: 400, message: 'Product not found' });
    }

    // Find the cart while ensuring it's not marked as deleted
    let cart = await Cart.findOne({ user: req.userAuth._id, isDeleted: false });

    if (!cart) {
      // Create a new cart if none exists
      cart = await Cart.create({
        user: req.userAuth._id,
        items: [{ product: productId, quantity, price: product.price }],
        totalPrice: product.price * quantity,
      });
    } else {
      // Check if the item already exists in the cart
      const existingItem = cart.items.find((item) => item.product.toString() === productId);

      if (existingItem) {
        existingItem.quantity += quantity;

        // Only update price if it has changed
        if (existingItem.price !== product.price) {
          existingItem.price = product.price;
        }
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }

      // Remove items with zero or negative quantity
      cart.items = cart.items.filter((item) => item.quantity > 0);

      // Update the total price of the cart
      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Save updated cart
      await cart.save();
    }

    return res.status(200).json({ statusCode: 200, message: 'Item added to cart', data: cart });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};
  

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query; // Pagination setup

    // Aggregation pipeline
    const cartAggregation = await Cart.aggregate([
      {
        $match: {
          user: req.userAuth._id,
          isDeleted: false
        }
      },
      {
        $unwind: "$items" // Split items array
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $match: {
          "productDetails.isDeleted": false // Filter out deleted products
        }
      },
      {
        $project: {
          _id: 0,
          productId: "$items.product",
          name: "$productDetails.name",
          quantity: "$items.quantity",
          pricePerUnit: "$productDetails.price",
          totalPrice: { $multiply: ["$items.quantity", "$productDetails.price"] },
          description: "$productDetails.description",
          image: { $arrayElemAt: ["$productDetails.Productimages", 0] }, // Get first image
        }
      },
      {
        $facet: {
          paginatedResults: [{ $skip: parseInt(offset) }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "totalItems" }]
        }
      }
    ]);

    const cartItem = cartAggregation[0].paginatedResults;
    const totalItems = cartAggregation[0].totalCount[0]?.totalItems || 0;

    if (!cartItem.length) {
      return res.status(400).json({
        statusCode: 400,
        message: "Cart is empty"
      });
    }

    // Calculate total cart price
    const totalCartPrice = cartItem.reduce((acc, item) => acc + item.totalPrice, 0);

    return res.status(200).json({
      statusCode: 200,
      message: "Cart retrieved successfully",
      totalItems,
      data: {
        cartItem,
        totalCartPrice,
      }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message
    });
  }
};

  

// Remove Item from Cart
exports.removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.userAuth._id, isDeleted: false });
    if (!cart) {
      return res.status(400).json({ statusCode: 400, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      await cart.save();
      return res.status(200).json({ statusCode: 200, message: 'Item removed from cart' });
    } else {
      return res.status(400).json({ statusCode: 400, message: 'Product not found in cart' });
    }
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.userAuth._id, isDeleted: false },
      { items: [], totalPrice: 0 },
      { new: true }
    );

    if (!cart) {
      return res.status(400).json({ statusCode: 400, message: 'Cart not found' });
    }

    return res.status(200).json({ statusCode: 200, message: 'Cart cleared successfully' });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};


// Checkout
exports.checkout = async (req, res) => {
  try {
    const { addressId } = req.body;

    // Validate the address
    const address = await Address.findOne({ _id: addressId, userId: req.userAuth._id, isDeleted: false });
    if (!address) {
      return res.status(400).json({ statusCode: 400, message: "Invalid or missing address" });
    }

    // Fetch the user's cart using aggregation
    const cartAggregation = await Cart.aggregate([
      {
        $match: {
          user: req.userAuth._id,
          isDeleted: false,
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
        $unwind: "$productDetails", // Unwind the product details array
      },
      {
        $match: {
          "productDetails.isDeleted": false, // Ensure the product is not deleted
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$items.product",
          quantity: "$items.quantity",
          price: "$items.price",
          productName: "$productDetails.name",
          productPrice: "$productDetails.price",
          totalPrice: { $multiply: ["$items.quantity", "$productDetails.price"] },
        },
      },
    ]);

    if (!cartAggregation.length) {
      return res.status(400).json({ statusCode: 400, message: "Cart is empty or not found" });
    }

    // Calculate the total price of the cart
    const totalCartPrice = cartAggregation.reduce((acc, item) => acc + item.totalPrice, 0);

    // Create an order
    const order = await Order.create({
      user: req.userAuth._id,
      items: cartAggregation.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.productPrice,
      })),
      totalPrice: totalCartPrice,
      address: address._id,
    });

    // Clear the cart
    await Cart.findOneAndUpdate(
      { user: req.userAuth._id, isDeleted: false },
      { items: [], totalPrice: 0 },
      { new: true }
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Checkout successful",
      data: order,
    });
  } catch (err) {
    console.error("Checkout Error:", err.message);
    return res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
};

