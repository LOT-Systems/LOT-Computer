'use strict'
const { DataTypes } = require('sequelize')

/**
 * LOT® Email — member-to-member mail (Log → Sync).
 * Additive only: new table + indexes. No existing data touched.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('lot_emails', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
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
      subject: { type: DataTypes.STRING(200), allowNull: true },
      body: { type: DataTypes.TEXT, allowNull: false },
      source: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'log' },
      replyToId: { type: DataTypes.UUID, allowNull: true },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('lot_emails', ['receiverId', 'createdAt'], {
      name: 'idx_lot_emails_receiver_createdat',
    })
    await queryInterface.addIndex('lot_emails', ['senderId', 'createdAt'], {
      name: 'idx_lot_emails_sender_createdat',
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_emails')
  },
}
