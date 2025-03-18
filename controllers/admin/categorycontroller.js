const Category = require('../../models/category.model');

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name, isDeleted: false });
    if (existingCategory) {
      return res.status(400).json({ statusCode: 400, message: 'Category already exists' });
    }

    const newCategory = await Category.create({ name, description });
    return res.status(200).json({ statusCode: 200, message: 'Category created successfully', data: newCategory });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
      let { limit = 10, offset = 0 } = req.query;
      limit = parseInt(limit);
      offset = parseInt(offset);

      // Count total categories
      const totalCategories = await Category.countDocuments({ isDeleted: false });

      // Fetch categories using offset-based pagination
      const categories = await Category.find({ isDeleted: false })
          .sort({ createdAt: -1 }) // Sort by latest first
          .skip(offset) 
          .limit(limit)
          .select("name description createdAt") // Select only required fields
          .lean();

      return res.status(200).json({
          statusCode: 200,
          message: "Categories retrieved successfully",
          totalCategories,
          data: categories
      });

  } catch (err) {
      return res.status(500).json({ statusCode: 500, message: err.message });
  }
};


// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, isDeleted: false },
      { name, description },
      { new: true }
    );

    if (!category) {
      return res.status(400).json({ statusCode: 400, message: 'Category not found' });
    }

    return res.status(200).json({ statusCode: 200, message: 'Category updated successfully', data: category });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!category) {
      return res.status(400).json({ statusCode: 400, message: 'Category not found' });
    }

    return res.status(200).json({ statusCode: 200, message: 'Category deleted successfully', data: category });
  } catch (err) {
    return res.status(500).json({ statusCode: 500, message: err.message });
  }
};