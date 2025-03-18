const express = require('express');
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../../controllers/admin/categorycontroller');
const isAdmin = require('../../middleware/isAdmin');
const validate = require('../../middleware/validate');
const { categorySchema, categoryIdSchema } = require('../../validation/admin/category');

const router = express.Router();

router.post('/create', isAdmin, validate(categorySchema), createCategory);
router.get('/all', isAdmin, getAllCategories);
router.put('/update/:categoryId', isAdmin, validate(categoryIdSchema,'params'), updateCategory);
router.delete('/delete/:categoryId', isAdmin, validate(categoryIdSchema,'params'), deleteCategory);

module.exports = router;