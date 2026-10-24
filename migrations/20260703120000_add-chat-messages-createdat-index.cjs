'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    // CONCURRENTLY cannot run inside a transaction — pass { transaction: null }
    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_createdat
       ON chat_messages ("createdAt" DESC)`,
      { transaction: null }
    )
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      `DROP INDEX CONCURRENTLY IF EXISTS idx_chat_messages_createdat`,
      { transaction: null }
    )
    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_createdat
      ON chat_messages ("createdAt" DESC)
    `)
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS idx_chat_messages_createdat
    `)
  },
}
