'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS lot_emails (
        id UUID PRIMARY KEY,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(200) NOT NULL DEFAULT '',
        body TEXT NOT NULL,
        "readAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`)
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_lot_emails_receiver_created ON lot_emails ("receiverId", "createdAt")`
    )
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS lot_emails`)
  },
}
