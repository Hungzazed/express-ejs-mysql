const { docClient, TABLES } = require('../db/dynamodbConfig');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

class CategoryRepository {
  /**
   * Tạo category mới
   */
  async create(category) {
    const command = new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: category
    });
    await docClient.send(command);
    return category;
  }

  /**
   * Lấy category theo ID
   */
  async findById(categoryId) {
    const command = new GetCommand({
      TableName: TABLES.CATEGORIES,
      Key: { categoryId }
    });
    const response = await docClient.send(command);
    return response.Item;
  }

  /**
   * Lấy tất cả categories
   */
  async findAll() {
    const command = new ScanCommand({
      TableName: TABLES.CATEGORIES
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }

  /**
   * Cập nhật category
   */
  async update(categoryId, name, description) {
    const command = new UpdateCommand({
      TableName: TABLES.CATEGORIES,
      Key: { categoryId },
      UpdateExpression: 'SET #name = :name, description = :description',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':description': description
      },
      ReturnValues: 'ALL_NEW'
    });
    const response = await docClient.send(command);
    return response.Attributes;
  }

  /**
   * Xóa category
   */
  async delete(categoryId) {
    const command = new DeleteCommand({
      TableName: TABLES.CATEGORIES,
      Key: { categoryId }
    });
    await docClient.send(command);
    return true;
  }

  /**
   * Tìm category theo tên
   */
  async findByName(name) {
    const command = new ScanCommand({
      TableName: TABLES.CATEGORIES,
      FilterExpression: 'contains(#name, :name)',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name
      }
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }
}

module.exports = new CategoryRepository();
