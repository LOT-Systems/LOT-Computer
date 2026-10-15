/**
 * LOT-FM-001 — record margin-gate result on each issue (boolean only; COGS never stored on the row).
 */
const { DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('basic_issues', 'marginOk', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('basic_issues', 'marginOk')
  },
}
