'use strict'

/**
 * LOT® Email — mail store.
 *
 * The DirectMessage model shipped without a migration, so the table may
 * or may not exist depending on the environment. Everything here is
 * idempotent (IF NOT EXISTS) so it is safe on both fresh and patched DBs.
 *
 * Adds three LOT® Email columns on top of the base DM shape:
 *   kind    'dm' (thread reply) | 'email' (composed in Log via /email)
 *   subject optional one-line subject (first line of the Log body)
 *   readAt  null until the receiver opens it in Sync — drives the NEW marker
 */
module.exports = {
  async up({ context: queryInterface }) {
    const q = (sql) => queryInterface.sequelize.query(sql)
    await q(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        "id" UUID PRIMARY KEY,
        "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "message" TEXT NOT NULL,
        "createdAt" TIMESTAMPTZ,
        "updatedAt" TIMESTAMPTZ
      )
    `)
    await q(`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS "kind" VARCHAR(16) NOT NULL DEFAULT 'dm'`)
    await q(`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS "subject" VARCHAR(200)`)
    await q(`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMPTZ`)
    await q(`CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_created ON direct_messages ("receiverId", "createdAt")`)
    await q(`CREATE INDEX IF NOT EXISTS idx_direct_messages_pair_created ON direct_messages ("senderId", "receiverId", "createdAt")`)
  },
  async down({ context: queryInterface }) {
    const q = (sql) => queryInterface.sequelize.query(sql)
    await q(`ALTER TABLE direct_messages DROP COLUMN IF EXISTS "readAt"`)
    await q(`ALTER TABLE direct_messages DROP COLUMN IF EXISTS "subject"`)
    await q(`ALTER TABLE direct_messages DROP COLUMN IF EXISTS "kind"`)
  },
}
