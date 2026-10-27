'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id UUID PRIMARY KEY,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "recipientId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        source VARCHAR(255) NOT NULL DEFAULT 'log',
        "readAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`)
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_emails_recipient_created ON emails ("recipientId", "createdAt")`
    )
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_emails_sender_created ON emails ("senderId", "createdAt")`
    )
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS emails`)
  },
}
