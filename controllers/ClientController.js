// controllers/ClientController.js
const { Client, Booking, Stay } = require('../models');

class ClientController {
  // Список клиентов
  static async list(req, res) {
    try {
      const clients = await Client.findAll({
        order: [['last_name', 'ASC']]
      });
      res.render('clients/index', { 
        clients,
        user: req.session.user 
      });
    } catch (error) {
      res.status(500).render('error', { 
        message: 'Ошибка сервера',
        user: req.session.user 
      });
    }
  }

  // Форма добавления клиента
  static showAddForm(req, res) {
    res.render('clients/add', { 
      user: req.session.user 
    });
  }

  // Добавление клиента
  static async add(req, res) {
    try {
      const {
        passport_data,
        last_name,
        first_name,
        middle_name,
        phone,
        registration_address,
        birth_date,
      } = req.body;

      await Client.create({
        passport_data,
        last_name,
        first_name,
        middle_name,
        phone,
        registration_address,
        birth_date,
      });

      res.redirect('/clients');
    } catch (error) {
      res.status(400).render('clients/add', { 
        error: 'Ошибка добавления клиента: ' + error.message,
        user: req.session.user 
      });
    }
  }

  // Форма редактирования клиента
  static async showEditForm(req, res) {
    try {
      const client = await Client.findByPk(req.params.passport);
      if (!client) {
        return res.status(404).render('error', { 
          message: 'Клиент не найден',
          user: req.session.user 
        });
      }
      res.render('clients/edit', { 
        client,
        user: req.session.user 
      });
    } catch (error) {
      res.status(500).render('error', { 
        message: 'Ошибка сервера',
        user: req.session.user 
      });
    }
  }

  // Обновление клиента
  static async update(req, res) {
    try {
      const {
        last_name,
        first_name,
        middle_name,
        phone,
        registration_address,
        birth_date,
      } = req.body;

      await Client.update(
        {
          last_name,
          first_name,
          middle_name,
          phone,
          registration_address,
          birth_date,
        },
        {
          where: { passport_data: req.params.passport },
        }
      );

      res.redirect('/clients');
    } catch (error) {
      const client = await Client.findByPk(req.params.passport);
      res.status(400).render('clients/edit', { 
        client,
        error: 'Ошибка обновления клиента: ' + error.message,
        user: req.session.user 
      });
    }
  }

  // Удаление клиента
  static async delete(req, res) {
    try {
      const bookingsCount = await Booking.count({ 
        where: { client_passport: req.params.passport } 
      });
      const staysCount = await Stay.count({ 
        where: { client_passport: req.params.passport } 
      });

      if (bookingsCount > 0 || staysCount > 0) {
        return res.status(400).render('error', { 
          message: 'Нельзя удалить клиента с существующими бронированиями или проживаниями',
          user: req.session.user 
        });
      }

      await Client.destroy({
        where: { passport_data: req.params.passport },
      });
      res.redirect('/clients');
    } catch (error) {
      res.status(500).render('error', { 
        message: 'Ошибка удаления клиента: ' + error.message,
        user: req.session.user 
      });
    }
  }
}

module.exports = ClientController;