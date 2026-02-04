require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { 
  CreateTableCommand, 
  ListTablesCommand,
  DeleteTableCommand,
  waitUntilTableExists
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const tables = [
  {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'Categories',
    KeySchema: [
      { AttributeName: 'categoryId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'categoryId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'Products',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'ProductLogs',
    KeySchema: [
      { AttributeName: 'logId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'logId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function listTables() {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    return response.TableNames || [];
  } catch (error) {
    console.error('Error listing tables:', error);
    return [];
  }
}

async function deleteTable(tableName) {
  try {
    const command = new DeleteTableCommand({ TableName: tableName });
    await client.send(command);
    console.log(`✓ Đã xóa table: ${tableName}`);
    // Wait a bit for table to be deleted
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`- Table ${tableName} không tồn tại`);
    } else {
      console.error(`Error deleting table ${tableName}:`, error.message);
    }
  }
}

async function createTable(tableConfig) {
  try {
    const command = new CreateTableCommand(tableConfig);
    await client.send(command);
    console.log(`✓ Đang tạo table: ${tableConfig.TableName}`);
    
    // Wait for table to be created
    await waitUntilTableExists(
      { client, maxWaitTime: 60 },
      { TableName: tableConfig.TableName }
    );
    console.log(`✓ Table ${tableConfig.TableName} đã sẵn sàng`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`- Table ${tableConfig.TableName} đã tồn tại`);
    } else {
      console.error(`Error creating table ${tableConfig.TableName}:`, error.message);
      throw error;
    }
  }
}

async function setupTables(recreate = false) {
  console.log('🚀 Bắt đầu setup DynamoDB tables...\n');

  if (recreate) {
    console.log('⚠️  Mode: RECREATE - Xóa và tạo lại tất cả tables\n');
    const existingTables = await listTables();
    
    for (const tableConfig of tables) {
      if (existingTables.includes(tableConfig.TableName)) {
        await deleteTable(tableConfig.TableName);
      }
    }
  }

  console.log('\n📦 Tạo tables...\n');
  for (const tableConfig of tables) {
    await createTable(tableConfig);
  }

  console.log('\n✅ Setup hoàn tất!');
  console.log('\nCác tables đã được tạo:');
  tables.forEach(t => console.log(`  - ${t.TableName}`));
}

// Run
const recreate = process.argv.includes('--recreate');
setupTables(recreate)
  .then(() => {
    console.log('\n✨ Hoàn thành!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  });
