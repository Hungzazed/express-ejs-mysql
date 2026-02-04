const { docClient, TABLES } = require('../db/dynamodbConfig');
const { PutCommand, GetCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

class UserRepository {
  /**
   * Tạo user mới
   */
  async create(user) {
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: user
    });
    await docClient.send(command);
    return user;
  }

  /**
   * Lấy user theo userId
   */
  async findById(userId) {
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId }
    });
    const response = await docClient.send(command);
    return response.Item;
  }

  /**
   * Lấy user theo username
   */
  async findByUsername(username) {
    const command = new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    });
    const response = await docClient.send(command);
    return response.Items && response.Items.length > 0 ? response.Items[0] : null;
  }

  /**
   * Lấy tất cả users
   */
  async findAll() {
    const command = new ScanCommand({
      TableName: TABLES.USERS
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }

  /**
   * Lấy users theo role
   */
  async findByRole(role) {
    const command = new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: '#role = :role',
      ExpressionAttributeNames: {
        '#role': 'role'
      },
      ExpressionAttributeValues: {
        ':role': role
      }
    });
    const response = await docClient.send(command);
    return response.Items || [];
  }
}

module.exports = new UserRepository();
