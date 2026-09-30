'use strict'

// LOT Email: mail is a direct message with a subject. `readAt` tracks the
// receiver's inbox state. Plain DMs keep subject = NULL.
module.exports = {
  async up({ context: queryInterface }) {
    const { DataTypes } = require('sequelize')
    await queryInterface.addColumn('direct_messages', 'subject', {
      type: DataTypes.STRING(200),
      allowNull: true,
    })
    await queryInterface.addColumn('direct_messages', 'readAt', {
      type: DataTypes.DATE,
      allowNull: true,
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('direct_messages', 'readAt')
    await queryInterface.removeColumn('direct_messages', 'subject')
  },
}
