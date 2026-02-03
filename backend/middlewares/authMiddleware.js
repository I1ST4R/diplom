const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

const authMiddleware = (req, res, next) => {
  // Получаем токен из заголовка
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Доступ запрещен. Требуется токен авторизации.' 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Доступ запрещен. Требуется токен авторизации.' 
    });
  }

  try {
    // Верифицируем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Добавляем данные пользователя в запрос
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Токен истек. Пожалуйста, войдите заново.' 
      });
    }
    
    res.status(401).json({ 
      error: 'Неверный токен авторизации.' 
    });
  }
};

// Мидлварь для проверки ролей
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Пользователь не авторизован' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав для выполнения этого действия' 
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };