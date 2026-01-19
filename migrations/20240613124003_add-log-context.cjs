// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('logs', 'context', {
      type: DataTypes.JSONB,
      defaultValue: {},
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('logs', 'context')
  },
}
