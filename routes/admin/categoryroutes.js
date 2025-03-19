const express = require('express');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../../controllers/admin/categorycontroller');
const isAdmin = require('../../middleware/isAdmin');
const validatebody = require('../../middleware/validatebody');
const validateParams = require('../../middleware/validateparams');
const { categorySchema, categoryIdSchema } = require('../../validation/admin/category');

const router = express.Router();

router.post('/create', isAdmin, validatebody(categorySchema), createCategory);
router.get('/all', isAdmin, getAllCategories);
router.put('/update/:categoryId', isAdmin, validateParams(categoryIdSchema), updateCategory);
router.delete('/delete/:categoryId', isAdmin, validateParams(categoryIdSchema), deleteCategory);

module.exports = router;