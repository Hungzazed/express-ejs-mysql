const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

// Danh sách categories (tất cả user đã login)
router.get('/categories', requireAuth, categoryController.listCategories);

// Thêm category (chỉ admin)
router.get('/categories/add', requireAdmin, categoryController.showAddForm);
router.post('/categories/add', requireAdmin, categoryController.createCategory);

// Sửa category (chỉ admin)
router.get('/categories/edit/:id', requireAdmin, categoryController.showEditForm);
router.post('/categories/update/:id', requireAdmin, categoryController.updateCategory);

// Xóa category (chỉ admin)
router.post('/categories/delete/:id', requireAdmin, categoryController.deleteCategory);

module.exports = router;
