const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define(
    'Room',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      room_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      room_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'standard',
      },
      price_per_night: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'rooms',
    }
  );

  return Room;
};