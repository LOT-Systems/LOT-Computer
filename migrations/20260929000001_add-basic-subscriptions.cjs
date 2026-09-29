// @ts-check
// LOT-FM-001 — BASIC RATION — Month 2 migration
// Creates basic_subscriptions table for upgrade state machine + roster intake
const { DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('basic_subscriptions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      shippingName:    { type: DataTypes.STRING, allowNull: true },
      shippingLine1:   { type: DataTypes.STRING, allowNull: true },
      shippingLine2:   { type: DataTypes.STRING, allowNull: true },
      shippingCity:    { type: DataTypes.STRING, allowNull: true },
      shippingState:   { type: DataTypes.STRING, allowNull: true },
      shippingZip:     { type: DataTypes.STRING, allowNull: true },
      shippingCountry: { type: DataTypes.STRING, allowNull: true, defaultValue: 'US' },
      shirtSize:       { type: DataTypes.STRING, allowNull: true },
      shoeSize:        { type: DataTypes.STRING, allowNull: true },
      cadenceStart:    { type: DataTypes.DATE,   allowNull: true },
      createdAt:       { type: DataTypes.DATE,   allowNull: false },
      updatedAt:       { type: DataTypes.DATE,   allowNull: false },
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('basic_subscriptions')
  },
}
