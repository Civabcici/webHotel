// middleware/auth.js
const { User, Role } = require('../models');

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

// Middleware для проверки роли
function hasRole(roleName) {
  return async (req, res, next) => {
    if (req.session.user) {
      try {
        const user = await User.findByPk(req.session.user.id, {
          include: Role,
        });
        if (user && user.Role.name === roleName) {
          next();
        } else {
          res.status(403).render('error', { 
            message: 'Доступ запрещен',
            user: req.session.user 
          });
        }
      } catch (error) {
        res.status(500).render('error', { 
          message: 'Ошибка сервера',
          user: req.session.user 
        });
      }
    } else {
      res.redirect('/auth/login');
    }
  };
}

module.exports = {
  isAuthenticated,
  hasRole
};