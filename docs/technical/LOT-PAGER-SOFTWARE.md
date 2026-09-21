================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER — SOFTWARE (backend connector)
================================================================================

DOCUMENT    PAGER-SOFTWARE / v1
ISSUE DATE  2026.09.21
CLASS       INTERNAL / BUILD
STATUS      PLANNING — no server code written yet
PARENT      docs/technical/LOT-PAGER-SPEC.md (physical design, BOM, roadmap)
SIBLING     docs/technical/LOT-PAGER-FIRMWARE.md (on-device state machine)

================================================================================

## 00  WHAT THIS COVERS

The lot-systems.com side of the connection: how a notification the Memory
Engine decides to send reaches a specific paired device, and how a COPY
button press becomes a Log tab entry. This is new surface area on the
existing Fastify backend (src/server/routes/), not a parallel system —
it sits next to api.ts, os-api.ts, public-api.ts as a new pager-api.ts
route module, and reuses the M2M intake protocol already named in NODE 19
(docs/assembly/LOT-GENESIS-v1.md:718-724).

================================================================================

## 01  NEW ROUTES (proposed — none built yet)

```
POST /api/pager/pair              Exchange a short-lived pairing code
                                   (shown as a QR on lot-systems.com) for
                                   a long-lived operator_token. One-time
                                   per device.

GET  /api/pager/notifications     Device polls this on its wake cycle
     ?device_id=...               (LOT-PAGER-FIRMWARE.md §01 LISTEN state).
                                   Bearer <operator_token> required.
                                   Returns at most one pending short-text
                                   notification, or 204 if none.

POST /api/pager/ack               Device posts the COPY button press.
                                   Body: { device_id, operator, metric:
                                   "button_press", value: "copy" } — M2M
                                   intake format 1, unmodified.
                                   Writes one log entry via the existing
                                   log-append path (same one every other
                                   signal source uses) tagged PAGER-ACK:,
                                   visible in the operator's Log tab
                                   (src/client/components/Logs.tsx).
```

No WebSocket/SSE push to the device — LOT's existing realtime layer (SSE)
is built for an open browser tab; a battery device polls instead
(PAGER-SPEC §03). SSE stays exactly as it is for the web client.

================================================================================

## 02  NOTIFICATION SOURCE — WHO DECIDES TO SEND "COFFEE TIME!"

The brief's own example ("Coffee time!") lines up with existing Memory
Engine behavior — README.md already documents the engine following up on
"morning beverage preference" / tea-ritual patterns. The pager notification
source is proposed as a thin new emitter on top of that existing
inference, not a new AI decision layer:

```
Memory Engine pattern match (existing)
        |
        v
New: pager-eligible check — does this operator have a paired device?
        |
        v
Short-text compression: existing engine output -> <=24 char pager string
("Coffee time!" style — a display constraint, not a new writing voice)
        |
        v
Written to a pending-notification queue, one row per device, consumed by
the device's next GET /api/pager/notifications poll.
```

The compression step (long-form Memory Engine prompt -> short pager string)
is the one genuinely new piece of logic. Everything else — pattern
detection, log writing — reuses what already exists.

================================================================================

## 03  PAIRING UI (new surface, not yet designed)

A QR-pairing screen needs to exist somewhere in the operator interface
(likely Settings, per the existing tab structure in LOT-SYSTEM-OUTLINE.md
— System / Sync / Log / Settings). Scope not yet fixed; flagged as a
Phase 4 design task in PAGER-SPEC §04, not assumed solved here.

================================================================================

## 04  DATA MODEL (proposed, not migrated)

```
pager_devices        device_id (PK) · operator_id (FK) · operator_token_hash ·
                      paired_at · last_seen_at

pager_notifications   id (PK) · device_id (FK) · text · created_at ·
                      delivered_at (null until first poll returns it)
```

Two small tables, consistent with the existing 11-table Postgres schema
(LOT-SYSTEM-OUTLINE.md §02) — no new database engine, no new ORM. Sequelize
models alongside the existing 11.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.21
================================================================================
