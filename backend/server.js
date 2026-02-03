require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Подключение к MongoDB (mongoose v7+ / v9 не принимает useNewUrlParser/useUnifiedTopology)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/med_schedule';
const USE_IN_MEMORY_DB =
  String(process.env.USE_IN_MEMORY_DB || '').toLowerCase() === 'true';

// Middleware
// Для mobile (Expo) CORS обычно не мешает, но для web-версии удобнее разрешить origin динамически
app.use(cors({
  origin: true,
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Основной маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'API для расписания медицинских работников',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify'
      },
      users: {
        profile: 'GET /api/users/profile',
        allUsers: 'GET /api/users (admin only)',
        userById: 'GET /api/users/:id (admin only)'
      }
    }
  });
});

// API маршруты
app.use('/api', userRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function start() {
  let memoryServer = null;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    if (USE_IN_MEMORY_DB) {
      console.warn('⚠️ MongoDB недоступна, запускаю in-memory MongoDB для разработки...');
      try {
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        console.log('✅ In-memory MongoDB connected');
      } catch (memErr) {
        console.error('❌ In-memory MongoDB error:', memErr);
        process.exit(1);
      }
    } else {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 Регистрация: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`🔐 Вход: POST http://localhost:${PORT}/api/auth/login`);
  });
}

start();