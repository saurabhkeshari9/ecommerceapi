const express = require('express');
const { register, login, getProfile, updateProfile, deleteProfile } = require('../../controllers/user/userauth');
const { addAddress, getAllAddresses, updateAddress, deleteAddress } = require('../../controllers/user/userAddress');
const { getOrders } = require("../../controllers/user/ordercontroller");
const isUser = require('../../middleware/isUser');
const validatebody = require('../../middleware/validatebody');
const { addressSchema, addressIdSchema } = require('../../validation/user/useraddress');
const { registerSchema, loginSchema, updateProfileSchema } = require('../../validation/user/userauth');
const { verifyOTP } = require("../../controllers/user/verifyotp");
const validateParams = require('../../middleware/validateparams');

const router = express.Router();

router.post('/register', validatebody(registerSchema), register);
router.post('/login',validatebody(loginSchema), login);
router.post("/verify-otp", verifyOTP);
router.get('/getprofile', isUser,getProfile);
router.put('/updateprofile', isUser, validatebody(updateProfileSchema), updateProfile);
router.delete('/deleteprofile', isUser, deleteProfile);

router.post('/addaddress', isUser, validatebody(addressSchema), addAddress);
router.get('/getaddress', isUser, getAllAddresses);
router.put('/updateaddress/:addressId', isUser, validateParams(addressIdSchema), updateAddress);
router.delete('/deleteaddress/:addressId', isUser, validateParams(addressIdSchema), deleteAddress);

router.get("/getorder", isUser, getOrders);

module.exports = router;

