// @ts-check
const { DataTypes } = require('sequelize')

/**
 * LOT-FM-001 / Ration Subscription Roster
 * State machine: PENDING → ON_STRENGTH → STEADY_STATE | STAND_DOWN
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('ration_subscriptions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ON_STRENGTH', 'STEADY_STATE', 'STAND_DOWN'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      // Roster fields
      shippingLine1: { type: DataTypes.STRING(255), allowNull: false },
      shippingLine2: { type: DataTypes.STRING(255), allowNull: true },
      shippingCity:  { type: DataTypes.STRING(100), allowNull: false },
      shippingState: { type: DataTypes.STRING(10),  allowNull: false },
      shippingZip:   { type: DataTypes.STRING(20),  allowNull: false },
      clothingSize:  { type: DataTypes.STRING(10),  allowNull: false },
      // Billing
      stripeSubscriptionItemId: { type: DataTypes.STRING(255), allowNull: true },
      // Issue tracking
      issueCount:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      lastIssueDate: { type: DataTypes.DATEONLY, allowNull: true },
      nextIssueDate: { type: DataTypes.DATEONLY, allowNull: true },
      // Lifecycle
      subscribedAt:  { type: DataTypes.DATE, allowNull: true },
      standDownAt:   { type: DataTypes.DATE, allowNull: true },
      createdAt:     { type: DataTypes.DATE, allowNull: false },
      updatedAt:     { type: DataTypes.DATE, allowNull: false },
    })

    await queryInterface.addIndex('ration_subscriptions', ['userId'],  { name: 'idx_ration_sub_user' })
    await queryInterface.addIndex('ration_subscriptions', ['status'],  { name: 'idx_ration_sub_status' })
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('ration_subscriptions')
    // Drop the ENUM type created by Sequelize for Postgres
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_ration_subscriptions_status;"
    )
  },
}
