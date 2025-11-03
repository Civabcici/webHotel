const express = require('express');
const { Stay, Client, Room, Booking } = require('../models');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const router = express.Router();

// Список проживаний
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const stays = await Stay.findAll({
      include: [
        { model: Client },
        { model: Room }
      ],
      order: [['check_in_date', 'DESC']]
    });
    res.render('stays/index', { 
      stays,
      user: req.session.user 
    });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Ошибка сервера',
      user: req.session.user 
    });
  }
});

// Форма добавления проживания
router.get('/add', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['last_name', 'ASC']]
    });
    const rooms = await Room.findAll({
      where: { is_available: true },
      order: [['room_number', 'ASC']]
    });
    const bookings = await Booking.findAll({
      where: { status: 'confirmed' },
      include: [Client],
      order: [['check_in_date', 'ASC']]
    });
    
    res.render('stays/add', { 
      clients, 
      rooms, 
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

// Добавление проживания
router.post('/add', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const {
      client_passport,
      check_in_date,
      check_out_date,
      total_cost,
      room_id,
      notes
    } = req.body;

    await Stay.create({
      client_passport,
      check_in_date,
      check_out_date,
      total_cost: parseFloat(total_cost),
      room_id: parseInt(room_id),
      notes,
      status: 'active',
      paid_amount: 0,
      payment_status: 'pending'
    });

    res.redirect('/stays');
  } catch (error) {
    const clients = await Client.findAll();
    const rooms = await Room.findAll({ where: { is_available: true } });
    const bookings = await Booking.findAll({ where: { status: 'confirmed' } });
    res.render('stays/add', { 
      clients, 
      rooms, 
      bookings,
      error: 'Ошибка добавления проживания: ' + error.message,
      user: req.session.user 
    });
  }
});

// Форма редактирования проживания
router.get('/edit/:id', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const stay = await Stay.findByPk(req.params.id);
    const clients = await Client.findAll({
      order: [['last_name', 'ASC']]
    });
    const rooms = await Room.findAll({
      order: [['room_number', 'ASC']]
    });

    if (!stay) {
      return res.status(404).render('error', { 
        message: 'Проживание не найдено',
        user: req.session.user 
      });
    }

    res.render('stays/edit', { 
      stay, 
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

// Обновление проживания
router.post('/edit/:id', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    const {
      client_passport,
      check_in_date,
      check_out_date,
      total_cost,
      room_id,
      status,
      notes,
      paid_amount
    } = req.body;

    await Stay.update(
      {
        client_passport,
        check_in_date,
        check_out_date,
        total_cost: parseFloat(total_cost),
        room_id: parseInt(room_id),
        status,
        notes,
        paid_amount: parseFloat(paid_amount) || 0
      },
      {
        where: { id: req.params.id },
      }
    );

    res.redirect('/stays');
  } catch (error) {
    const stay = await Stay.findByPk(req.params.id);
    const clients = await Client.findAll();
    const rooms = await Room.findAll();
    res.render('stays/edit', { 
      stay, 
      clients, 
      rooms,
      error: 'Ошибка обновления проживания: ' + error.message,
      user: req.session.user 
    });
  }
});

// Удаление проживания
router.post('/delete/:id', isAuthenticated, hasRole('Администратор'), async (req, res) => {
  try {
    await Stay.destroy({
      where: { id: req.params.id },
    });
    res.redirect('/stays');
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Ошибка удаления проживания: ' + error.message,
      user: req.session.user 
    });
  }
});

module.exports = router;