const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();

// Страница регистрации
router.get('/register', AuthController.showRegisterForm);

// Обработка регистрации
router.post('/register', AuthController.register);

// Страница входа
router.get('/login', AuthController.showLoginForm);

// Обработка входа
router.post('/login', AuthController.login);

// Выход
router.get('/logout', AuthController.logout);

module.exports = router;