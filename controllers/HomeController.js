class HomeController {
  // Главная страница
  static async showHomePage(req, res) {
    res.render('index', { 
      user: req.session.user,
      stats: { clientsCount: 0, bookingsCount: 0, staysCount: 0 }
    });
  }

  // Страница профиля
  static showProfile(req, res) {
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
  }

  // Формы добавления (только для администраторов)
  static showAddClientForm(req, res) {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    if (req.session.user.role !== 'Администратор') {
      return res.status(403).send('Доступ запрещен');
    }
    res.render('clients/add', { 
      user: req.session.user 
    });
  }

  static showAddBookingForm(req, res) {
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
  }

  static showAddStayForm(req, res) {
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
  }
}

module.exports = HomeController;