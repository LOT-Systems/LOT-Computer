'use strict'
const { Sequelize, DataTypes } = require('sequelize')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      address: DataTypes.STRING,
      phone: DataTypes.STRING,
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      lastSeenAt: DataTypes.DATE,
    })
    await queryInterface.createTable('sessions', {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: DataTypes.DATE,
    })
    await queryInterface.createTable('email_codes', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      magicLinkToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('email_codes')
    await queryInterface.dropTable('sessions')
    await queryInterface.dropTable('users')
  },
}
