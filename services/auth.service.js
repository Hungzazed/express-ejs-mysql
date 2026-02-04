const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/user.repository');

class AuthService {
  /**
   * Đăng ký user mới
   */
  async register(username, password, role = 'staff') {
    // Kiểm tra user đã tồn tại
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      userId: uuidv4(),
      username,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };

    return await userRepository.create(newUser);
  }

  /**
   * Đăng nhập
   */
  async login(username, password) {
    // Tìm user
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Trả về user (không bao gồm password)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Lấy tất cả users
   */
  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

module.exports = new AuthService();
