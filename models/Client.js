const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define(
    'Client',
    {
      passport_data: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          notEmpty: true,
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
      },
      middle_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 50],
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      registration_address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [5, 200],
        },
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString().split('T')[0],
        },
      },
    },
    {
      tableName: 'clients',
    }
  );

  return Client;
};