const authService = require('../services/auth.service');

class AuthController {
  /**
   * Hiển thị trang đăng nhập
   */
  async showLoginPage(req, res) {
    try {
      res.render('login', { error: null });
    } catch (error) {
      res.status(500).send('Lỗi server');
    }
  }

  /**
   * Xử lý đăng nhập
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.render('login', { error: 'Vui lòng nhập đầy đủ thông tin' });
      }

      const user = await authService.login(username, password);

      // Lưu thông tin vào session
      req.session.userId = user.userId;
      req.session.username = user.username;
      req.session.role = user.role;

      res.redirect('/products');
    } catch (error) {
      console.error('Login error:', error);
      res.render('login', { error: error.message || 'Đăng nhập thất bại' });
    }
  }

  /**
   * Hiển thị trang đăng ký (chỉ admin)
   */
  async showRegisterPage(req, res) {
    try {
      res.render('register', { error: null });
    } catch (error) {
      res.status(500).send('Lỗi server');
    }
  }

  /**
   * Xử lý đăng ký user mới
   */
  async register(req, res) {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.render('register', { error: 'Vui lòng nhập đầy đủ thông tin' });
      }

      await authService.register(username, password, role || 'staff');

      res.redirect('/auth/login');
    } catch (error) {
      console.error('Register error:', error);
      res.render('register', { error: error.message || 'Đăng ký thất bại' });
    }
  }

  /**
   * Đăng xuất
   */
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/auth/login');
    });
  }
}

module.exports = new AuthController();
