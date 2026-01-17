const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/', requireLogin, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products');
  res.render('products', { products: rows, username: req.session.username });
});

router.post('/add', requireLogin, async (req, res) => {
  const { name, price, quantity } = req.body;
  await db.query(
    'INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)',
    [name, price, quantity]
  );
  res.redirect('/');
});

router.get('/edit/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const [[product]] = await db.query(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );
  res.render('edit', { product });
});

router.post('/edit/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  await db.query(
    'UPDATE products SET name=?, price=?, quantity=? WHERE id=?',
    [name, price, quantity, id]
  );
  res.redirect('/');
});

router.get('/delete/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM products WHERE id = ?', [id]);
  res.redirect('/');
});

module.exports = router;
