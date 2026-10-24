'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    // Index for GET /chat-messages: findAll({ where: { messageId: [...] } })
    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_message_likes_messageid
       ON chat_messages_likes ("messageId")`,
      { transaction: null }
    )
    // Composite index for SSE fan-out findOne({ where: { messageId, userId } })
    await queryInterface.sequelize.query(
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_message_likes_messageid_userid
       ON chat_messages_likes ("messageId", "userId")`,
      { transaction: null }
    )
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      `DROP INDEX CONCURRENTLY IF EXISTS idx_chat_message_likes_messageid`,
      { transaction: null }
    )
    await queryInterface.sequelize.query(
      `DROP INDEX CONCURRENTLY IF EXISTS idx_chat_message_likes_messageid_userid`,
      { transaction: null }
    )
  },
}
