const { v4: uuidv4 } = require('uuid');
const categoryRepository = require('../repositories/category.repository');
const productRepository = require('../repositories/product.repository');

class CategoryService {
  /**
   * Tạo category mới
   */
  async createCategory(name, description) {
    const newCategory = {
      categoryId: uuidv4(),
      name,
      description: description || ''
    };
    return await categoryRepository.create(newCategory);
  }

  /**
   * Lấy tất cả categories
   */
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  /**
   * Lấy category theo ID
   */
  async getCategoryById(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category không tồn tại');
    }
    return category;
  }

  /**
   * Cập nhật category
   */
  async updateCategory(categoryId, name, description) {
    // Kiểm tra category tồn tại
    await this.getCategoryById(categoryId);
    
    return await categoryRepository.update(categoryId, name, description);
  }

  /**
   * Xóa category
   * Business rule: Không xóa products khi xóa category
   */
  async deleteCategory(categoryId) {
    // Kiểm tra category tồn tại
    await this.getCategoryById(categoryId);

    // Kiểm tra có products nào thuộc category này không
    const products = await productRepository.findByCategoryId(categoryId);
    if (products.length > 0) {
      throw new Error(`Không thể xóa category này vì có ${products.length} sản phẩm đang sử dụng. Vui lòng chuyển các sản phẩm sang category khác trước.`);
    }

    return await categoryRepository.delete(categoryId);
  }

  /**
   * Tìm kiếm category theo tên
   */
  async searchCategories(name) {
    return await categoryRepository.findByName(name);
  }
}

module.exports = new CategoryService();
