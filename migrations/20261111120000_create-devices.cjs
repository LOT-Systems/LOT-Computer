'use strict'
const { DataTypes } = require('sequelize')

// LOT hardware pager: paired devices. Additive only (new table), safe to roll back.
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('devices', {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: DataTypes.STRING(64), allowNull: false },
      tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      firmware: { type: DataTypes.STRING(32), allowNull: true },
      lastSeenAt: { type: DataTypes.DATE, allowNull: true },
      revokedAt: { type: DataTypes.DATE, allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    })
    await queryInterface.addIndex('devices', ['userId'], { name: 'idx_devices_userid' })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('devices')
  },
}
