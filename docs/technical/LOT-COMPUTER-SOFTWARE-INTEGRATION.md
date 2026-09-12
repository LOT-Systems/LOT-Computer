================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — SOFTWARE / LOT API INTEGRATION
================================================================================

DOCUMENT    SW-SPEC / LOT-COMPUTER v0.1
ISSUE DATE  2026.09.12
CLASS       INTERNAL / BUILD
COMPANION   LOT-COMPUTER-FIRMWARE-SPEC.md (the device side of every contract
            below)

This document specifies how the firmware in LOT-COMPUTER-FIRMWARE-SPEC.md
talks to the live lot-systems.com backend. Every endpoint marked EXISTS
below was read directly from this repository's source (src/server/routes/
api.ts) on 2026-09-12; every endpoint marked NEW WORK does not exist yet and
is scoped here as backend work this project requires, not assumed.

================================================================================

## 00  "USE LOT API CONNECTOR" — WHAT THAT MEANS HERE

The LOT Computer is a third client of the same account, alongside the web
app and (per docs/corporate/LOT-TERMINAL-M2M.md) the open-source LOT
Terminal hardware line. It does not get a parallel, hardware-only API. It
authenticates as the operator and calls the same routes the web client
calls, plus one new device-pairing route.

================================================================================

## 01  THE "COPY" BUTTON → LOG TAB (source brief, point 16)

```
STATUS    EXISTS — POST /logs is live today.

REQUEST   POST /logs
          Authorization: device bearer token (see Section 03 — NEW WORK)
          Content-Type: application/json
          {
            "text": "Coffee time!",             // last notification shown,
                                                  // or "" if none pending
            "event": "hardware_copy",            // NEW event string —
                                                  // must be added to the
                                                  // displayableEvents
                                                  // whitelist, api.ts:1084,
                                                  // per this repo's own
                                                  // Backend Whitelist
                                                  // Hygiene doctrine
                                                  // (LOT-DOCTRINE.md) or
                                                  // the entry is written
                                                  // but never shown in
                                                  // the Log tab.
            "metadata": {
              "device_id": "lot-computer-<serial>",
              "photo_attached": true
            }
          }

RESPONSE  The created Log row (existing behavior, unchanged).
```

WHY "hardware_copy" AND NOT THE M2M INTAKE PATH: LOT-TERMINAL-M2M.md
describes a separate, not-yet-live `POST /v1/m2m/intake` for anonymous or
pseudonymous hardware-fleet telemetry aimed at the S-2 marketplace. The
Copy button is different in kind — it is the operator's own account writing
to their own Log, same as any other widget on the site. It belongs on
`POST /logs`, not the M2M path. Do not conflate the two.

PHOTO ATTACHMENT: `POST /logs` today accepts `text`, `event`, `metadata`
only — no binary/image field (confirmed by reading the route handler). Two
options, pick one before firmware freeze:
    (a) Upload the JPEG to existing media storage first (if this repo has
        one — not confirmed in this pass), get a URL, put the URL in
        `metadata.photo_url`.
    (b) NEW WORK: extend `POST /logs` to accept a `photo` field.
This document does not pick for S-2; it flags the gap.

================================================================================

## 02  NOTIFICATIONS → DEVICE (source brief, point 2)

```
STATUS    PARTIAL — GET /sync (SSE) exists and is live (api.ts:326), but it
          currently emits "live_message" and "settings_updated"-class
          frames for the web UI. It does not emit a device-notification
          frame today.

NEW WORK  1. Define what triggers a device notification server-side. The
             source brief's own example — "Coffee time!" — reads as a
             scheduled/contextual nudge, which is exactly the shape of
             this repo's existing scheduled-jobs.ts output (the QIE job
             system already writes Log entries like morning_coherence_
             launch, signal_momentum, etc. on a cron). The natural design
             is: reuse that job pipeline, and when a job decides a message
             is worth surfacing to a paired hardware device, emit it on
             GET /sync as:
               { "event": "device_notification",
                 "data": { "text": "Coffee time!", "ttl_seconds": 600 } }
             scoped to the owning userId, same isolation rule this repo's
             doctrine already enforces for settings_updated (LOT-DOCTRINE.md
             § Cross-Device Sync: "never broadcast to all clients").
          2. The device (Section 02 of the firmware spec) is just another
             SSE subscriber — no protocol change on the wire beyond the
             new event name.
```

