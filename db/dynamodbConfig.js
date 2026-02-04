require("dotenv").config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Cấu hình AWS DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Document Client cho các thao tác đơn giản hơn
const docClient = DynamoDBDocumentClient.from(client);

// Tên các bảng
const TABLES = {
  USERS: 'Users',
  CATEGORIES: 'Categories',
  PRODUCTS: 'Products',
  PRODUCT_LOGS: 'ProductLogs'
};

module.exports = {
  docClient,
  TABLES
};
