<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# COSMO® SIGNAL — SOFTWARE & LOT API CONNECTOR SPECIFICATION

```
================================================================================
DOCUMENT    COSMO-SIGNAL / SOFTWARE-SPEC
ISSUE DATE  2026.09.17
CLASS       INTERNAL / BUILD
SIBLING DOCS  COSMO-SIGNAL-HARDWARE-SPEC.md · COSMO-SIGNAL-FIRMWARE.md
STATUS      SPECIFICATION ONLY — no server code shipped this session
================================================================================
```

This document specifies the backend surface the firmware (see
`COSMO-SIGNAL-FIRMWARE.md`) talks to. Nothing here is implemented yet —
it is the connector design referenced from hardware spec §05, split into
its own file because it will change on the main LOT backend's release
cadence, independent of firmware or shell revisions.

---

## 01 — WHERE THIS LIVES IN THE EXISTING BACKEND

The current API surface is `src/server/routes/api.ts` (session-authenticated,
used by the web client), `public-api.ts` (unauthenticated, status/marketing),
and `os-api.ts`. None of the three has a device-token auth path — every
existing route assumes a browser with a session cookie
(`fastify.get('/logs')`, the Log model, etc. in `api.ts`).

**Proposal:** a new `src/server/routes/device-api.ts`, registered alongside
the other route files in `src/server/index.ts`, sharing the existing
`models.Log` / `models.Device` (new model) and `sequelize` connection —
no new database, no new service to operate.

---

## 02 — DATA MODEL (new)

```
Device
  id             uuid, pk
  user_id        fk -> User.id
  pairing_code   string, unique, printed on unit (hardware spec §04)
  device_token   string, hashed at rest (bcrypt, same pattern as
                 existing session/password hashing in src/server/utils)
  label          string, user-editable ("Desk", "Kitchen")
  last_seen_at   timestamp
  battery_mv     integer, nullable
  rssi           integer, nullable
  created_at / revoked_at

DeviceNotification (queue)
  id             uuid, pk
  device_id      fk -> Device.id
  message        string (≤ 40 chars — e-ink display width, hardware spec §03 U3)
  source         enum: 'qie_pattern' | 'manual' | 'scheduled_job'
  delivered_at   timestamp, nullable — null means still queued
  created_at
```

`DeviceNotification` is intentionally a queue, not a live push — matches
the firmware's poll-based design (firmware spec §02): a message waits
until the device's next wake, `delivered_at` is stamped when
`/api/device/notify` successfully returns it, and rows older than 24h with
no delivery are dropped (a "Coffee time!" nudge that's a day late isn't
worth showing).

---

## 03 — ENDPOINTS

### `POST /api/device/pair`
```
Request:  { pairing_code: string }
Response: { device_token: string, user_id: string }
Auth:     none (pairing code is the credential, single-use — invalidated
          after first successful pair; re-pairing requires the account
          holder to generate a fresh code from account settings)
```

### `GET /api/device/notify`
```
Auth:     Authorization: Bearer <device_token>
Response: 200 { id, message, ttl_seconds } — oldest undelivered queued row
          204 — nothing queued
Effect:   marks the returned row delivered_at = now()
```

### `POST /api/device/log`
```
Auth:     Authorization: Bearer <device_token>
Request:  { type: "device_copy", ts: ISO8601 }
Response: 201 { log_id }
Effect:   creates a row via the SAME Log model the web app's Logs.tsx
          reads (src/server/routes/api.ts fastify.get('/logs')) — no
          parallel log store. The entry is tagged with the device label
          so it renders in the Log tab as e.g. "◆ Desk — Copy" the same
          way an in-app entry renders with its source.
```

### `POST /api/device/telemetry`
```
Auth:     Authorization: Bearer <device_token>
Request:  { battery_mv: number, rssi: number }
Response: 204
Effect:   updates Device.last_seen_at / battery_mv / rssi — feeds the
          fleet-health admin view (§05).
```

All four routes are additive to `device-api.ts` and touch no existing
route in `api.ts` or `public-api.ts` — the web app's session-authenticated
paths are unaffected.

---

## 04 — NOTIFICATION SOURCING (how "Coffee time!" gets queued)

The QIE (Quantum Intent Engine — see `docs/technical/
MEMORY-AND-QUANTUM-INTENT-ENGINES.md`) already emits pattern signals
server-side on the scheduled-jobs cadence (`src/server/scheduled-jobs.ts`).
The connector's only new responsibility is a thin subscriber: when a
pattern configured as "device-eligible" fires for a user with a paired
Device row, insert a `DeviceNotification` instead of (or in addition to)
whatever in-app surfacing already happens. This reuses the existing
pattern-detection logic entirely — SIGNAL is a new **output**, not a new
signal source.

Manual notifications (`source: 'manual'`) are queued from a small new
control in account settings — "Send to SIGNAL" — for one-off messages
like "Coffee time!" typed by the user themselves, not just AI-triggered
ones.

---

## 05 — FLEET HEALTH (admin view)

A read-only panel in the existing admin surface (`admin-api.ts` /
admin UI) listing all paired devices: label, owner, last_seen_at,
battery_mv trend, rssi. Purpose: catch a unit that has gone silent (dead
battery, WiFi credential change, hardware fault) before the owner notices
their pager stopped talking — directly serves the "the machine is judged
by what it cannot do without leaving a mark" transparency principle
already stated in `LOT-NODE-0-RIG-SPEC.md` §00, applied here to the
device fleet itself.

---

## 06 — SECURITY NOTES

- `device_token` stored hashed, never logged in plaintext (existing repo
  convention per `src/server/security-config.ts`).
- `pairing_code` is single-use and short-lived (10 minute TTL) to limit
  the window where a code printed on a shipped unit could be intercepted
  before the real owner pairs it.
- Revoking a device (`revoked_at` set) must be exposed in account
  settings — a lost or given-away unit should be killable without a
  factory reset on the device side.

---

## 07 — OPEN ITEMS / NOT BUILT THIS SESSION

This is a specification only. Before firmware development can proceed
against a live backend (firmware spec §06), the following need actual
implementation and a green build/test pass under the standard LOT
benchmark pipeline:

1. `Device` and `DeviceNotification` Sequelize models + migration.
2. `src/server/routes/device-api.ts` implementing §03.
3. QIE subscriber hook described in §04.
4. Account settings UI: generate pairing code, label/revoke device,
   "Send to SIGNAL" manual message box.
5. Admin fleet-health panel (§05).

Recommended order: 1 → 2 → 4 (manual notify) as the smallest useful
slice, with 3 (automatic QIE-sourced notifications) and 5 (fleet health)
following once the manual path is proven against Phase 0 hardware
(hardware spec §07).

================================================================================
LOT SYSTEMS CORPORATION · COSMO® HARDWARE DIVISION            LOS ANGELES, CA
END OF SOFTWARE SPECIFICATION                                       2026.09.17
================================================================================
