const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getAllCategories);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', auth, createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', auth, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', auth, deleteCategory);

module.exports = router;