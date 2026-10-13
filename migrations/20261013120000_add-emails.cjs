'use strict'
const { DataTypes } = require('sequelize')

// LOT® Email — simplest possible mail: sender, receiver, body, readAt.
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('emails', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
      senderId: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      receiverId: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      body: { type: DataTypes.TEXT, allowNull: false },
      source: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'log' },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('emails', ['receiverId', 'createdAt'])
    await queryInterface.addIndex('emails', ['senderId', 'createdAt'])
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('emails')
  },
}
