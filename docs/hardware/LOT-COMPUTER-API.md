<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Computer — API Connector

Server-side surface the LOT Computer device talks to. This is a proposed
extension, not yet implemented — none of the `/api/device/*` routes below
exist in `src/server/routes/` today. It follows the existing device-facing
pattern already live in `docs/technical/OS_API.md` (`/api/os/*`) rather than
inventing a new convention, and it is kept as its own document, separate
from [`LOT-COMPUTER-FIRMWARE.md`](./LOT-COMPUTER-FIRMWARE.md), per the
founding brief's instruction to keep firmware and software documentation
apart.

## Design Principles (inherited from `OS_API.md`)

1. **Minimalist** — every response is small enough for a microcontroller to
   parse without a JSON streaming library.
2. **One digest, not a feed** — the device never receives more than one
   notification string per poll. Compression happens here, not on-device.
   Reuses `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`.
   *(Founding brief item 8: "compress the information in each session.")*
3. **Same data model as the web app** — a Copy-button press creates a real
   row in the same `Log` table `Logs.tsx` writes to. The device is a second
   input surface, not a parallel system.

## Endpoints

### 1. POST `/api/device/pair`

Pairs a physical unit to a LOT account.

**Request:**
```json
{ "deviceId": "lotc_8f2a91", "pairingCode": "483920" }
```

The `pairingCode` is shown in the LOT web app (Settings → Devices) after the
user scans or enters their `deviceId` (printed on the unit's back shell and
in the box, per the manual). Short-lived, single-use.

**Response:**
```json
{ "paired": true, "userId": "usr_123", "pollIntervalSeconds": 900 }
```

### 2. GET `/api/device/session-digest`

The one-line notification pull. Called on the firmware poll interval.

**Response:**
```json
{
  "headline": "Coffee time.",
  "source": "qos",
  "mode": "growth",
  "generatedAt": "2026-09-09T14:00:00Z",
  "nextPollSeconds": 900
}
```

`headline` is pre-truncated server-side to the display's character budget
(see firmware doc) — never truncated on-device. `source` distinguishes a
QOS-mode-driven line ("You're in recovery mode.") from a Memory-Engine
insight line ("Green tea again? Third day.") from a plain scheduled nudge
("Coffee time.") — useful for later tuning which source performs best on a
tiny screen with no ability to react to it beyond a Copy tap.

### 3. POST `/api/device/log`

The "Copy" button. One press, one row.

**Request:**
```json
{ "deviceId": "lotc_8f2a91", "timestamp": "2026-09-09T14:03:11Z" }
```

**Response:**
```json
{ "logId": "log_9a12", "created": true }
```

Server behavior: creates a `Log` entry for the paired user, timestamped from
the device's own clock (not server receipt time, so a delayed retry from
firmware's local queue still lands at the moment the button was actually
pressed). Appears in the user's Log tab exactly as a manually-typed log
would, with a short device marker (e.g. a small tag) so a person can tell a
Computer-tap apart from a typed entry when reviewing their day.

*(Founding brief item 16: "Button as 'Copy' with a signal back to the
site's Log tab.")*

### 4. POST `/api/device/weather`

Device-reported ambient sensor reading, feeding the same weather-mood
correlation logic already described in `docs/technical/OS_API.md`'s
`insights` endpoint (`weather-mood` insight type) — a second weather source
alongside the existing geocoded API weather, this one literally from the
room the person is in.

**Request:**
```json
{
  "deviceId": "lotc_8f2a91",
  "temperatureC": 21.4,
  "humidityPct": 38,
  "pressureHpa": 1013.2,
  "timestamp": "2026-09-09T14:00:00Z"
}
```

**Response:** `{ "received": true }`

### 5. POST `/api/device/capture` *(v2 — camera-equipped units only)*

**Request:** multipart upload, JPEG frame + `deviceId` + `timestamp`.

**Response:** `{ "captureId": "cap_771", "received": true }`

Gated behind an explicit per-account opt-in (`Settings → Devices → Camera
enabled`), off by default even on camera-equipped hardware. Not implemented
until the SPEC §04 camera decision resolves in v1's favor for a future
revision.

### 6. GET `/api/device/firmware`

**Response:**
```json
{ "version": "1.2.0", "url": "https://cdn.lot-systems.com/fw/lotc-1.2.0.bin", "sha256": "…" }
```

Firmware checks this on each boot and on a slow daily interval; downloads
and applies via the ESP-IDF OTA partition scheme described in the firmware
doc only if the version differs from what's currently flashed.

## Admin Surface

A minimal addition to the existing `admin-api.ts` pattern: a fleet view
listing all paired devices, last check-in time, and firmware version — so
the 100-unit pilot can be monitored without querying the database by hand.
Not a new system; a new table (`devices`) plus a handful of read endpoints
alongside the admin routes that already exist.

## What This API Explicitly Does Not Do

- No bidirectional chat — the device cannot ask LOT anything, it can only
  receive a digest and send a log-tap or a weather reading.
- No raw sensor history storage per device beyond what `weather` already
  persists through the normal Log/insight pipeline — no new time-series
  store stood up just for this.
- No unauthenticated endpoint — every route above requires the device to be
  paired (`pair` issues the device its ongoing auth token, omitted from the
  examples above for brevity but required on every subsequent call).
