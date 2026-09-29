// @ts-check
// LOT-FM-001 — BASIC RATION — Month 3 migration
// Creates basic_issues table for issue log + fulfillment tracking
const { DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('basic_issues', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'basic_subscriptions', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      issueNumber:    { type: DataTypes.INTEGER, allowNull: false },
      periodLabel:    { type: DataTypes.STRING,  allowNull: true },
      itemCount:      { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'SCHEDULED',
      },
      issuedAt:       { type: DataTypes.DATE,   allowNull: true },
      shippedAt:      { type: DataTypes.DATE,   allowNull: true },
      deliveredAt:    { type: DataTypes.DATE,   allowNull: true },
      trackingNumber: { type: DataTypes.STRING, allowNull: true },
      createdAt:      { type: DataTypes.DATE,   allowNull: false },
      updatedAt:      { type: DataTypes.DATE,   allowNull: false },
    })

    await queryInterface.addIndex('basic_issues', ['subscriptionId'])
    await queryInterface.addIndex('basic_issues', ['userId'])
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('basic_issues')
  },
}
