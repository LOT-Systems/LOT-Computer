'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DELETE FROM chat_messages
      WHERE TRIM(message) = ''
    `)
  },

  async down() {
    // Deleted empty messages are not restored
  },
}
