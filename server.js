const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Временные данные для тестирования (замените на реальную БД позже)
const users = [
  {
    id: 1,
    login: 'admin',
    password: '$2a$10$8K1p/a0dRTlR0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', // admin123
    role: 'Администратор'
  }
];

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hotel-management-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    },
  })
);

// Главная страница
app.get('/', (req, res) => {
  res.render('index', { 
    user: req.session.user,
    stats: { clientsCount: 0, bookingsCount: 0, staysCount: 0 }
  });
});

// Страница входа
app.get('/auth/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

// Обработка входа
app.post('/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    // Временная проверка (замените на проверку из БД)
    if (login === 'admin' && password === 'admin123') {
      req.session.user = {
        id: 1,
        login: 'admin',
        role: 'Администратор'
      };
      return res.redirect('/');
    } else {
      res.render('login', { error: 'Неверный логин или пароль' });
    }
  } catch (error) {
    res.render('login', { error: 'Ошибка сервера' });
  }
});

// Страница регистрации
app.get('/auth/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('register', { error: null });
});

// Обработка регистрации
app.post('/auth/register', async (req, res) => {
  try {
    const { login, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('register', { error: 'Пароли не совпадают' });
    }

    // Временная логика (замените на сохранение в БД)
    if (login && password) {
      // Пока просто редиректим на страницу входа
      return res.redirect('/auth/login');
    } else {
      res.render('register', { error: 'Заполните все поля' });
    }
  } catch (error) {
    res.render('register', { error: 'Ошибка регистрации' });
  }
});

// Выход
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе:', err);
    }
    res.redirect('/');
  });
});

// Защищенные маршруты
app.get('/clients', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('clients/index', { 
    clients: [],
    user: req.session.user 
  });
});

app.get('/bookings', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('bookings/index', { 
    bookings: [],
    user: req.session.user 
  });
});

app.get('/stays', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('stays/index', { 
    stays: [],
    user: req.session.user 
  });
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('profile', { 
    user: { 
      id: req.session.user.id,
      login: req.session.user.login,
      Role: { name: req.session.user.role }
    },
    currentUser: req.session.user,
    error: null,
    success: null
  });
});

// Формы добавления (только для администраторов)
app.get('/clients/add', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'Администратор') {
    return res.status(403).send('Доступ запрещен');
  }
  res.render('clients/add', { 
    user: req.session.user 
  });
});

app.get('/bookings/add', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'Администратор') {
    return res.status(403).send('Доступ запрещен');
  }
  res.render('bookings/add', { 
    clients: [],
    rooms: [],
    user: req.session.user 
  });
});

app.get('/stays/add', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'Администратор') {
    return res.status(403).send('Доступ запрещен');
  }
  res.render('stays/add', { 
    clients: [],
    rooms: [],
    bookings: [],
    user: req.session.user 
  });
});

// Обработчик 404
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📁 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👤 Для входа используйте: login: admin, password: admin123`);
  console.log(`⚠️  Временная версия - данные хранятся в памяти`);
});