'use strict'
const { Sequelize, DataTypes } = require('sequelize')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('weather_responses', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      weather: DataTypes.JSONB,
      createdAt: DataTypes.DATE,
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('weather_responses')
  },
}
