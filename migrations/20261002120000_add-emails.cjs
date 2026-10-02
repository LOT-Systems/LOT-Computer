'use strict'
const { DataTypes } = require('sequelize')

// LOT® Email — simplest possible internal mail: one row per message,
// composed in Log (/email to NAME), delivered to the Sync inbox.
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
      subject: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '' },
      body: { type: DataTypes.TEXT, allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('emails', ['receiverId', 'createdAt'], { name: 'idx_emails_receiver_created' })
    await queryInterface.addIndex('emails', ['senderId', 'createdAt'], { name: 'idx_emails_sender_created' })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('emails')
  },
}
