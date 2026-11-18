'use strict'
// DRAFT for S2: LOT TILE device tables. When approved, copy to /migrations/<timestamp>_add-lot-tile-devices.cjs
// Spec: hardware/lot-tile/docs/06-LOT-API-CONNECTOR.md §2
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        serial TEXT UNIQUE NOT NULL,
        name TEXT,
        token_hash TEXT UNIQUE,
        fw_version TEXT,
        mode TEXT NOT NULL DEFAULT 'calm',
        camera_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        battery_pct INT,
        last_seen_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS device_notifications (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
        text VARCHAR(96) NOT NULL,
        kind TEXT NOT NULL DEFAULT 'nudge',
        source TEXT NOT NULL DEFAULT 'ai',
        deliver_at TIMESTAMPTZ NOT NULL,
        delivered_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS device_notifications_user_pending
        ON device_notifications (user_id, deliver_at) WHERE delivered_at IS NULL;
      CREATE TABLE IF NOT EXISTS device_event_seqs (
        device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
        seq BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (device_id, seq)
      );
      CREATE TABLE IF NOT EXISTS device_pair_codes (
        code CHAR(6) PRIMARY KEY,
        serial TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL
      );
    `)
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS device_pair_codes;
      DROP TABLE IF EXISTS device_event_seqs;
      DROP TABLE IF EXISTS device_notifications;
      DROP TABLE IF EXISTS devices;
    `)
  },
}
