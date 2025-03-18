const express = require('express');
const { loginAdmin, getAllUsers, blockUser } = require('../../controllers/admin/adminauth');
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor } = require('../../controllers/admin/adminauth');
const isAdmin = require('../../middleware/isAdmin');
const validate = require('../../middleware/validate');
const { AdminloginSchema, UserId } = require('../../validation/admin/adminauth');
const { vendorSchema, vendorIdSchema } = require('../../validation/admin/adminvendor');

const router = express.Router();

router.post('/login', validate(AdminloginSchema), loginAdmin);
router.get('/users', isAdmin, getAllUsers);
router.put('/block/:id', isAdmin, validate(UserId), blockUser);

//vendor routes
router.post('/create', isAdmin, validate(vendorSchema), createVendor);
router.get('/all', isAdmin, getAllVendors);
router.get('/:vendorId', isAdmin, validate(vendorIdSchema,'params'), getVendorById);
router.put('/update/:vendorId', isAdmin, validate(vendorIdSchema,'params'), updateVendor);
router.delete('/delete/:vendorId', isAdmin, validate(vendorIdSchema,'params'), deleteVendor);
module.exports = router;