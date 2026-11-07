'use strict'
const { DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('lot_emails', {
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
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('lot_emails', ['receiverId', 'createdAt'])
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_emails')
  },
}
