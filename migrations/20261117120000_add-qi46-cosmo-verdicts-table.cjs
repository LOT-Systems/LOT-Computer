// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

/**
 * QI·46 Node 3 — COSMO® audit trail.
 * Append-only. One row per COSMO® verdict.
 * By design there is NO text column: neither the person's words nor the
 * generated response is stored. Only status, reason codes, and the
 * calibration labels that produced the voice.
 *
 * REVIEW GATE: Vadik reviews this migration before it runs in production.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('qi46_cosmo_verdicts', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: { type: DataTypes.STRING(8), allowNull: false }, // CLEARED | HELD
      reasons: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }, // reason codes only
      risk_level: { type: DataTypes.STRING(16), allowNull: false },
      lead: { type: DataTypes.STRING(16), allowNull: false },
      engine_version: { type: DataTypes.STRING(32), allowNull: false },
      source: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'admin-preview' },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    })
    await queryInterface.addIndex('qi46_cosmo_verdicts', ['userId', 'created_at'], {
      name: 'idx_qi46_cosmo_verdicts_user_created',
    })
    await queryInterface.addIndex('qi46_cosmo_verdicts', ['status'], {
      name: 'idx_qi46_cosmo_verdicts_status',
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('qi46_cosmo_verdicts')
  },
}
