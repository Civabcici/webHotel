// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');

// Импорт контроллеров
const HomeController = require('./controllers/HomeController');
const AuthController = require('./controllers/AuthController');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const bookingRoutes = require('./routes/bookings');
const stayRoutes = require('./routes/stays');

// Импорт моделей для синхронизации БД
const { syncDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Главные маршруты
app.get('/', HomeController.showHomePage);
app.get('/profile', HomeController.showProfile);

// Формы добавления (только для администраторов)
app.get('/clients/add', HomeController.showAddClientForm);
app.get('/bookings/add', HomeController.showAddBookingForm);
app.get('/stays/add', HomeController.showAddStayForm);

// Подключение модульных маршрутов
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/bookings', bookingRoutes);
app.use('/stays', stayRoutes);

// Обработчик 404
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user });
});

// Инициализация базы данных и запуск сервера
const startServer = async () => {
  try {
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      console.log(`📁 Окружение: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ База данных готова к работе`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();