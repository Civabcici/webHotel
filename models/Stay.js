const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Stay = sequelize.define(
    'Stay',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      total_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        allowNull: false,
        validate: {
          isIn: [['active', 'completed', 'cancelled']],
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paid_amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'partial', 'paid']],
        },
      },
    },
    {
      tableName: 'stays',
      hooks: {
        beforeValidate: (stay) => {
          // Автоматическое обновление статуса на основе дат
          const today = new Date().toISOString().split('T')[0];
          if (stay.check_out_date && stay.check_out_date < today && stay.status === 'active') {
            stay.status = 'completed';
          }
        },
      },
    }
  );

  // Метод для расчета оставшейся суммы к оплате
  Stay.prototype.getRemainingAmount = function() {
    return this.total_cost - this.paid_amount;
  };

  // Метод для отметки оплаты
  Stay.prototype.markAsPaid = async function(amount) {
    this.paid_amount += amount;
    
    if (this.paid_amount >= this.total_cost) {
      this.payment_status = 'paid';
    } else if (this.paid_amount > 0) {
      this.payment_status = 'partial';
    }
    
    await this.save();
  };

  return Stay;
};