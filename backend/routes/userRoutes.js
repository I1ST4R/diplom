const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Публичные маршруты (не требуют авторизации)
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);
router.get('/auth/verify', authMiddleware, UserController.verifyToken);

// Защищенные маршруты (требуют авторизации)
router.get('/users/profile', authMiddleware, UserController.getProfile);
router.put('/users/profile', authMiddleware, UserController.updateProfile);

// Маршруты для администраторов
router.get('/users', authMiddleware, roleMiddleware('admin'), UserController.getAllUsers);
router.get('/users/:id', authMiddleware, roleMiddleware('admin'), UserController.getUserById);
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), UserController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), UserController.deleteUser);

module.exports = router;