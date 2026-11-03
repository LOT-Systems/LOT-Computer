'use strict'
const { DataTypes } = require('sequelize')

/** LOT® Email — simplest internal mail between LOT Community members. */
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
      subject: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '' },
      body: { type: DataTypes.TEXT, allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('lot_emails', ['receiverId', 'createdAt'], {
      name: 'idx_lot_emails_receiver_created',
    })
    await queryInterface.addIndex('lot_emails', ['senderId', 'createdAt'], {
      name: 'idx_lot_emails_sender_created',
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_emails')
  },
}
