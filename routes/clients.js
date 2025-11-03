const express = require('express');
const ClientController = require('../controllers/ClientController');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const router = express.Router();

// Список клиентов
router.get('/', isAuthenticated, ClientController.list);

// Форма добавления клиента
router.get('/add', isAuthenticated, hasRole('Администратор'), ClientController.showAddForm);

// Добавление клиента
router.post('/add', isAuthenticated, hasRole('Администратор'), ClientController.add);

// Форма редактирования клиента
router.get('/edit/:passport', isAuthenticated, hasRole('Администратор'), ClientController.showEditForm);

// Обновление клиента
router.post('/edit/:passport', isAuthenticated, hasRole('Администратор'), ClientController.update);

// Удаление клиента
router.post('/delete/:passport', isAuthenticated, hasRole('Администратор'), ClientController.delete);

module.exports = router;