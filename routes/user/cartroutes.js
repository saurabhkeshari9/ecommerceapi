const express = require('express');
const { addItemToCart, getCart, removeItemFromCart, clearCart, checkout } = require('../../controllers/user/cartController');
const isUser = require('../../middleware/isUser');
const validate = require('../../middleware/validate');
const { addItemSchema, productIdSchema } = require('../../validation/user/cart');

const router = express.Router();

router.post('/add', isUser, validate(addItemSchema), addItemToCart);
router.get('/', isUser, getCart);
router.delete('/remove/:productId', isUser, validate(productIdSchema, 'params'), removeItemFromCart);
router.delete('/clear', isUser, clearCart);
router.post('/checkout', isUser, checkout); // Add checkout route

module.exports = router;