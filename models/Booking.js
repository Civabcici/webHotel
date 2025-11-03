const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      creation_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: true,
        },
      },
      check_in_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      check_out_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterCheckIn(value) {
            if (new Date(value) <= new Date(this.check_in_date)) {
              throw new Error('Дата выезда должна быть после даты заезда');
            }
          },
        },
      },
      client_passport: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1,
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false,
        validate: {
          isIn: [['pending', 'confirmed', 'cancelled', 'completed']],
        },
      },
      total_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      guests_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: true,
          min: 1,
        },
      },
      special_requests: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'bookings',
      hooks: {
        beforeValidate: (booking) => {
          // Автоматический расчет цены если не указана
          if (!booking.total_price && booking.check_in_date && booking.check_out_date) {
            // Здесь можно добавить логику расчета цены на основе номера и длительности
            // Пока установим базовую цену
            const nights = Math.ceil(
              (new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24)
            );
            booking.total_price = nights * 2500; // Базовая цена 2500 за ночь
          }
        },
      },
    }
  );

  // Метод для проверки доступности номера
  Booking.prototype.isRoomAvailable = async function() {
    const overlappingBookings = await Booking.count({
      where: {
        room_id: this.room_id,
        status: ['pending', 'confirmed'],
        [sequelize.Op.or]: [
          {
            check_in_date: { [sequelize.Op.between]: [this.check_in_date, this.check_out_date] }
          },
          {
            check_out_date: { [sequelize.Op.between]: [this.check_in_date, this.check_out_date] }
          }
        ]
      }
    });
    
    return overlappingBookings === 0;
  };

  return Booking;
};