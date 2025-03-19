const express = require('express');
const { loginAdmin, getAllUsers, blockUser } = require('../../controllers/admin/adminauth');
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor } = require('../../controllers/admin/adminauth');
const isAdmin = require('../../middleware/isAdmin');
const validatebody = require('../../middleware/validatebody');
const validateParams = require('../../middleware/validateparams');
const { AdminloginSchema, UserId } = require('../../validation/admin/adminauth');
const { vendorSchema, vendorIdSchema } = require('../../validation/admin/adminvendor');

const router = express.Router();

router.post('/login', validatebody(AdminloginSchema), loginAdmin);
router.get('/users', isAdmin, getAllUsers);
router.put('/block/:id', isAdmin, validateParams(UserId), blockUser);

//vendor routes
router.post('/create', isAdmin, validatebody(vendorSchema), createVendor);
router.get('/all', isAdmin, getAllVendors);
router.get('/:vendorId', isAdmin, validateParams(vendorIdSchema), getVendorById);
router.put('/update/:vendorId', isAdmin, validateParams(vendorIdSchema), updateVendor);
router.delete('/delete/:vendorId', isAdmin, validateParams(vendorIdSchema), deleteVendor);
module.exports = router;