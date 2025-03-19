const express = require('express');
const { addItemToCart, getCart, removeItemFromCart, clearCart, checkout } = require('../../controllers/user/cartController');
const isUser = require('../../middleware/isUser');
const validatebody = require('../../middleware/validatebody');
const { addItemSchema} = require('../../validation/user/cart');
const validateParams = require('../../middleware/validateparams');
const { productIdSchema } = require('../../validation/user/userproduct');

const router = express.Router();

router.post('/add', isUser, validatebody(addItemSchema), addItemToCart);
router.get('/', isUser, getCart);
router.delete('/remove/:productId', isUser, validateParams(productIdSchema), removeItemFromCart);
router.delete('/clear', isUser, clearCart);
router.post('/checkout', isUser, checkout); // Add checkout route

module.exports = router;