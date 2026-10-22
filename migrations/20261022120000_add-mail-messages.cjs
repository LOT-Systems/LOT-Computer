'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS mail_messages (
        id UUID PRIMARY KEY,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "recipientId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        source VARCHAR(16) NOT NULL DEFAULT 'log',
        "readAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_mail_messages_recipient
      ON mail_messages ("recipientId", "createdAt" DESC)
    `)
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS mail_messages`)
  },
}
