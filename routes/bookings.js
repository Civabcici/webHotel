const express = require('express');
const BookingController = require('../controllers/BookingController');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const router = express.Router();

// Список бронирований
router.get('/', isAuthenticated, BookingController.list);

// Форма добавления бронирования
router.get('/add', isAuthenticated, hasRole('Администратор'), BookingController.showAddForm);

// Добавление бронирования
router.post('/add', isAuthenticated, hasRole('Администратор'), BookingController.add);

// Форма редактирования бронирования
router.get('/edit/:id', isAuthenticated, hasRole('Администратор'), BookingController.showEditForm);

// Обновление бронирования
router.post('/edit/:id', isAuthenticated, hasRole('Администратор'), BookingController.update);

// Удаление бронирования
router.post('/delete/:id', isAuthenticated, hasRole('Администратор'), BookingController.delete);

module.exports = router;