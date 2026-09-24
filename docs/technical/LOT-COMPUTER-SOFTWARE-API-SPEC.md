================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER
SOFTWARE / LOT API CONNECTOR SPECIFICATION
================================================================================

DOCUMENT    LOT-COMPUTER-SOFTWARE-API-SPEC / REV A
ISSUE DATE  2026.09.24
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
COMPANION   docs/technical/LOT-COMPUTER-HARDWARE-SPEC.md    (the metal)
            docs/technical/LOT-COMPUTER-FIRMWARE-SPEC.md    (the device loop)

Kept separate from the firmware doc by design (S-2 brief, point 11): this
is the server-side half — new Fastify routes, the pairing flow, and how a
device event becomes a row in the Log tab. No code has been written yet;
this is the integration plan for whoever picks up the implementation, cited
against the LIVE repo as it stands on 2026-09-24.

================================================================================

## 00  WHAT ALREADY EXISTS (repo audit, this session)

```
FINDING                                                        LOCATION
--------                                                        --------
Route registry — 4 groups, Fastify plugin pattern               src/server/routes/index.ts:14-19
                 (auth /auth, api /api, admin-api /admin-api,
                 public-api /api/public)
Auth is cookie/JWT ONLY — no API-key or device-auth              src/server/routes/auth.ts:297,322
                 scheme exists anywhere in the codebase
Log model + "Log tab" UI already live, event-typed               src/client/components/Logs.tsx
                 (answer, emotional_checkin, plan_set,           src/client/hooks/useLogContext.ts
                 self_care_complete, intention, note)
Signal system already live — recordSignal(source, signal,       src/client/stores/intentionEngine.ts:199
                 metadata), synced to server, rendered live      src/client/components/SignalStreamWidget.tsx
                 in a terminal-style feed
"User OS" status endpoint — closest existing precedent for       src/server/routes/os-api.ts:32
                 a device-facing status read, but JWT-gated,
                 not device-key-gated
Email (Resend) exists for transactional mail only — no push,     src/utils/email.ts:9-36
                 SMS, WebSocket, or SSE infra in the stack        package.json (no ws/socket.io/web-push dep)
```

CONCLUSION: the Log tab and signal pipeline the COPY button needs to feed
already exist and are mature — new work is the device-auth layer and the
notification-poll endpoint, not a parallel logging system.

================================================================================

## 01  NEW ROUTE FILE

```
src/server/routes/device-api.ts     New Fastify plugin, registered in
                                     src/server/routes/index.ts alongside
                                     the existing 4 groups, prefix
                                     /api/device — following the same
                                     registerXRoutes(fastify) pattern
                                     already used by the other 4 files.
```

Kept as its own file rather than folded into public-api.ts because it has
a different trust model (device API key, not session cookie) and a
different lifecycle (paired once, long-lived, revocable independent of
any human session).

================================================================================

## 02  ENDPOINTS

```
METHOD  PATH                          AUTH            PURPOSE
------  ----                          ----            -------
POST    /api/device/pair              user JWT         Called FROM the
                                       (existing        logged-in web app
                                       cookie auth,     during BLE
                                       operator must    provisioning
                                       be logged in)     (FIRMWARE-SPEC 03)
                                                         — issues a new
                                                         device API key,
                                                         creates a Device
                                                         row linked to the
                                                         operator's account,
                                                         returns the key to
                                                         be pushed over BLE
                                                         (never returned to
                                                         the device over an
                                                         unauthenticated
                                                         channel)

GET     /api/device/notify            device API key   Short-poll, called
                                       (Bearer header,  every WIFI SYNC
                                       HMAC-signed       cycle (FIRMWARE-
                                       request body      SPEC 02). Returns
                                       recommended       either {none} or a
                                       once volume        single queued
                                       justifies it)      notification, pre-
                                                          truncated server-
                                                          side to the ~20-
                                                          char pager budget
                                                          (FIRMWARE-SPEC 04)
                                                          BEFORE it is sent
                                                          — the device does
                                                          not do its own
                                                          truncation logic.

POST    /api/device/signal            device API key   Device -> server.
                                                         Body: {event:
                                                         'device_copy' |
                                                         'device_sensor',
                                                         payload: {...},
                                                         ts}. See 03 for
                                                         what happens to
                                                         this on arrival.

DELETE  /api/device/pair              user JWT          Unpair / revoke —
                                                          invalidates the
                                                          device API key
                                                          server-side.
                                                          Required before
                                                          a device can be
                                                          re-paired to a
                                                          different account
                                                          (e.g. resale,
                                                          replacement unit).
```

Device API keys are bearer tokens scoped to exactly one operator account
and one physical device serial, stored hashed (not plaintext) server-side
— the same posture the codebase already takes with session secrets
(src/server/routes/auth.ts), applied to a new credential type rather than
reusing the cookie/JWT path, which cannot be presented by a headless
device.

================================================================================

