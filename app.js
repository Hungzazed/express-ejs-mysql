require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'my-secret-key-12345',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true
  }
}));

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');

app.use('/auth', authRoutes);
app.use('/', productRoutes);
app.use('/', categoryRoutes);

// Root redirect
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/products');
  } else {
    res.redirect('/auth/login');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Trang không tồn tại',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Đã xảy ra lỗi',
    error: { status: err.status || 500 }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Đăng nhập tại http://localhost:${PORT}/auth/login`);
});
