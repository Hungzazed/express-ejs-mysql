const { docClient, TABLES } = require('../db/dynamodbConfig');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

class ProductRepository {
  /**
   * Tạo product mới
   */
  async create(product) {
    const command = new PutCommand({
      TableName: TABLES.PRODUCTS,
      Item: product
    });
    await docClient.send(command);
    return product;
  }

  /**
   * Lấy product theo ID
   */
  async findById(id) {
    const command = new GetCommand({
      TableName: TABLES.PRODUCTS,
      Key: { id }
    });
    const response = await docClient.send(command);
    return response.Item;
  }

  /**
   * Lấy tất cả products (không bao gồm soft deleted)
   */
  async findAll() {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCTS,
      FilterExpression: 'isDeleted = :isDeleted',
      ExpressionAttributeValues: {
        ':isDeleted': false
      }
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }

  /**
   * Tìm kiếm và lọc products
   */
  async search(filters = {}) {
    const { name, categoryId, minPrice, maxPrice, includeDeleted = false } = filters;
    
    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    // Lọc soft delete
    if (!includeDeleted) {
      filterExpressions.push('isDeleted = :isDeleted');
      expressionAttributeValues[':isDeleted'] = false;
    }

    // Tìm kiếm theo tên
    if (name) {
      filterExpressions.push('contains(#name, :name)');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = name;
    }

    // Lọc theo category
    if (categoryId) {
      filterExpressions.push('categoryId = :categoryId');
      expressionAttributeValues[':categoryId'] = categoryId;
    }

    // Lọc theo khoảng giá
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      filterExpressions.push('#price >= :minPrice');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':minPrice'] = parseFloat(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      filterExpressions.push('#price <= :maxPrice');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':maxPrice'] = parseFloat(maxPrice);
    }

    const command = new ScanCommand({
      TableName: TABLES.PRODUCTS,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined
    });

    const response = await docClient.send(command);
    return response.Items || [];
  }

  /**
   * Cập nhật product
   */
  async update(id, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#field${index}`;
      const valuePlaceholder = `:value${index}`;
      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key];
    });

    const command = new UpdateCommand({
      TableName: TABLES.PRODUCTS,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const response = await docClient.send(command);
    return response.Attributes;
  }

  /**
   * Soft delete product
   */
  async softDelete(id) {
    const command = new UpdateCommand({
      TableName: TABLES.PRODUCTS,
      Key: { id },
      UpdateExpression: 'SET isDeleted = :isDeleted',
      ExpressionAttributeValues: {
        ':isDeleted': true
      },
      ReturnValues: 'ALL_NEW'
    });
    const response = await docClient.send(command);
    return response.Attributes;
  }

  /**
   * Lấy products theo categoryId
   */
  async findByCategoryId(categoryId) {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCTS,
      FilterExpression: 'categoryId = :categoryId AND isDeleted = :isDeleted',
      ExpressionAttributeValues: {
        ':categoryId': categoryId,
        ':isDeleted': false
      }
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }
}

module.exports = new ProductRepository();
