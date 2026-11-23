// @ts-check
const { DataTypes } = require('sequelize')

/**
 * LOT-FM-001 / Issue Log — one record per ration dispatched.
 * Append-only. Margin is verified server-side before dispatch.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('ration_issues', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ration_subscriptions', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      issueNumber: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'),
        allowNull: false,
        defaultValue: 'SCHEDULED',
      },
      scheduledDate: { type: DataTypes.DATEONLY, allowNull: false },
      dispatchedAt:  { type: DataTypes.DATE,     allowNull: true  },
      trackingCode:  { type: DataTypes.STRING(255), allowNull: true },
      // Which items are in this issue (item numbers from manifest)
      loadSummary:   { type: DataTypes.JSONB, allowNull: false },
      cogsTotal:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      marginPct:     { type: DataTypes.DECIMAL(10, 4), allowNull: false },
      createdAt:     { type: DataTypes.DATE, allowNull: false },
      updatedAt:     { type: DataTypes.DATE, allowNull: false },
    })

    await queryInterface.addIndex('ration_issues', ['subscriptionId'], { name: 'idx_ration_issues_sub' })
    await queryInterface.addIndex('ration_issues', ['userId'],         { name: 'idx_ration_issues_user' })
    await queryInterface.addIndex('ration_issues', ['status'],         { name: 'idx_ration_issues_status' })
    await queryInterface.addIndex('ration_issues', ['scheduledDate'],  { name: 'idx_ration_issues_date' })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('ration_issues')
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_ration_issues_status;"
    )
  },
}
