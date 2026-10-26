// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

/**
 * LOT-FM-001 BASIC ration — roster (one row per member, mutable state)
 * and issue log (append-only, one row per ration issue).
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('ration_roster', {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'PENDING' },
      billingConfirmed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      billingRef: { type: DataTypes.STRING(128), allowNull: true },
      intake: { type: DataTypes.JSONB, allowNull: true },
      cadenceStart: { type: DataTypes.DATEONLY, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    })

    await queryInterface.createTable('ration_issue_log', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      kind: { type: DataTypes.STRING(24), allowNull: false },
      detail: { type: DataTypes.STRING(500), allowNull: false },
    })
    await queryInterface.addIndex('ration_issue_log', ['userId', 'timestamp'], {
      name: 'idx_ration_issue_log_user_ts',
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('ration_issue_log')
    await queryInterface.dropTable('ration_roster')
  },
}
