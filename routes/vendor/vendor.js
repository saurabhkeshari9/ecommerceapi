const express = require('express');
const { login,getProfile,addProduct, getAllProducts, updateProduct, deleteProduct } = require('../../controllers/vendor/vendorauthcontroller');
const isVendor = require('../../middleware/isVendor');
const validate = require('../../middleware/validatebody');
const { vendorLoginSchema,productSchema, productIdSchema } = require('../../validation/vendor/vendor');
const upload = require('../../middleware/multer');

const router = express.Router();
router.post('/login', validate(vendorLoginSchema), login);
router.get('/profile', isVendor, getProfile);

router.post('/add', isVendor, upload.array('images'), validate(productSchema), addProduct);
router.get('/all', isVendor, getAllProducts);
router.put('/update/:productId', isVendor, upload.array('images'), validate(productIdSchema, 'params'), updateProduct);
router.delete('/delete/:productId', isVendor, validate(productIdSchema, 'params'), deleteProduct);

module.exports = router;