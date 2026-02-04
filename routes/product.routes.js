const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Danh sách sản phẩm (tất cả user đã login)
router.get('/products', requireAuth, productController.listProducts);

// Chi tiết sản phẩm
router.get('/products/detail/:id', requireAuth, productController.showProductDetail);

// Thêm sản phẩm (chỉ admin)
router.get('/products/add', requireAdmin, productController.showAddForm);
router.post('/products/add', requireAdmin, upload.single('image'), productController.createProduct);

// Sửa sản phẩm (chỉ admin)
router.get('/products/edit/:id', requireAdmin, productController.showEditForm);
router.post('/products/update/:id', requireAdmin, upload.single('image'), productController.updateProduct);

// Xóa sản phẩm (chỉ admin)
router.post('/products/delete/:id', requireAdmin, productController.deleteProduct);

module.exports = router;

