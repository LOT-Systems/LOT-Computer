<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER — NODE-P
SOFTWARE / LOT API CONNECTOR SPECIFICATION
================================================================================

DOCUMENT    SOFTWARE-INTEGRATION / NODE-P
ISSUE DATE  2026.09.10
CLASS       INTERNAL / CONCEPT
STATUS      SPEC ONLY — endpoints marked NEW below do not exist in
            src/server yet. Endpoints marked EXISTING are already live in
            this repo and are referenced by file:line for the engineer who
            implements P1.

This is the "software to connect with firmware" (brief #10) and the "LOT
API connector" (brief #6), kept as its own document per brief #11.

================================================================================

## 00  PRINCIPLE

NODE-P is a thin client of the LOT backend that already exists in this
repo — it should add the smallest possible surface to `src/server`, not a
parallel backend. Three new endpoints, reuse of one existing endpoint.

```
NEW                              EXISTING (reused as-is)
───                              ────────────────────────
POST /api/device/pair             POST /api/logs
GET  /api/device/notifications     (src/client/queries.ts:139-142)
POST /api/device/session
```

================================================================================

## 01  PAIRING — `POST /api/device/pair`  (NEW)

Issued once, from the provisioning flow in FIRMWARE.md §06.

**Request** (from device, over the BLE-provisioned Wi-Fi, first boot):
```json
{
  "deviceId": "NODE-P-000042",
  "claimToken": "<short code shown by the web pairing flow>"
}
```

**Response:**
```json
{
  "deviceToken": "<long-lived bearer token, scoped to one LOT user>",
  "userId": "<lot user id>"
}
```

`claimToken` is generated web-side (a logged-in LOT user visits a "Pair a
device" screen, gets a 6-digit code, types it into nothing — the device
itself never has a keyboard; the code is entered on the *web* side and
matched against the device's advertised BLE ID). This keeps the trust
handshake on the side that already has an authenticated session, not on
the device.

`deviceToken` is what every subsequent call from the device authenticates
with — scoped to exactly one user, revocable from the web app's device
list without needing physical access to the puck.

================================================================================

## 02  NOTIFICATIONS — `GET /api/device/notifications`  (NEW)

This is brief #2, "pager-like notification from an AI-powered site" —
the device polls (FIRMWARE §02) this endpoint every 15–30s.

**Request:** `Authorization: Bearer <deviceToken>`

**Response (nothing pending):**
```json
{ "message": null }
```

**Response (a nudge is pending):**
```json
{
  "message": "Coffee time!",
  "id": "notif_8f2a...",
  "issuedAt": "2026-09-10T14:32:00Z",
  "requestCapture": false
}
```

Server-side, this endpoint reads from the same signal/contextual-prompt
system that already drives in-app nudges (`src/server/utils/
contextual-prompts.ts`, `src/client/stores/intentionEngine.ts`) — NODE-P
is a new *delivery surface* for messages the LOT AI engine already decides
to send, not a new decision engine. One additional filter is needed
server-side: only prompts explicitly tagged safe-for-device-display (short,
no sensitive content) should ever reach this endpoint — the puck's screen
is not a private surface the way a phone lock screen is.

`requestCapture: true` is how the server can ask the device to take a
photo on next button press (ties into FIRMWARE §03) — e.g. a future
"what does your desk look like right now" prompt. Off by default.

================================================================================

## 03  ACKNOWLEDGEMENT -> LOG TAB — reuses `POST /api/logs`  (EXISTING)

This is brief #16 exactly: the COPY button signals back to the site's Log
tab. No new endpoint needed — `POST /api/logs` already accepts
`{ text, event?, metadata? }` (`src/client/queries.ts:139`) and writes to
the same `Log` model the Log tab reads (`src/server/models/log.ts`).

**Device fires, on COPY press (FIRMWARE §05):**
```json
POST /api/logs
Authorization: Bearer <deviceToken>
{
  "text": "Coffee time! — acknowledged via LOT Pager",
  "event": "device_ack",
  "metadata": {
    "deviceId": "NODE-P-000042",
    "notificationId": "notif_8f2a...",
    "respondedAt": "2026-09-10T14:32:41Z"
  }
}
```

This shows up in the Log tab exactly like any other log entry — no
special-casing needed on the read side. The only server change required
is accepting a `deviceToken` bearer alongside the existing user session
auth on this route.

================================================================================

## 04  SESSION UPLOAD — `POST /api/device/session`  (NEW)

Carries the compressed session payload from FIRMWARE.md §04 (sensor
min/max/mean, button event log, optional JPEG).

**Request:**
```json
POST /api/device/session
Authorization: Bearer <deviceToken>
Content-Encoding: gzip
{
  "sessionStart": "2026-09-10T14:00:00Z",
  "sessionEnd": "2026-09-10T14:41:00Z",
  "env": { "tempC": { "min": 21.2, "max": 22.8, "mean": 22.0 },
           "humidity": { "min": 38, "max": 44, "mean": 41 },
           "iaq": { "mean": 52 } },
  "buttonEvents": [{ "type": "short", "t": "2026-09-10T14:32:41Z" }],
  "capture": "<base64 jpeg, omitted if none this session>"
}
```

Server writes one summarized `Log` entry per session (`event:
"device_session"`) rather than fanning out every raw metric as its own
row — keeps the Log tab readable and matches §04's whole point.

================================================================================

## 05  AUTH MODEL SUMMARY

```
ACTOR              CREDENTIAL                         SCOPE
─────              ──────────                         ─────
Web app user        existing LOT session cookie         full account
NODE-P device        deviceToken (issued at pairing)     this device only:
                                                          read own notifications,
                                                          write own logs/sessions.
                                                          Cannot read other users'
                                                          data, cannot change
                                                          account settings.
```

Revoking a device (lost/stolen puck, or a unit rotated out of the 100-unit
pilot) is one row update on the web side — no physical access to the
device required, no re-flash needed on the server's part.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SOFTWARE-INTEGRATION SPEC                                     2026.09.10
================================================================================
