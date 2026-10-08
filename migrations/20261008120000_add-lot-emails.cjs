'use strict'

// LOT® Email — one row per message, inbox = rows where receiverId = me.
module.exports = {
  async up({ context: queryInterface }) {
    const { DataTypes } = require('sequelize')
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
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    })
    await queryInterface.addIndex('lot_emails', ['receiverId', 'createdAt'])
    await queryInterface.addIndex('lot_emails', ['senderId', 'createdAt'])
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_emails')
  },
}
