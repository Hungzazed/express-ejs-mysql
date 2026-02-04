require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../db/dynamodbConfig');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      userId: uuidv4(),
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      userId: uuidv4(),
      username: 'staff1',
      password: await bcrypt.hash('staff123', 10),
      role: 'staff',
      createdAt: new Date().toISOString()
    }
  ];

  for (const user of users) {
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: user
    });
    await docClient.send(command);
    console.log(`  ✓ Created user: ${user.username} (${user.role})`);
  }
}

async function seedCategories() {
  console.log('\n📂 Seeding categories...');
  
  const categories = [
    {
      categoryId: uuidv4(),
      name: 'Điện tử',
      description: 'Thiết bị điện tử, công nghệ'
    },
    {
      categoryId: uuidv4(),
      name: 'Thời trang',
      description: 'Quần áo, phụ kiện'
    },
    {
      categoryId: uuidv4(),
      name: 'Gia dụng',
      description: 'Đồ dùng gia đình'
    },
    {
      categoryId: uuidv4(),
      name: 'Sách',
      description: 'Sách, tạp chí'
    }
  ];

  for (const category of categories) {
    const command = new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: category
    });
    await docClient.send(command);
    console.log(`  ✓ Created category: ${category.name}`);
  }

  return categories;
}

async function seedProducts(categories) {
  console.log('\n📦 Seeding products...');
  
  const products = [
    {
      id: uuidv4(),
      name: 'iPhone 15 Pro',
      price: 29990000,
      quantity: 15,
      categoryId: categories.find(c => c.name === 'Điện tử').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'MacBook Air M2',
      price: 32990000,
      quantity: 8,
      categoryId: categories.find(c => c.name === 'Điện tử').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Áo thun nam',
      price: 199000,
      quantity: 50,
      categoryId: categories.find(c => c.name === 'Thời trang').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Quần jean nữ',
      price: 399000,
      quantity: 3,
      categoryId: categories.find(c => c.name === 'Thời trang').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Nồi cơm điện',
      price: 1290000,
      quantity: 0,
      categoryId: categories.find(c => c.name === 'Gia dụng').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Tủ lạnh Inverter',
      price: 8990000,
      quantity: 12,
      categoryId: categories.find(c => c.name === 'Gia dụng').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Lập trình JavaScript',
      price: 159000,
      quantity: 25,
      categoryId: categories.find(c => c.name === 'Sách').categoryId,
      url_image: null,
      isDeleted: false,
      createdAt: new Date().toISOString()
    }
  ];

  for (const product of products) {
    const command = new PutCommand({
      TableName: TABLES.PRODUCTS,
      Item: product
    });
    await docClient.send(command);
    console.log(`  ✓ Created product: ${product.name} (Quantity: ${product.quantity})`);
  }
}

async function seedData() {
  console.log('🌱 Bắt đầu seed data...\n');

  try {
    await seedUsers();
    const categories = await seedCategories();
    await seedProducts(categories);

    console.log('\n✅ Seed data hoàn tất!');
    console.log('\n📝 Thông tin đăng nhập:');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  Staff: username=staff1, password=staff123');
  } catch (error) {
    console.error('\n❌ Lỗi khi seed data:', error);
    throw error;
  }
}

// Run
seedData()
  .then(() => {
    console.log('\n✨ Hoàn thành!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  });
