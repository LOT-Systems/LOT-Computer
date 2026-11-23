'use strict'
// LOT·01 hardware pager tables (docs/hardware/lot-01). Additive only; unused unless LOT_DEVICES_ENABLED=true.
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        serial        TEXT NOT NULL,
        hw            TEXT NOT NULL DEFAULT 'lot-01',
        fw            TEXT,
        token_hash    TEXT UNIQUE,
        name          TEXT DEFAULT 'LOT-01',
        last_seen_at  TIMESTAMPTZ,
        telemetry     JSONB NOT NULL DEFAULT '{}',
        revoked_at    TIMESTAMPTZ,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS device_pairings (
        device_code   TEXT PRIMARY KEY,
        user_code     TEXT UNIQUE NOT NULL,
        serial        TEXT NOT NULL,
        hw            TEXT, fw TEXT,
        user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        expires_at    TIMESTAMPTZ NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS device_notifications (
        id            BIGSERIAL PRIMARY KEY,
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text          VARCHAR(64) NOT NULL,
        kind          TEXT NOT NULL DEFAULT 'nudge',
        deliver_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        ttl_s         INTEGER NOT NULL DEFAULT 21600,
        acked_at      TIMESTAMPTZ,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS device_notifications_user_deliver
        ON device_notifications (user_id, deliver_at);
    `)
  },
  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS device_notifications;
      DROP TABLE IF EXISTS device_pairings;
      DROP TABLE IF EXISTS devices;
    `)
  },
}
