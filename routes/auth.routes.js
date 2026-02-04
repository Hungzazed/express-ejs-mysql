const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { redirectIfAuthenticated, requireAdmin } = require('../middlewares/auth.middleware');

// Trang đăng nhập
router.get('/login', redirectIfAuthenticated, authController.showLoginPage);
router.post('/login', redirectIfAuthenticated, authController.login);

// Trang đăng ký (chỉ admin)
router.get('/register', requireAdmin, authController.showRegisterPage);
router.post('/register', requireAdmin, authController.register);

// Đăng xuất
router.get('/logout', authController.logout);

module.exports = router;

