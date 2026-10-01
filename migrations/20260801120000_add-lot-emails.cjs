// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

/**
 * LOT® Email — simplest internal mail between community members.
 * Composed in Log (`/email to NAME. body`), delivered to Sync inbox.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('lot_emails', {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
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
      subject: { type: DataTypes.STRING(120), allowNull: false, defaultValue: '' },
      body: { type: DataTypes.TEXT, allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    })
    await queryInterface.addIndex('lot_emails', ['receiverId', 'createdAt'], { name: 'idx_lot_emails_receiver_created' })
    await queryInterface.addIndex('lot_emails', ['senderId', 'createdAt'], { name: 'idx_lot_emails_sender_created' })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_emails')
  },
}
