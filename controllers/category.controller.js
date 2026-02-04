const categoryService = require('../services/category.service');

class CategoryController {
  /**
   * Hiển thị danh sách categories
   */
  async listCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      
      res.render('categories', {
        categories,
        username: req.session.username,
        role: req.session.role,
        error: req.query.error,
        success: req.query.success
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Lỗi khi tải danh mục');
    }
  }

  /**
   * Hiển thị form thêm category
   */
  async showAddForm(req, res) {
    try {
      res.render('category-form', {
        category: null,
        username: req.session.username,
        role: req.session.role,
        error: null
      });
    } catch (error) {
      res.status(500).send('Lỗi server');
    }
  }

  /**
   * Hiển thị form sửa category
   */
  async showEditForm(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      
      res.render('category-form', {
        category,
        username: req.session.username,
        role: req.session.role,
        error: null
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      res.redirect('/categories?error=' + encodeURIComponent(error.message));
    }
  }

  /**
   * Tạo category mới
   */
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.render('category-form', {
          category: null,
          username: req.session.username,
          role: req.session.role,
          error: 'Tên danh mục không được để trống'
        });
      }

      await categoryService.createCategory(name, description);
      res.redirect('/categories?success=' + encodeURIComponent('Thêm danh mục thành công'));
    } catch (error) {
      console.error('Error creating category:', error);
      res.render('category-form', {
        category: null,
        username: req.session.username,
        role: req.session.role,
        error: error.message || 'Lỗi khi tạo danh mục'
      });
    }
  }

  /**
   * Cập nhật category
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name) {
        const category = await categoryService.getCategoryById(id);
        return res.render('category-form', {
          category,
          username: req.session.username,
          role: req.session.role,
          error: 'Tên danh mục không được để trống'
        });
      }

      await categoryService.updateCategory(id, name, description);
      res.redirect('/categories?success=' + encodeURIComponent('Cập nhật danh mục thành công'));
    } catch (error) {
      console.error('Error updating category:', error);
      res.redirect('/categories?error=' + encodeURIComponent(error.message));
    }
  }

  /**
   * Xóa category
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.redirect('/categories?success=' + encodeURIComponent('Xóa danh mục thành công'));
    } catch (error) {
      console.error('Error deleting category:', error);
      res.redirect('/categories?error=' + encodeURIComponent(error.message));
    }
  }
}

module.exports = new CategoryController();
