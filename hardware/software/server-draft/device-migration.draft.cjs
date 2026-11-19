'use strict'
// DRAFT — move to migrations/2026MMDDHHMMSS_add-devices.cjs in Phase P1b.
// Kept outside migrations/ so it does not run.

module.exports = {
  async up({ context: queryInterface }) {
    const { DataTypes } = require('sequelize')
    await queryInterface.createTable('devices', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      hardwareId: { type: DataTypes.STRING(32), allowNull: false },
      hw: { type: DataTypes.STRING(16), defaultValue: 'L-01' },
      name: { type: DataTypes.STRING(64) },
      fw: { type: DataTypes.STRING(32) },
      tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      pollSeconds: { type: DataTypes.INTEGER, defaultValue: 900 },
      digest: { type: DataTypes.STRING(120) },
      battery: { type: DataTypes.INTEGER },
      lastReading: { type: DataTypes.JSONB, defaultValue: {} },
      lastSeenAt: { type: DataTypes.DATE },
      revokedAt: { type: DataTypes.DATE },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.createTable('device_messages', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      seq: { type: DataTypes.BIGINT, autoIncrement: true, unique: true },
      userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: DataTypes.STRING(80), allowNull: false },
      kind: { type: DataTypes.STRING(16), defaultValue: 'nudge' },
      buzz: { type: DataTypes.SMALLINT, defaultValue: 1 },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    })
    await queryInterface.addIndex('device_messages', ['userId', 'seq'])
    await queryInterface.addIndex('devices', ['userId'])
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('device_messages')
    await queryInterface.dropTable('devices')
  },
}