## 03  PAIRING FLOW (END TO END)

```
1. Operator, logged into lot-systems.com, opens "Pair a LOT Computer"
   (new UI surface — not scoped in this document, flagged for a future
   session)
2. Web app calls POST /api/device/pair (JWT auth) -> server creates
   Device row {operator_id, serial, api_key_hash, paired_at}, returns
   the raw key ONCE
3. Web app pushes {WiFi SSID/PSK, device API key} to the device over
   BLE GATT (FIRMWARE-SPEC 03) — the raw key is never stored in the
   web app's own state past this call
4. Device's first GET /api/device/notify confirms pairing; Device row
   gets last_seen_at set
```

================================================================================

## 04  DEVICE SIGNAL -> LOG TAB (THE COPY BUTTON PATH)

This is the concrete integration point for point 16 of the S-2 brief
("button as COPY, signal back to the site's Log tab"):

```
1. POST /api/device/signal arrives, event: 'device_copy'
2. Server validates the device API key -> resolves operator_id
3. Server writes a new Log row: event: 'device_copy', with payload
   carrying whatever notification text (if any) was on-screen at
   press time + the sensor snapshot from FIRMWARE-SPEC 02 step 2 of
   the BUTTON PRESS CYCLE
4. formatLog() (client-side log formatting — the function the repo
   audit flagged as the single point where an event type must have
   an explicit case or it silently vanishes from the Memory Engine's
   view, per docs/benchmark/LOT-DOCTRINE.md clause 1) gets a new
   case for 'device_copy' — THIS IS THE ONE MANDATORY CODE CHANGE for
   the button to actually reach the Memory Engine's prompt context,
   not just sit in the Log tab UI unread by the AI.
5. Existing client-side sync (recordSignal('device', 'copy_pressed',
   metadata) in src/client/stores/intentionEngine.ts, next scheduled
   sync) picks the row up with ZERO additional frontend plumbing —
   it already renders in Logs.tsx and SignalStreamWidget.tsx once the
   Log row and the formatLog() case exist.
```

Same path, different event type, handles 'device_sensor' (weather /
motion deltas from FIRMWARE-SPEC 02) — those feed the Log tab too, but at
a lower priority / no formatLog() case needed unless S-2 wants ambient
sensor data visible to the Memory Engine's question generation, which is
a product decision for a later session, not assumed here.

================================================================================

## 05  NOTIFICATION AUTHORING (SERVER -> DEVICE)

"Send a pager-like notification from an AI-powered site" (point 2) is a
queue-and-poll model, not a push model, in Rev A — matching the polling
GET /api/device/notify in 02 (no WebSocket/SSE dependency exists in the
stack today per 00; adding one is a Rev B option once device volume
justifies the infra cost of a persistent-connection layer).

```
SOURCE OF NOTIFICATION TEXT   Not a new AI call per notification — reuse
                               the existing Memory Engine's per-operator
                               context (already assembled for chat/
                               widgets) to decide WHEN a short line like
                               "Coffee time!" is worth sending, then
                               author it within the ~20-char budget
                               (FIRMWARE-SPEC 04). Full design of the
                               triggering logic (what conditions fire a
                               notification) is out of scope for this
                               document — flagged for a dedicated
                               product-design session.
QUEUE                          One pending notification per device at a
                               time (Rev A) — a new one overwrites an
                               unread one rather than stacking a backlog
                               the device has no way to show (the device
                               is a pager, not an inbox — FIRMWARE-SPEC
                               04).
```

================================================================================

## 06  SESSION COMPRESSION (SERVER SIDE, POINT 8)

Per FIRMWARE-SPEC 06, the device already sends deltas, not raw polls. The
server-side half is: do not open a parallel "device history" table.
Device signals become Log rows in the SAME table and SAME formatLog()
compression path documented in docs/technical/MEMORY-ENGINE-COMPRESSION-
ARCHITECTURE.md — the Memory Engine's existing per-session prompt
assembly (head + quantumContext + plannerContext + goalContext +
formattedLogs, per docs/benchmark/LOT-DOCTRINE.md clause 2) picks up
device events automatically once 04's formatLog() case exists, with no
second compression system to build or keep in sync.

================================================================================

## 07  OPEN ITEMS (NOT SPECIFIED HERE — FLAG FOR NEXT SESSION)

```
- Web UI surface for "Pair a LOT Computer" (step 1 of 03) — not designed
  in this document.
- Rate limiting on /api/device/signal and /api/device/notify — the repo
  already uses @fastify/rate-limit elsewhere; device-api.ts should reuse
  it, exact limits not set here.
- Notification-triggering product logic (05) — what actually earns a
  "Coffee time!" push is a product decision, not an engineering one.
- Multi-device-per-operator support (a household with more than one LOT
  Computer) — schema above assumes 1 Device row per pairing, doesn't
  assume 1-per-operator, but the UI/UX for managing several is unscoped.
```

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.24
================================================================================
