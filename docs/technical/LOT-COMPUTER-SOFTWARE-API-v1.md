<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Computer — Software / LOT API Connector Spec v1

**Companion document to:** `docs/corporate/LOT-COMPUTER-HARDWARE-v1.md`
(physical device) and `docs/technical/LOT-COMPUTER-FIRMWARE-v1.md` (what
runs on-device). This document specifies the server side: how
lot-systems.com talks to a paired LOT® Computer unit.

**Status:** SPEC — no server route described here has been implemented.
Existing routes it extends (`docs/technical/OS_API.md`) are real and live;
everything device-specific below is new and unbuilt.

---

## 01 // Why a Connector, Not a New API Surface

`docs/technical/OS_API.md` already models each LOT user as a measurable
system (`/api/os/status`, `/api/os/version`). The LOT® Computer connector
is not a parallel API — it is a device-shaped client of the same account,
plus a small number of new, device-specific routes this document scopes.
A paired unit is an additional way the operator's existing account state
reaches them; it does not create a second identity.

---

## 02 // Pairing Endpoint — `lot-systems.com/pair`

Referenced from LOT-COMPUTER-FIRMWARE-v1.md, Section 02. Operator-facing
web flow:

1. Operator opens `lot-systems.com/pair` while logged in.
2. Enters the pairing code shown on the device screen (derived from the
   device's ATECC608 public key — LOT-COMPUTER-HARDWARE-v1.md, Section 03).
3. Server looks up the device's public key against the code, confirms no
   existing pairing, and checks the operator's Usership tier
   (`/api/os/status` equivalent tier field — exact field TBD, see
   Section 05).
4. Server issues Wi-Fi credentials (short-lived, BLE-transport only,
   never stored server-side beyond the pairing session) and a signed
   pairing token binding `device_id ↔ user_id ↔ tier_at_pairing`.
5. Server does **not** activate camera/screen features remotely at this
   step — activation is a live tier check the device performs every
   session (Section 05), so a tier downgrade after pairing takes effect
   without a firmware update or a revocation call.

This intentionally keeps "is this unit allowed to be on" a live,
re-checked question rather than a one-time grant — matching the COSMO®
precedent that a soul-linked or profile-linked unit "deactivates if
profile disconnected" (LOT_ROBOTICS_COSMO.md).

---

## 03 // Device → Server: Session Sync (includes COPY)

Implements LOT-COMPUTER-FIRMWARE-v1.md Sections 04 and 06. Candidate
route: `POST /api/computer/sync` (device-authenticated via the signed
pairing token, not a user session cookie).

**Payload (SPEC, not final):**
```json
{
  "device_id": "...",
  "session_id": "...",
  "sensor_summary": {
    "temp_c": 21.5,
    "trend": "rising",
    "gas_index": 0.42
  },
  "imu_wake_count": 3,
  "messages": [
    { "text": "Coffee time!", "shown_at": "...", "copied": true }
  ]
}
```

**Server-side fan-out on receipt:**
- `sensor_summary` feeds the same Weather widget pipeline LOT® Station
  already feeds (LOT-AMBIENT-AI-VISION.md, "LOT® Station — Weather + Air
  Quality") — the device is a second sensor source into an existing
  pipeline, not a new one.
- Any `messages[]` entry with `copied: true` writes to the operator's
  **Log tab**. This is Requirement 16 of the originating brief and the
  one item in this whole spec still genuinely open: the exact existing
  write path the Log tab (`route: 'logs'`, confirmed live in
  `src/client/components/ui/Layout.tsx` line 72) reads from was not
  located in `src/server` during this session's research pass. Rather
  than invent a plausible-looking route name, this is marked **OPEN**:
  the concrete next step is a short repo dig (grep the chat/log message
  Prisma model and its create call) before Proto 0 firmware can call a
  real endpoint. Do not hardcode a guessed path against this spec.

---

## 04 // Server → Device: Notification Push

Implements LOT-COMPUTER-FIRMWARE-v1.md, Section 05. Source of the
message text is the same AI layer already producing Story-Reports and
Memory questions elsewhere in the product — the Index of Systems / QIE —
not a new AI system. This document defines only the **transport and
contract** for getting that text onto the device:

**Contract (decided):**
- One short line of plain text, UTF-8, no markup.
- Server truncates/wraps to fit the Sharp Memory LCD's fixed character
  width (LOT-COMPUTER-HARDWARE-v1.md, Section 03) before sending — the
  firmware performs no truncation of its own (LOT-COMPUTER-FIRMWARE-v1.md,
  Section 05).
- Rate limit: no more than one push per device per 20 minutes, hard
  server-side cap — a direct, load-bearing expression of the Ambient
  AI™ "no alarm" rule enforced at the API layer, not left to firmware
  discipline alone.

**Transport (OPEN — not yet decided):**
Two candidates, neither selected:
  (a) MQTT — better battery profile for a persistent low-power device,
      requires standing up a broker.
  (b) Long-lived WebSocket against the existing server — reuses existing
      infrastructure, worse battery profile on the ESP32-S3 side.
Decision deferred to Proto 0 bring-up, where real battery data
(LOT-COMPUTER-HARDWARE-v1.md Section 03's open battery question) can
inform which cost matters more.

---

## 05 // Tier Gate — Live, Not Cached

Every session sync (Section 03) response includes a fresh tier check;
the device does not cache "am I allowed to be active" beyond one
session. Exact field name/shape in the existing user/account model that
represents Usership tier was not confirmed against `src/server` schema
in this session — marked **OPEN**, same honesty rule as Section 03's
Log-tab route. The hardware document's Section 09 ethics commitment
(camera/screen dark until verified) depends on this gate; it must be
resolved before Proto 0, not deferred past it.

---

## 06 // Open Items Summary

- Exact Log tab write route (Section 03) — grep `src/server` for the
  chat/log model's create path.
- Exact Usership-tier field/shape (Section 05).
- Push transport: MQTT vs. WebSocket (Section 04).
- Pairing token revocation flow if a device is lost/stolen (not yet
  specified at all — noted here so it isn't forgotten, not because a
  design exists).

---

*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*S-2: VADIK MARMELADOV*
