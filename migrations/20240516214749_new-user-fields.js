// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'joinedAt',
        {
          type: DataTypes.DATE,
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'users',
        'stripeCustomerId',
        {
          type: DataTypes.STRING,
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'users',
        'metadata',
        {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
        { transaction }
      )
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'joinedAt', { transaction })
      await queryInterface.removeColumn('users', 'stripeCustomerId', {
        transaction,
      })
      await queryInterface.removeColumn('users', 'metadata', {
        transaction,
      })
    })
  },
}
