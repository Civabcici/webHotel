const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

// Импорт моделей
const ClientModel = require('./Client');
const BookingModel = require('./Booking');
const StayModel = require('./Stay');
const UserModel = require('./User');
const RoleModel = require('./Role');
const RoomModel = require('./Room');

// Инициализация моделей
const Client = ClientModel(sequelize, DataTypes);
const Booking = BookingModel(sequelize, DataTypes);
const Stay = StayModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Role = RoleModel(sequelize, DataTypes);
const Room = RoomModel(sequelize, DataTypes);

// Установка связей между моделями
Client.hasMany(Booking, {
  foreignKey: 'client_passport',
  sourceKey: 'passport_data',
});
Booking.belongsTo(Client, {
  foreignKey: 'client_passport',
  targetKey: 'passport_data',
});

Client.hasMany(Stay, {
  foreignKey: 'client_passport',
  sourceKey: 'passport_data',
});
Stay.belongsTo(Client, {
  foreignKey: 'client_passport',
  targetKey: 'passport_data',
});

// Связи для номеров
Room.hasMany(Booking, { foreignKey: 'room_id' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });

Room.hasMany(Stay, { foreignKey: 'room_id' });
Stay.belongsTo(Room, { foreignKey: 'room_id' });

// Связи для системы ролей
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// Синхронизация базы данных
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('База данных синхронизирована');

    // Создание базовых ролей если их нет
    const roles = await Role.findAll();
    if (roles.length === 0) {
      await Role.bulkCreate([
        { 
          name: 'Администратор',
          description: 'Полный доступ ко всем функциям системы'
        },
        { 
          name: 'Пользователь',
          description: 'Стандартный пользователь системы'
        },
      ]);
      console.log('Роли по умолчанию созданы');
    }
  } catch (error) {
    console.error('Ошибка синхронизации базы данных:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Client,
  Booking,
  Stay,
  User,
  Role,
  Room,
  syncDatabase,
};