================================================================================

## 03  DEVICE PAIRING + AUTH (source brief, "LOT API connector")

```
STATUS    NEW WORK — no device-token issuance path exists in this repo
          today. The web app authenticates via session cookie; that model
          does not fit a headless device with no browser.

PROPOSED  POST /devices/pair
          Body: { "pairing_code": "483920" }   // shown on the device screen
          Auth: normal logged-in session (operator does this FROM the web
                app, pointing at their own account)
          Effect: server mints a long-lived, revocable device token bound
                  to that userId; device (still in SoftAP captive portal,
                  per FIRMWARE-SPEC Section 01) picks it up over the same
                  captive-portal exchange and stores it in NVS.

          GET /devices            list paired devices, for a future
                                   "Devices" settings panel (not scoped
                                   further here — out of this document's
                                   range; flagged as follow-on work).
          DELETE /devices/:id     revoke a device token (lost/replaced
                                   unit).
```

Device tokens, not the web session cookie, so a stolen or discarded unit
can be individually revoked without touching the operator's browser
session — the same reasoning this repo already applies to scoped SSE
delivery (Cross-Device Sync doctrine) extended to a non-browser client.

================================================================================

## 04  WEATHER DATA → LOG (source brief, points 14/15)

```
STATUS    EXISTS, no new work. `weather_update` is already a member of the
          displayableEvents whitelist (api.ts:1098). The firmware's
          15-minute SessionSummary upload (FIRMWARE-SPEC Section 05) posts
          to the same POST /logs route as Section 01, with:
            { "text": "22.5C / 45% / 1013hPa",
              "event": "weather_update",
              "metadata": { "device_id": "...", "gas_ohms": 118500 } }
```

================================================================================

## 05  PDF MANUALS + FIRMWARE/SOFTWARE DOC SEPARATION (points 7, 9, 10, 11)

Per the source brief's explicit instruction to keep these as separate
documents rather than one merged file:

```
docs/technical/LOT-COMPUTER-HARDWARE-SPEC.md          plan, BOM, roadmap
docs/technical/LOT-COMPUTER-FIRMWARE-SPEC.md           firmware (this doc's
                                                        companion, device side)
docs/technical/LOT-COMPUTER-SOFTWARE-INTEGRATION.md    this file — API
                                                        contract, server side
docs/technical/LOT-COMPUTER-MANUAL.md  (+ .pdf twin)   operator-facing setup
                                                        and use manual
```

The PDF twin follows this repo's existing convention (e.g.
docs/corporate/CQGS-WHITE-PAPER.pdf alongside its .md snapshot): the .md is
the editable source of truth, the .pdf is a generated, shippable artifact
for anyone receiving a physical unit.

================================================================================

## 06  OUTSTANDING SERVER-SIDE WORK (summary, for the next assembly pass)

```
1. Add "hardware_copy" to displayableEvents (api.ts:1084).            SMALL
2. Add "device_notification" SSE frame emission on GET /sync,         MEDIUM
   scoped by userId, sourced from the scheduled-jobs pipeline.
3. Build POST /devices/pair, GET /devices, DELETE /devices/:id and    MEDIUM
   the device-token auth middleware.
4. Decide + implement the photo-attachment path for POST /logs        SMALL-
   (Section 01).                                                      MEDIUM
```

None of this is implemented by this document — it is the scoped, ordered
punch list for the engineering pass that follows this planning session.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.12
================================================================================
