require('dotenv').config();
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

console.log('🔍 Kiểm tra kết nối AWS...\n');

// Test DynamoDB
async function testDynamoDB() {
  console.log('📊 Testing DynamoDB connection...');
  try {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const command = new ListTablesCommand({});
    const response = await client.send(command);
    
    console.log('  ✅ DynamoDB: Kết nối thành công!');
    console.log(`  📋 Số tables: ${response.TableNames.length}`);
    if (response.TableNames.length > 0) {
      console.log('  📄 Tables:');
      response.TableNames.forEach(name => console.log(`    - ${name}`));
    }
    return true;
  } catch (error) {
    console.log('  ❌ DynamoDB: Lỗi kết nối');
    console.log(`  💡 Error: ${error.message}`);
    return false;
  }
}

// Test S3
async function testS3() {
  console.log('\n📦 Testing S3 connection...');
  try {
    const client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    
    console.log('  ✅ S3: Kết nối thành công!');
    console.log(`  📋 Số buckets: ${response.Buckets.length}`);
    
    const targetBucket = process.env.S3_BUCKET_NAME;
    const bucketExists = response.Buckets.some(b => b.Name === targetBucket);
    
    if (targetBucket) {
      if (bucketExists) {
        console.log(`  ✅ Bucket "${targetBucket}" tồn tại`);
      } else {
        console.log(`  ⚠️  Bucket "${targetBucket}" KHÔNG tồn tại!`);
        console.log('  💡 Vui lòng tạo bucket này hoặc cập nhật .env');
      }
    }
    return true;
  } catch (error) {
    console.log('  ❌ S3: Lỗi kết nối');
    console.log(`  💡 Error: ${error.message}`);
    return false;
  }
}

// Check environment variables
function checkEnvVars() {
  console.log('⚙️  Checking environment variables...\n');
  
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME'
  ];

  let allPresent = true;
  required.forEach(key => {
    const value = process.env[key];
    if (value) {
      console.log(`  ✅ ${key}: ${key.includes('SECRET') ? '***' : value}`);
    } else {
      console.log(`  ❌ ${key}: MISSING`);
      allPresent = false;
    }
  });

  if (!allPresent) {
    console.log('\n  ⚠️  Thiếu một số biến môi trường!');
    console.log('  💡 Vui lòng kiểm tra file .env\n');
  } else {
    console.log('  ✅ Tất cả biến môi trường đã được cấu hình\n');
  }

  return allPresent;
}

// Run tests
async function runTests() {
  const envOk = checkEnvVars();
  
  if (!envOk) {
    console.log('❌ Vui lòng cấu hình đầy đủ .env trước khi tiếp tục\n');
    process.exit(1);
  }

  const dynamoOk = await testDynamoDB();
  const s3Ok = await testS3();

  console.log('\n' + '='.repeat(50));
  if (dynamoOk && s3Ok) {
    console.log('✅ TẤT CẢ KIỂM TRA THÀNH CÔNG!');
    console.log('🚀 Bạn có thể chạy: npm run init');
  } else {
    console.log('❌ MỘT SỐ KIỂM TRA THẤT BẠI');
    console.log('💡 Vui lòng kiểm tra lại cấu hình AWS');
  }
  console.log('='.repeat(50) + '\n');
}

runTests().catch(error => {
  console.error('\n❌ Lỗi:', error);
  process.exit(1);
});
