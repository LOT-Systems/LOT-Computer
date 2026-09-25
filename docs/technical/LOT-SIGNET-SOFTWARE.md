================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-SIGNET-SOFTWARE
TITLE:    LOT® SIGNET™ — Host Software / LOT API Connector v.0
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-25
VERSION:  0.1 — SPEC, NO CODE WRITTEN
STATUS:   PLANNING — companion to docs/corporate/LOT-SIGNET-HARDWARE-v0.md
          and docs/technical/LOT-SIGNET-FIRMWARE.md
================================================================================

Filed separately per the brief's item 10 ("software to connect with
firmware") and item 11 ("separate documents"). This is the piece that sits
between SIGNET's BLE link (firmware doc Section 03) and the real,
already-running LOT backend (src/server/routes/api.ts).

--------------------------------------------------------------------------------
01 // WHAT ALREADY EXISTS (verified this session, not assumed)
--------------------------------------------------------------------------------

  fastify.post('/logs', ...)   src/server/routes/api.ts:1563-1587
    Mounted at POST /api/logs. Body: { text, event?, metadata? }.
    Creates a row via src/server/models/log.ts. This is the exact
    endpoint SIGNET's "Copy" button needs to hit (hardware doc Section
    06). It requires NO changes to accept SIGNET traffic.

  Auth gate   src/server/index.ts (~line 300-321)
    `/api/*` sits behind a fastify onRequest hook that 401s unless
    `req.user` is set. `req.user` is populated ONLY by a cookie-session
    lookup. THIS IS THE GAP: nothing today lets a non-browser client
    (a phone app acting on SIGNET's behalf, or SIGNET itself if the
    ESP32-C3/Wi-Fi path is chosen per firmware doc Section 01) obtain a
    `req.user` without a browser cookie.

  src/server/routes/public-api.ts
    Confirmed to contain no API-key or device-token auth branch —
    checked directly, not inferred from absence of documentation.

--------------------------------------------------------------------------------
02 // WHAT THIS DOCUMENT SCOPES (new work, not yet built)
--------------------------------------------------------------------------------

  C1  DEVICE-PAIRING TOKEN (backend)
      A new authenticated endpoint (e.g. `POST /api/devices/pair`, name
      not final) that a logged-in LOT user calls from the web app to
      mint a long-lived opaque token, analogous to a personal access
      token, scoped to write-only access on `/api/logs`. Storage: a new
      `DeviceTokens` table (userId, token hash, label, createdAt,
      lastSeenAt) — modeled on the existing `Log` model's Sequelize
      pattern (src/server/models/log.ts) rather than inventing a new
      persistence style.

  C2  DEVICE AUTH BRANCH (backend)
      Extend the `/api` onRequest hook (or add a sibling prefix, e.g.
      `/api/device`) to accept `Authorization: Bearer <device-token>`,
      resolve it against C1's table, and set `req.user` to the owning
      user — so `POST /api/logs` itself needs zero changes (hardware doc
      Section 06 already notes this).

  C3  HOST APP (phone or hub)
      The piece that actually holds C1's token and speaks HTTPS to LOT.
      Responsibilities:
        - Pairs with a SIGNET unit over BLE (scans for the GATT service
          firmware doc Section 04 will allocate UUIDs for).
        - DOWNLINK: subscribes to LOT's existing notification-worthy QIE
          events (hardware doc Section 05) and BLE-writes short text to
          the device. NEW WORK: LOT's backend has no push-to-external-
          device channel today (checked: no webhook/SSE-to-BLE bridge
          exists) — C3 will need either a polling loop against a new
          "pending notifications" read, or a server-sent-events
          subscription (the repo already uses SSE elsewhere per
          docs/benchmark/LOT-LEDGER.md's "Cross-Device Sync ... SSE
          sync" entry — reuse that pattern rather than inventing a
          second one).
        - UPLINK: on a BLE notify from firmware M4, calls
          `POST /api/logs` with `Authorization: Bearer <C1 token>` and
          `event: 'signet_copy'`.
      Platform (native iOS/Android vs. a small dedicated hub device) is
      NOT decided here — it is an open product question, not a software
      architecture one, and is left for S-2.

  C4  EVENT TAG CONVENTION
      `event: 'signet_copy'` for uplink writes (hardware doc Section 06).
      `metadata` on that log carries `{ deviceId, sensorReading }` from
      firmware M5 — `metadata` is already a free-form JSONB column
      (src/server/models/log.ts), so this needs no migration.

--------------------------------------------------------------------------------
03 // SEQUENCING
--------------------------------------------------------------------------------

C1 and C2 (backend) can and should ship before any SIGNET hardware
arrives — they are pure software, testable with a curl request standing
in for a device, and they unblock C3's development against a real
endpoint instead of a mock. This is the "v.0b BACKEND PREREQUISITE" step
in docs/corporate/LOT-SIGNET-HARDWARE-v0.md Section 08's roadmap. C3
depends on C1/C2 existing and on firmware doc Section 04's GATT UUIDs
being allocated; it does not depend on the physical enclosure or the
PCBWay order.

--------------------------------------------------------------------------------
04 // OPEN QUESTIONS FOR NEXT SESSION
--------------------------------------------------------------------------------

  - Push mechanism for C3's downlink (poll vs. reuse the existing SSE
    sync pattern) — leaning SSE reuse, not decided.
  - Whether C3 is a full mobile app or a minimal always-on hub — product
    decision for S-2.
  - Token revocation UX (what happens in the Log tab / Settings when a
    user un-pairs a SIGNET unit) — not scoped here.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-SIGNET-SOFTWARE
================================================================================
