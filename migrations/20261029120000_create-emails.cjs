'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id UUID PRIMARY KEY,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(200),
        body TEXT NOT NULL,
        source VARCHAR(16) NOT NULL DEFAULT 'log',
        "readAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_emails_receiver_created
       ON emails ("receiverId", "createdAt" DESC)`
    )
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS emails`)
  },
}
