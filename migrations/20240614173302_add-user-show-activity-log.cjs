// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'hideActivityLogs', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'hideActivityLogs')
  },
}
