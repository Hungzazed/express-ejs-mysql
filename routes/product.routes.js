const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// Home - list products
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products');
  res.render('products', { products: rows });
});

// Add product
router.post('/add', async (req, res) => {
  const { name, price, quantity } = req.body;
  await db.query(
    'INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)',
    [name, price, quantity]
  );
  res.redirect('/');
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const [[product]] = await db.query(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );
  res.render('edit', { product });
});

// Update product
router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  await db.query(
    'UPDATE products SET name=?, price=?, quantity=? WHERE id=?',
    [name, price, quantity, id]
  );
  res.redirect('/');
});

// Delete product
router.get('/delete/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM products WHERE id = ?', [id]);
  res.redirect('/');
});

module.exports = router;
