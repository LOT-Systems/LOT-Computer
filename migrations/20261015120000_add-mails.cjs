'use strict'

/** LOT® Mail — one row per message; threads via replyToId. */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS mails (
        id UUID PRIMARY KEY,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(120) NOT NULL DEFAULT '',
        body TEXT NOT NULL,
        "replyToId" UUID NULL,
        "readAt" TIMESTAMPTZ NULL,
        "createdAt" TIMESTAMPTZ NOT NULL,
        "updatedAt" TIMESTAMPTZ NOT NULL
      )`)
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_mails_receiver_created ON mails ("receiverId", "createdAt")`
    )
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_mails_sender_created ON mails ("senderId", "createdAt")`
    )
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS mails`)
  },
}
