================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: COSMO-SIGNAL-SOFTWARE-INTEGRATION
TITLE:    COSMO® Signal — Software / LOT API Connector Specification
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-07
VERSION:  1.0 — PLANNING (NO SERVER CODE WRITTEN YET)
COMPANION: COSMO-SIGNAL-v1-HARDWARE-PLAN.md, COSMO-SIGNAL-FIRMWARE.md
================================================================================

This document specifies what lot-systems.com does to talk to a COSMO®
Signal unit — the site/server side of the boundary the firmware document
(COSMO-SIGNAL-FIRMWARE.md) draws at the Wi-Fi link. Kept as a separate
document per S-2 brief item 11.

--------------------------------------------------------------------------------
01 // v.1 — API SURFACE THAT ALREADY EXISTS (NO NEW BACKEND CODE)
--------------------------------------------------------------------------------

Confirmed present in src/server/routes/ today (grep-verified, 2026-09-07):

  READ (device polls every 30s, firmware Section 03):
    GET /api/os/insights     — src/server/routes/os-api.ts
    GET /api/os/status       — src/server/routes/os-api.ts
    Device uses whichever field the Ambient AI decision engine already
    populates as "the current one-line thing to say" — this document
    does NOT invent a new insights field; it consumes whatever
    LOT-AMBIENT-AI-VISION.md's existing decision layer already produces
    for LOT® Station / LOT® Brush and treats COSMO® Signal as a third
    consumer of that same "exact moment" signal, not a parallel system.

  WRITE (COPY button, firmware Section 02 button_mgr):
    POST /api/logs           — src/server/routes/api.ts:1563
    Body: { text: string, event?: string, metadata?: object }
    COSMO® Signal sends:
      { text: "<currently displayed message>",
        event: "cosmo_signal_copy",
        metadata: { device_id, battery_pct, timestamp } }
    This lands in the operator's Log tab exactly as a manual entry
    would — no schema change, no migration required.

  AUTH: Device holds a long-lived operator-scoped auth token, obtained
  during BLE pairing (firmware Section 04) via the existing JWT auth
  flow (README.md's JWT_SECRET / JWT_COOKIE_KEY pattern) — device
  authenticates as the operator, the same way an authenticated browser
  session would, rather than requiring a new device-identity auth
  system for v.1.

  WHAT v.1 DOES NOT REQUIRE: any new route, migration, or schema change.
  This is intentional — a hardware pilot should not be gated on backend
  development. It runs entirely on endpoints that already ship.

--------------------------------------------------------------------------------
02 // v.2 — UPGRADE PATH (SERVER-SIDE WORK, NO FIRMWARE OR HARDWARE CHANGE)
--------------------------------------------------------------------------------

LOT-TERMINAL-M2M.md and LOT-TERMINAL-SYNC.md already fully specify this
target state; it is not re-specified here, only mapped to COSMO® Signal:

  PUSH READ:  wss://sync.lot-systems.com/m2m/intake
              (real-time, <100ms — replaces the v.1 30s poll)
  RICH WRITE: POST https://api.lot-systems.com/v1/m2m/intake
              Authorization: Bearer <operator_token>
              Uses the "Multi-Sensor Array" JSON shape from
              LOT-TERMINAL-M2M.md — device_id, operator, sensors[]
              (now populated with the BME688 + IMU readings the
              firmware already caches per firmware doc Section 02, but
              does not transmit in v.1), status, timestamp.
              Response includes intelligence_score / consumers_reached
              per the existing M2M spec — COSMO® Signal becomes a real
              M2M data source once this ships, feeding the same
              Intelligence Score pipeline LOT-TERMINAL-M2M.md already
              defines for the "Psychotronic Weather Station" example.

  WORK REQUIRED (backend, not yet built — confirmed by grep, no `m2m`,
  `webhook`, `iot`, or `device` route exists in src/server/routes/
  today):
    - Implement /v1/m2m/intake per the schema already frozen in
      LOT-TERMINAL-M2M.md.
    - Implement the sync.lot-systems.com WebSocket gateway per
      LOT-TERMINAL-SYNC.md's three-layer architecture (Identity/Auth,
      Data Sync, Marketplace Integration) — COSMO® Signal only needs
      the first two layers; Marketplace Integration is out of scope for
      this device.
    - This is deliberately treated as OUT OF SCOPE for the 100-unit
      pilot (manufacturing roadmap Phase 4) — v.1 ships and validates
      hardware/firmware against today's API surface; v.2 is a pure
      backend project that upgrades fielded units via OTA once ready.

--------------------------------------------------------------------------------
03 // SITE-SIDE SURFACES NEEDED (NEW, SMALL, v.1-SCOPE)
--------------------------------------------------------------------------------

Two small additions to lot-systems.com are needed for v.1 — both are
site/UI work, not new API routes:

  1. /pair — a pairing page that receives a short pairing ID (typed or
     scanned from the device's on-screen QR, firmware Section 04),
     authenticates the requesting operator, and issues a device auth
     token bound to their account. This can piggyback on the existing
     JWT issuance flow rather than inventing new token machinery.

  2. Log tab rendering — no change required. `event: "cosmo_signal_copy"`
     entries render through whatever the Log tab already renders for
     any log entry with an `event` field; if the Log UI currently
     ignores unknown event types and shows raw text only, that is
     already sufficient for v.1 (a distinct icon/styling for
     cosmo_signal_copy entries is a nice-to-have for a later session,
     not a v.1 requirement).

--------------------------------------------------------------------------------
04 // WHAT THE DEVICE NEVER TALKS TO
--------------------------------------------------------------------------------

Per hardware plan Section 04 (camera scope) and Section 01 (privacy
gate): no image, video, or raw camera frame is ever part of any request
this device makes, in v.1 or the v.2 upgrade path. The M2M "sensors[]"
array in v.2 carries only BME688/IMU numeric readings, matching the
existing "no personal health data in M2M protocol" security rule
already stated in LOT-TERMINAL-M2M.md.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END COSMO-SIGNAL-SOFTWARE-INTEGRATION
================================================================================
