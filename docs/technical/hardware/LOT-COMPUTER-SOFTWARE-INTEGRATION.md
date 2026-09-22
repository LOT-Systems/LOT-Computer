================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — SOFTWARE / LOT API CONNECTOR SPEC
================================================================================

DOCUMENT    LOT-COMPUTER-SOFTWARE-INTEGRATION
ISSUE DATE  2026.09.22
CLASS       INTERNAL / BUILD
GROUNDING   Read against the live repo, not invented: `src/server/routes/
            os-api.ts` (existing `/api/os/*` routes, Log model usage),
            `src/server/models/log.ts` (the real Log schema), `src/server/
            routes/public-api.ts` (existing `weather` util import), and
            `src/client/components/ui/Layout.tsx` line 72 (`{ label: 'Log',
            route: 'logs' }` — the real "Log" tab this device writes to).

================================================================================

## 00  WHAT ALREADY EXISTS (do not rebuild)

```
Log model         src/server/models/log.ts
                   fields: id, userId, text, event, metadata (JSONB),
                   context (JSONB), createdAt, updatedAt
                   -> a hardware button press is just a new Log row with
                      event: 'hardware_copy' — the Log tab already renders
                      the logs table, so no new UI is needed for point 16,
                      only a new row source.

OS status route    src/server/routes/os-api.ts  GET /api/os/status
                   -> reference pattern for how a route reads req.user.id,
                      queries models, and replies — the hardware routes
                      below follow this same file's shape, added as a new
                      registerHardwareRoutes(fastify) alongside
                      registerOSRoutes(fastify) in src/server/routes/api.ts.

Weather util       src/server/utils/weather.ts (used by public-api.ts)
                   -> the device's local BME680 reading and the site's own
                      weather API are two different sources for the same
                      concept; see 04 for how they reconcile.

Auth (existing)    Session/cookie-based (req.user populated per-request);
                   no existing bearer/API-key device-auth pattern found in
                   this repo. Section 01 proposes a NEW device-token scheme
                   because a stainless object with a screen cannot do a
                   browser login flow — this is a genuine gap, not an
                   oversight in this document.
```

================================================================================

## 01  PAIRING (device token, new)

```
1. Device boots unpaired -> BLE advertises a short-lived pairing code
   (6 digits, shown on-screen, point 18's screen doing double duty).
2. User enters that code in the LOT web app (existing session, already
   logged in) -> POST /api/hardware/pair { code } (NEW route)
   -> server mints a long-lived device token scoped to that userId only
      (not a full session token — narrower: valid for the 3 hardware
      routes in 03 only, revocable independently of the user's login
      sessions).
3. Server pushes the token to the device over the still-open BLE link
   (not WiFi — the device has no WiFi credentials yet at this point).
4. Device stores the token + WiFi credentials (entered via the same BLE
   pairing flow) in NVS (non-volatile storage), reboots into IDLE.
```

Token storage server-side: a new small table (`hardware_devices`: id,
userId, tokenHash, pairedAt, lastSeenAt, revokedAt) — not layered onto the
existing user-session table, so revoking a lost device never touches the
owner's own login.

================================================================================

## 02  THREE ROUTES (new file: src/server/routes/hardware-api.ts,
registered as registerHardwareRoutes(fastify) next to registerOSRoutes)

```
POST /api/hardware/pair
  body: { code: string }
  auth: existing user session (this call is made FROM the browser, by
        the logged-in owner, not from the device)
  -> creates hardware_devices row, returns device token (server relays
     it to the device over BLE per 01 step 3 — the token itself never
     transits WiFi/HTTP to the device in this design)

GET /api/hardware/notify
  auth: device token (header, e.g. X-LOT-Device-Token)
  -> 204 if nothing new, else { text, icon, ttl_s } (FIRMWARE-SPEC 02)
  -> server-side: reads whatever the Memory Engine's proactive-prompt
     logic already decided to say (this route does not generate new
     content — it is a thin read of an existing queue/decision, keeping
     the "what to say" logic in one place: the Memory Engine, not
     duplicated into a hardware-specific text generator)

POST /api/hardware/log
  auth: device token
  body: { event: 'hardware_copy', ts: <device-local ISO time> }
  -> fastify.models.Log.create({ userId: device.userId, event:
     'hardware_copy', text: null, metadata: { device_id, ts },
     context: { source: 'lot-computer' } })
  -> this row appears in the user's existing Log tab immediately;
     point 16 is satisfied by this one write, no new tab/view needed.
```

`GET /api/hardware/firmware` (OTA manifest, FIRMWARE-SPEC 06) is a fourth
route in the same file, unauthenticated-by-version-hash (firmware update
checks should not fail closed if a device token expires) — noted here so
the route count in 03 of the ROADMAP's "next session" list is accurate.

================================================================================

## 03  WHAT THE "AI-POWERED SITE" ACTUALLY SENDS (point 2)

`GET /api/hardware/notify` does not invent a new AI feature — it exposes
whatever the existing Memory Engine / proactive-context system already
produces as a candidate check-in prompt (the same engine behind the
"Notice: Each question builds on the last" behavior described in the
project's own README). The hardware connector's job is narrow: take
whatever short proactive line the engine already has queued for this
user, fit it to the FIRMWARE-SPEC 05 character budget, and hand it back.
No separate "hardware AI" is being proposed — one brain, one more output
surface.

================================================================================

## 04  WEATHER: TWO SOURCES, ONE DISPLAY (point 14 vs. existing weather.ts)

The device carries a local BME680 (BOM 01) for on-object temperature/
humidity/pressure/VOC. The site already has its own weather source
(`src/server/utils/weather.ts`, used in `public-api.ts`'s health check).
These are NOT merged into one number silently — the local sensor answers
"what is it like right where this object sits" (a desk, which may be
indoors and nothing like outdoor conditions the site's weather API
reports), while the site's weather.ts answers "what is it like outside."
v1 scope: the local BME680 reading is included in the device's own
telemetry (a future `POST /api/hardware/telemetry`, not yet built) but is
NOT what drives an outdoor-weather notification — that stays the site's
existing weather.ts, consistent with point 2's "notification FROM an
AI-powered site," not from the object's own sensor deciding things alone.

================================================================================

## 05  FAILURE MODE

Device offline (no WiFi, dead battery, out of range): `POST /api/hardware/
log` fails client-side per FIRMWARE-SPEC 03 (no retry queue in v1) —
recorded here as a real gap, not silently designed around. A Log entry
that never happened because the object was offline is a known, accepted
v1 limitation, not a bug to chase.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END LOT-COMPUTER-SOFTWARE-INTEGRATION                                2026.09.22
================================================================================
