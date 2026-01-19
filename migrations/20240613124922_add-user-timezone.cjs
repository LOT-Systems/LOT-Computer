// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'timeZone', {
      type: DataTypes.STRING,
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'timeZone')
  },
}
