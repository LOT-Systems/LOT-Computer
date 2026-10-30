'use strict'

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      `ALTER TABLE direct_messages
         ADD COLUMN IF NOT EXISTS kind VARCHAR(16) NOT NULL DEFAULT 'dm',
         ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP WITH TIME ZONE`
    )
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS idx_direct_messages_inbox
       ON direct_messages ("receiverId", kind, "readAt")`
    )
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS idx_direct_messages_inbox`
    )
    await queryInterface.sequelize.query(
      `ALTER TABLE direct_messages DROP COLUMN IF EXISTS kind, DROP COLUMN IF EXISTS "readAt"`
    )
  },
}
