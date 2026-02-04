const { v4: uuidv4 } = require('uuid');
const productRepository = require('../repositories/product.repository');
const categoryRepository = require('../repositories/category.repository');
const productLogRepository = require('../repositories/productLog.repository');

class ProductService {
  /**
   * Tạo product mới
   */
  async createProduct(productData, userId) {
    // Kiểm tra category tồn tại
    if (productData.categoryId) {
      const category = await categoryRepository.findById(productData.categoryId);
      if (!category) {
        throw new Error('Category không tồn tại');
      }
    }

    const newProduct = {
      id: uuidv4(),
      name: productData.name,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      categoryId: productData.categoryId || null,
      url_image: productData.url_image || null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    };

    const product = await productRepository.create(newProduct);

    // Ghi log
    await this._logProductAction(product.id, 'CREATE', userId);

    return product;
  }

  /**
   * Lấy tất cả products (không bao gồm soft deleted)
   */
  async getAllProducts(filters = {}) {
    const products = await productRepository.search(filters);
    
    // Thêm inventory status cho mỗi product
    return products.map(product => ({
      ...product,
      inventoryStatus: this._getInventoryStatus(product.quantity)
    }));
  }

  /**
   * Lấy product theo ID
   */
  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    // Không hiển thị product đã soft delete
    if (product.isDeleted) {
      throw new Error('Sản phẩm không tồn tại');
    }

    return {
      ...product,
      inventoryStatus: this._getInventoryStatus(product.quantity)
    };
  }

  /**
   * Cập nhật product
   */
  async updateProduct(id, updates, userId) {
    // Kiểm tra product tồn tại
    const existingProduct = await this.getProductById(id);

    // Kiểm tra category nếu có update
    if (updates.categoryId) {
      const category = await categoryRepository.findById(updates.categoryId);
      if (!category) {
        throw new Error('Category không tồn tại');
      }
    }

    // Chuẩn hóa dữ liệu
    const updatedData = {};
    if (updates.name) updatedData.name = updates.name;
    if (updates.price) updatedData.price = parseFloat(updates.price);
    if (updates.quantity !== undefined) updatedData.quantity = parseInt(updates.quantity);
    if (updates.categoryId !== undefined) updatedData.categoryId = updates.categoryId;
    if (updates.url_image !== undefined) updatedData.url_image = updates.url_image;

    const product = await productRepository.update(id, updatedData);

    // Ghi log
    await this._logProductAction(id, 'UPDATE', userId);

    return {
      ...product,
      inventoryStatus: this._getInventoryStatus(product.quantity)
    };
  }

  /**
   * Xóa product (soft delete)
   */
  async deleteProduct(id, userId) {
    // Kiểm tra product tồn tại
    await this.getProductById(id);

    const product = await productRepository.softDelete(id);

    // Ghi log
    await this._logProductAction(id, 'DELETE', userId);

    return product;
  }

  /**
   * Tìm kiếm và lọc products
   */
  async searchProducts(filters) {
    const products = await productRepository.search(filters);
    
    return products.map(product => ({
      ...product,
      inventoryStatus: this._getInventoryStatus(product.quantity)
    }));
  }

  /**
   * Lấy products theo category
   */
  async getProductsByCategory(categoryId) {
    const products = await productRepository.findByCategoryId(categoryId);
    
    return products.map(product => ({
      ...product,
      inventoryStatus: this._getInventoryStatus(product.quantity)
    }));
  }

  /**
   * Lấy product logs theo productId
   */
  async getProductLogs(productId) {
    return await productLogRepository.findByProductId(productId);
  }

  /**
   * Phân trang products
   */
  async getPaginatedProducts(filters = {}, page = 1, limit = 10) {
    const allProducts = await this.getAllProducts(filters);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      currentPage: page,
      totalPages: Math.ceil(allProducts.length / limit),
      totalItems: allProducts.length,
      hasNext: endIndex < allProducts.length,
      hasPrev: page > 1
    };
  }

  /**
   * Ghi log product action
   */
  async _logProductAction(productId, action, userId) {
    const log = {
      logId: uuidv4(),
      productId,
      action,
      userId,
      time: new Date().toISOString()
    };
    await productLogRepository.create(log);
  }

  /**
   * Xác định inventory status
   */
  _getInventoryStatus(quantity) {
    if (quantity <= 0) {
      return 'out_of_stock'; // Hết hàng
    } else if (quantity < 5) {
      return 'low_stock'; // Sắp hết
    } else {
      return 'in_stock'; // Còn hàng
    }
  }
}

module.exports = new ProductService();
