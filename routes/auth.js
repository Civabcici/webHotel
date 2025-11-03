const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Role, syncDatabase } = require('../models');
const router = express.Router();

// Страница регистрации
router.get('/register', async (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  try {
    const roles = await Role.findAll();
    res.render('register', { 
      roles, 
      error: null 
    });
  } catch (error) {
    res.status(500).render('register', { 
      error: 'Ошибка сервера',
      roles: [] 
    });
  }
});

// Обработка регистрации
router.post('/register', async (req, res) => {
  try {
    const { login, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      const roles = await Role.findAll();
      return res.render('register', { 
        roles, 
        error: 'Пароли не совпадают' 
      });
    }

    // Ищем роль "Пользователь" по умолчанию
    const userRole = await Role.findOne({ where: { name: 'Пользователь' } });
    if (!userRole) {
      const roles = await Role.findAll();
      return res.render('register', { 
        roles, 
        error: 'Роль пользователя не найдена' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      login,
      password: hashedPassword,
      roleId: userRole.id,
    });

    res.redirect('/auth/login');
  } catch (error) {
    const roles = await Role.findAll();
    res.render('register', { 
      roles, 
      error: 'Ошибка регистрации: ' + error.message 
    });
  }
});

// Страница входа
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

// Обработка входа
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({
      where: { login },
      include: Role,
    });

    if (user && await user.validatePassword(password)) {
      req.session.user = {
        id: user.id,
        login: user.login,
        role: user.Role.name,
      };
      res.redirect('/');
    } else {
      res.render('login', { error: 'Неверный логин или пароль' });
    }
  } catch (error) {
    res.render('login', { error: 'Ошибка сервера' });
  }
});

// Выход
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;