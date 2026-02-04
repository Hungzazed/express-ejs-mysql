const productService = require('../services/product.service');
const categoryService = require('../services/category.service');
const s3 = require('../db/s3');

class ProductController {
  /**
   * Hiển thị danh sách products với tìm kiếm và lọc
   */
  async listProducts(req, res) {
    try {
      const { search, categoryId, minPrice, maxPrice, page = 1 } = req.query;
      
      const filters = {};
      if (search) filters.name = search;
      if (categoryId) filters.categoryId = categoryId;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;

      const limit = 12; // Số sản phẩm mỗi trang
      const result = await productService.getPaginatedProducts(filters, parseInt(page), limit);
      const categories = await categoryService.getAllCategories();

      res.render('products', {
        products: result.products,
        categories,
        username: req.session.username,
        role: req.session.role,
        filters: { search, categoryId, minPrice, maxPrice },
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        },
        error: req.query.error,
        success: req.query.success
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Lỗi khi tải sản phẩm');
    }
  }

  /**
   * Hiển thị form thêm product
   */
  async showAddForm(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      
      res.render('product-form', {
        product: null,
        categories,
        username: req.session.username,
        role: req.session.role,
        error: null
      });
    } catch (error) {
      res.status(500).send('Lỗi server');
    }
  }

  /**
   * Hiển thị form sửa product
   */
  async showEditForm(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      const categories = await categoryService.getAllCategories();
      
      res.render('product-form', {
        product,
        categories,
        username: req.session.username,
        role: req.session.role,
        error: null
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.redirect('/products?error=' + encodeURIComponent(error.message));
    }
  }

  /**
   * Tạo product mới
   */
  async createProduct(req, res) {
    try {
      const { name, price, quantity, categoryId } = req.body;
      const categories = await categoryService.getAllCategories();

      if (!name || !price || !quantity) {
        return res.render('product-form', {
          product: null,
          categories,
          username: req.session.username,
          role: req.session.role,
          error: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      let imageUrl = null;
      if (req.file) {
        imageUrl = await s3.uploadImage(req.file);
      }

      const productData = {
        name,
        price,
        quantity,
        categoryId: categoryId || null,
        url_image: imageUrl
      };

      await productService.createProduct(productData, req.session.userId);
      res.redirect('/products?success=' + encodeURIComponent('Thêm sản phẩm thành công'));
    } catch (error) {
      console.error('Error creating product:', error);
      const categories = await categoryService.getAllCategories();
      res.render('product-form', {
        product: null,
        categories,
        username: req.session.username,
        role: req.session.role,
        error: error.message || 'Lỗi khi tạo sản phẩm'
      });
    }
  }

  /**
   * Cập nhật product
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, price, quantity, categoryId } = req.body;

      if (!name || !price || !quantity) {
        const product = await productService.getProductById(id);
        const categories = await categoryService.getAllCategories();
        return res.render('product-form', {
          product,
          categories,
          username: req.session.username,
          role: req.session.role,
          error: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      const updates = { name, price, quantity, categoryId: categoryId || null };

      // Upload ảnh mới nếu có
      if (req.file) {
        updates.url_image = await s3.uploadImage(req.file);
      }

      await productService.updateProduct(id, updates, req.session.userId);
      res.redirect('/products?success=' + encodeURIComponent('Cập nhật sản phẩm thành công'));
    } catch (error) {
      console.error('Error updating product:', error);
      res.redirect('/products?error=' + encodeURIComponent(error.message));
    }
  }

  /**
   * Xóa product (soft delete)
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id, req.session.userId);
      res.redirect('/products?success=' + encodeURIComponent('Xóa sản phẩm thành công'));
    } catch (error) {
      console.error('Error deleting product:', error);
      res.redirect('/products?error=' + encodeURIComponent(error.message));
    }
  }

  /**
   * Hiển thị chi tiết product và logs
   */
  async showProductDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      const logs = await productService.getProductLogs(id);
      const category = product.categoryId 
        ? await categoryService.getCategoryById(product.categoryId)
        : null;

      res.render('product-detail', {
        product,
        category,
        logs,
        username: req.session.username,
        role: req.session.role
      });
    } catch (error) {
      console.error('Error fetching product detail:', error);
      res.redirect('/products?error=' + encodeURIComponent(error.message));
    }
  }
}

module.exports = new ProductController();
