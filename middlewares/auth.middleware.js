/**
 * Middleware kiểm tra đăng nhập
 */
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

/**
 * Middleware kiểm tra quyền admin
 */
function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  if (req.session.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Bạn không có quyền truy cập chức năng này',
      error: { status: 403 }
    });
  }
  
  next();
}

/**
 * Middleware kiểm tra quyền staff hoặc admin
 */
function requireStaffOrAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  if (req.session.role !== 'admin' && req.session.role !== 'staff') {
    return res.status(403).render('error', {
      message: 'Bạn không có quyền truy cập',
      error: { status: 403 }
    });
  }
  
  next();
}

/**
 * Middleware redirect nếu đã đăng nhập
 */
function redirectIfAuthenticated(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/products');
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireStaffOrAdmin,
  redirectIfAuthenticated
};
