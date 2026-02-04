const { docClient, TABLES } = require('../db/dynamodbConfig');
const { PutCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

class ProductLogRepository {
  /**
   * Tạo log mới
   */
  async create(log) {
    const command = new PutCommand({
      TableName: TABLES.PRODUCT_LOGS,
      Item: log
    });
    await docClient.send(command);
    return log;
  }

  /**
   * Lấy tất cả logs
   */
  async findAll() {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCT_LOGS
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }

  /**
   * Lấy logs theo productId
   */
  async findByProductId(productId) {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCT_LOGS,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    });
    const response = await docClient.send(command);
    // Sắp xếp theo thời gian mới nhất
    return (response.Items || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  /**
   * Lấy logs theo userId
   */
  async findByUserId(userId) {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCT_LOGS,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });
    const response = await docClient.send(command);
    return (response.Items || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  /**
   * Lấy logs theo action
   */
  async findByAction(action) {
    const command = new ScanCommand({
      TableName: TABLES.PRODUCT_LOGS,
      FilterExpression: '#action = :action',
      ExpressionAttributeNames: {
        '#action': 'action'
      },
      ExpressionAttributeValues: {
        ':action': action
      }
    });
    const response = await docClient.send(command);
    return (response.Items || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  }
}

module.exports = new ProductLogRepository();
