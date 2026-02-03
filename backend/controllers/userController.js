const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

class UserController {
  // Регистрация пользователя
  static async register(req, res) {
    try {
      const { username, password, name, email, phone } = req.body;

      // Валидация
      if (!username || !password || !name) {
        return res.status(400).json({ 
          error: 'Обязательные поля: username, password, name' 
        });
      }

      // Проверяем существование пользователя
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Пользователь с таким логином уже существует' 
        });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаём пользователя
      const user = new User({
        username,
        password: hashedPassword,
        // Роль при регистрации не принимаем с клиента (чтобы не было эскалации прав)
        role: 'doctor',
        name,
        email,
        phone
      });

      await user.save();

      // Генерируем токен
      const token = jwt.sign(
        { 
          id: user._id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Убираем пароль из ответа
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Ошибка при регистрации',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Вход пользователя
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Введите логин и пароль' 
        });
      }

      // Ищем пользователя
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ 
          error: 'Неверный логин или пароль' 
        });
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Неверный логин или пароль' 
        });
      }

      // Генерируем токен
      const token = jwt.sign(
        { 
          id: user._id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Убираем пароль из ответа
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        message: 'Вход выполнен успешно',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Ошибка при входе',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Получить всех пользователей
  static async getAllUsers(req, res) {
    try {
      const users = await User.find({}, '-password');
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Ошибка при получении пользователей' });
    }
  }

  // Получить пользователя по ID
  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id, '-password');
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Ошибка при получении пользователя' });
    }
  }

  // Обновить пользователя
  static async updateUser(req, res) {
    try {
      const { name, role, email, phone } = req.body;
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({ error: 'Не указан id пользователя' });
      }

      // Проверяем права: только админ или сам пользователь
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Недостаточно прав для редактирования этого пользователя' 
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      
      // Роль может менять только админ
      if (role && req.user.role === 'admin') {
        updateData.role = role;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json({ 
        message: 'Данные пользователя обновлены',
        user 
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
    }
  }

  // Обновить профиль текущего пользователя
  static async updateProfile(req, res) {
    try {
      const { name, email, phone } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Пользователь не авторизован' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json({
        message: 'Профиль обновлен',
        user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении профиля' });
    }
  }

  // Удалить пользователя
  static async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      // Проверяем права: только админ или сам пользователь
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Недостаточно прав для удаления этого пользователя' 
        });
      }

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json({ 
        message: 'Пользователь успешно удален'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Ошибка при удалении пользователя' });
    }
  }

  // Проверить токен
  static async verifyToken(req, res) {
    try {
      const user = await User.findById(req.user.id, '-password');
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      res.json({ 
        valid: true, 
        user 
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(401).json({ 
        valid: false, 
        error: 'Неверный токен' 
      });
    }
  }

  // Получить профиль текущего пользователя
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id, '-password');
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Ошибка при получении профиля' });
    }
  }
}

module.exports = UserController;