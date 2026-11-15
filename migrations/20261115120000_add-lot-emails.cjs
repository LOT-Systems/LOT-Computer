'use strict'
const { DataTypes } = require('sequelize')

/**
 * LOT® Email — the simplest operator-to-operator mail.
 * One row = one letter. Composed in Log (/email to <name>), received in Sync.
 */
module.exports = {
  async up({ context: queryInterface }) {
    const tables = await queryInterface.showAllTables()
    if (!tables.includes('lot_emails')) {
      await queryInterface.createTable('lot_emails', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
        senderId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        receiverId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        body: { type: DataTypes.TEXT, allowNull: false },
        source: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'log' },
        readAt: { type: DataTypes.DATE, allowNull: true },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      })
    }
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_lot_emails_receiver_created ON lot_emails ("receiverId", "createdAt")'
    )
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_lot_emails_sender_created ON lot_emails ("senderId", "createdAt")'
    )
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_emails')
  },
}
