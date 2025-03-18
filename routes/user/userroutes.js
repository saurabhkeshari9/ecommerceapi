const express = require('express');
const { register, login, getProfile, updateProfile, deleteProfile } = require('../../controllers/user/userauth');
const { addAddress, getAllAddresses, updateAddress, deleteAddress } = require('../../controllers/user/userAddress');
const { getOrders } = require("../../controllers/user/ordercontroller");
const isUser = require('../../middleware/isUser');
const validate = require('../../middleware/validate');
const { addressSchema, addressIdSchema } = require('../../validation/user/useraddress');
const { registerSchema, loginSchema, updateProfileSchema } = require('../../validation/user/userauth');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login',validate(loginSchema), login);
router.get('/getprofile', isUser,getProfile);
router.put('/updateprofile', isUser, validate(updateProfileSchema), updateProfile);
router.delete('/deleteprofile', isUser, deleteProfile);

router.post('/addaddress', isUser, validate(addressSchema), addAddress);
router.get('/getaddress', isUser, getAllAddresses);
router.put('/updateaddress/:addressId', isUser, validate(addressIdSchema,'params'), updateAddress);
router.delete('/deleteaddress/:addressId', isUser, validate(addressIdSchema, 'params'), deleteAddress);

router.get("/getorder", isUser, getOrders);

module.exports = router;