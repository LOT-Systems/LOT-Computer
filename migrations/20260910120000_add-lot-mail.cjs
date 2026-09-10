'use strict'
const { DataTypes } = require('sequelize')

/**
 * LOT Mail — in-app email sent via the /email log trigger, delivered into Sync.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('lot_mails', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      fromUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      toUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })

    await queryInterface.addIndex('lot_mails', ['toUserId', 'read', 'createdAt'], {
      name: 'idx_lot_mails_to_user_read_created',
    })

    await queryInterface.addIndex('lot_mails', ['fromUserId', 'createdAt'], {
      name: 'idx_lot_mails_from_user_created',
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('lot_mails')
  },
}
