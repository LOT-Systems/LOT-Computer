// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'timeChime', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'timeChime')
  },
}
