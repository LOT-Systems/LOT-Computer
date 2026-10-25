'use strict'
const { DataTypes } = require('sequelize')

/**
 * LOT® Email — simplest possible mailbox.
 * One row per message. Composed in Log (/email to Name.), read in Sync.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('emails', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      body: { type: DataTypes.TEXT, allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    })
    await queryInterface.addIndex('emails', ['receiverId', 'createdAt'])
    await queryInterface.addIndex('emails', ['senderId', 'createdAt'])
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('emails')
  },
}
