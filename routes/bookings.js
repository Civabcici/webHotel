const express = require('express');
const { Booking, Client, Room } = require('../models');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const router = express.Router();

// Список бронирований
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Client },
        { model: Room }
      ],
      order: [['check_in_date', 'DESC']]
    });
    res.render('bookings/index', { 
      bookings,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Ошибка сервера',
      user: req.session.user 
    });
  }
});

// Форма добавления бронирования
router.get('/add', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['last_name', 'ASC']]
    });
    const rooms = await Room.findAll({
      where: { is_available: true },
      order: [['room_number', 'ASC']]
    });
    
    res.render('bookings/add', { 
      clients, 
      rooms,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Ошибка сервера',
      user: req.session.user 
    });
  }
});

// Добавление бронирования
router.post('/add', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const { 
      client_passport, 
      check_in_date, 
      check_out_date, 
      room_id,
      guests_count,
      special_requests 
    } = req.body;

    // Проверяем доступность номера
    const overlappingBooking = await Booking.findOne({
      where: {
        room_id,
        status: ['pending', 'confirmed'],
        [require('sequelize').Op.or]: [
          {
            check_in_date: { 
              [require('sequelize').Op.between]: [check_in_date, check_out_date] 
            }
          },
          {
            check_out_date: { 
              [require('sequelize').Op.between]: [check_in_date, check_out_date] 
            }
          }
        ]
      }
    });

    if (overlappingBooking) {
      const clients = await Client.findAll();
      const rooms = await Room.findAll({ where: { is_available: true } });
      return res.render('bookings/add', { 
        clients, 
        rooms,
        error: 'Номер уже забронирован на выбранные даты',
        user: req.session.user 
      });
    }

    await Booking.create({
      client_passport,
      check_in_date,
      check_out_date,
      room_id: parseInt(room_id),
      guests_count: parseInt(guests_count) || 1,
      special_requests,
      status: 'confirmed',
      creation_date: new Date()
    });

    res.redirect('/bookings');
  } catch (error) {
    const clients = await Client.findAll();
    const rooms = await Room.findAll({ where: { is_available: true } });
    res.render('bookings/add', { 
      clients, 
      rooms,
      error: 'Ошибка добавления бронирования: ' + error.message,
      user: req.session.user 
    });
  }
});

// Форма редактирования бронирования
router.get('/edit/:id', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    const clients = await Client.findAll({
      order: [['last_name', 'ASC']]
    });
    const rooms = await Room.findAll({
      order: [['room_number', 'ASC']]
    });

    if (!booking) {
      return res.status(404).render('error', { 
        message: 'Бронирование не найдено',
        user: req.session.user 
      });
    }

    res.render('bookings/edit', { 
      booking, 
      clients, 
      rooms,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Ошибка сервера',
      user: req.session.user 
    });
  }
});

// Обновление бронирования
router.post('/edit/:id', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const { 
      client_passport, 
      check_in_date, 
      check_out_date, 
      room_id,
      status,
      guests_count,
      special_requests 
    } = req.body;

    await Booking.update(
      {
        client_passport,
        check_in_date,
        check_out_date,
        room_id: parseInt(room_id),
        status,
        guests_count: parseInt(guests_count) || 1,
        special_requests
      },
      {
        where: { id: req.params.id },
      }
    );

    res.redirect('/bookings');
  } catch (error) {
    const booking = await Booking.findByPk(req.params.id);
    const clients = await Client.findAll();
    const rooms = await Room.findAll();
    res.render('bookings/edit', { 
      booking, 
      clients, 
      rooms,
      error: 'Ошибка обновления бронирования: ' + error.message,
      user: req.session.user 
    });
  }
});

// Удаление бронирования
router.post('/delete/:id', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    await Booking.destroy({
      where: { id: req.params.id },
    });
    res.redirect('/bookings');
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Ошибка удаления бронирования: ' + error.message,
      user: req.session.user 
    });
  }
});

module.exports = router;