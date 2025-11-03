const express = require('express');
const StayController = require('../controllers/StayController');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const router = express.Router();

// Список проживаний
router.get('/', isAuthenticated, StayController.list);

// Форма добавления проживания
router.get('/add', isAuthenticated, hasRole('Администратор'), StayController.showAddForm);

// Добавление проживания
router.post('/add', isAuthenticated, hasRole('Администратор'), StayController.add);

// Форма редактирования проживания
router.get('/edit/:id', isAuthenticated, hasRole('Администратор'), StayController.showEditForm);

// Обновление проживания
router.post('/edit/:id', isAuthenticated, hasRole('Администратор'), StayController.update);

// Удаление проживания
router.post('/delete/:id', isAuthenticated, hasRole('Администратор'), StayController.delete);

module.exports = router;