'use strict'
const { DataTypes } = require('sequelize')

// LOT® Email — simplest possible mail: one table, community-gated.
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('emails', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
      fromUserId: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      toUserId: {
        type: DataTypes.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      body: { type: DataTypes.TEXT, allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('emails', ['toUserId', 'createdAt'])
    await queryInterface.addIndex('emails', ['fromUserId', 'createdAt'])
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('emails')
  },
}
