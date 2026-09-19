<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Computer — Firmware Specification v1

**Companion document to:** `docs/corporate/LOT-COMPUTER-HARDWARE-v1.md` (BOM,
physical form) and `docs/technical/LOT-COMPUTER-SOFTWARE-API-v1.md` (server
connector). Read the hardware doc first — this file assumes its BOM
(Section 03) and notification language (Section 04) as given.

**Status:** SPEC — no firmware has been written. This document defines what
the firmware must do; it is not a description of running code.

---

## 01 // Scope

Firmware runs on the ESP32-S3 (LOT-COMPUTER-HARDWARE-v1.md, Section 03) and
owns exactly five responsibilities:

1. Boot, pair, and hold a device identity (Section 02)
2. Poll onboard sensors on a low-power schedule (Section 03)
3. Compress one wake-to-sleep session into a single sync payload (Section 04)
4. Render incoming notification text to the memory LCD (Section 05)
5. Handle the COPY button press (Section 06)

Nothing else. No local UI beyond the single screen, no menu system, no
on-device settings — every configuration decision lives server-side, in
keeping with the Ambient AI™ rule that hardware complexity is structural,
not surfaced (LOT-AMBIENT-AI-VISION.md).

---

## 02 // Boot, Identity, Pairing

```
POWER ON (first time, unpaired)
  │
  ├─ ATECC608 secure element generates/holds a per-unit key pair
  │  (LOT-COMPUTER-HARDWARE-v1.md, Section 03) — this is the device's
  │  permanent identity, never the operator's LOT credentials.
  │
  ├─ Device has no Wi-Fi credentials yet → starts a local BLE
  │  provisioning window (device advertises as "LOT-COMPUTER-<serial>")
  │
  ├─ Screen shows a short pairing code (derived from the device's public
  │  key, NOT a random session code — so a lost/regenerated code always
  │  reduces to the same physical unit)
  │
  ▼
OPERATOR enters the code at lot-systems.com/pair (server side — see
LOT-COMPUTER-SOFTWARE-API-v1.md, Section 02)
  │
  ▼
SERVER responds over BLE with Wi-Fi credentials + a signed pairing token
bound to the operator's account AND their Usership tier
  │
  ▼
DEVICE stores Wi-Fi credentials (encrypted at rest via the secure
element) and the pairing token. Reboots onto Wi-Fi.
  │
  ▼
GATE: camera and screen stay powered OFF until the server confirms, over
the LOT API connector, that the paired account holds a Usership-tier
profile (LOT-COMPUTER-HARDWARE-v1.md, Section 09 — same activation gate
principle as COSMO® hardware). A free-tier account can pair a unit but
the unit stays dark until upgrade — this is a server-side check, not a
firmware-local rule, so the gate can never be bypassed by flashing
old firmware.
```

Every subsequent boot skips provisioning and goes straight to Wi-Fi
reconnect using stored credentials.

---

## 03 // Sensor Polling

Polling is intentionally sparse. The device is a pager, not a data logger;
battery life (LOT-COMPUTER-HARDWARE-v1.md Section 03, unresolved pending
Proto 1 real measurement) depends on this staying sparse.

| Sensor | Cadence | Wakes MCU from deep sleep? |
|---|---|---|
| VL53L0x (presence) | Continuous, low-power ranging mode | Yes — this is the primary wake source |
| LSM6DS3 (IMU) | On motion interrupt only | Yes — orientation change |
| BME688 (weather/gas) | Every 10 minutes | No — polled during scheduled wake, not a wake source itself |
| Camera | Only during pairing (QR) or an explicit presence-confirm event | No — never continuously powered |
| Qi charge state | Reported by PMIC interrupt | Yes — plug/unplug from base |

Deep sleep is the default state. The device is awake only in response to
one of the interrupt sources above, or a push notification arriving over
Wi-Fi (Section 05).

---

## 04 // Session Compression

Implements LOT-COMPUTER-HARDWARE-v1.md Section 07. A "session" is bounded
by presence-sensor wake → the following deep-sleep re-entry (typically
seconds to low minutes, not hours).

**What is buffered locally, per session:**
- BME688 readings sampled during the session (Section 03 cadence)
- IMU wake events (count + timestamps)
- Any notification text rendered (Section 05) and whether COPY was
  pressed on it (Section 06)

**What is compressed out before sync — the honest boundary:**
This is intentionally the same discipline the benchmark protocol applies
to its own session reports (docs/benchmark/LOT-DOCTRINE.md — record what
is real, mark what is provisional): the firmware sends **deltas**, not
raw samples. A BME688 series of `[21.4, 21.4, 21.5, 21.4, 21.6]` over ten
minutes compresses to one reading plus a trend flag, not five data
points. This is a real, mechanical compression rule (fewer bytes on the
wire), not a claim of AI summarization happening on-device — no on-device
language model is proposed here, none exists in the BOM (Section 03 of
the hardware doc lists no such part), and none should be implied.

**Sync trigger:** end of session (deep-sleep re-entry) OR every 15
minutes during an extended wake, whichever comes first — so a session
that never sleeps (e.g., device face-up on a desk all day) still syncs
periodically rather than buffering unbounded.

---

## 05 // Notification Rendering

Inbound path: server → device, over the LOT API connector
(LOT-COMPUTER-SOFTWARE-API-v1.md, Section 04 — transport TBD, candidates
are MQTT or a long-lived WebSocket; not yet decided, marked OPEN there).

```
NOTIFICATION ARRIVES (device asleep or awake)
  │
  ├─ MCU wakes (if asleep)
  ├─ Payload is a single short string (server-side length cap — see
  │  software/API doc, Section 04) — firmware does no truncation logic
  │  of its own, it trusts the server to have already fit the line to
  │  the Sharp Memory LCD's character width at the fixed font size
  ├─ Memory LCD redraws once — this is the only screen write of the
  │  cycle (memory LCDs hold their image with the refresh line idle,
  │  so "idle" per Section 04 of the hardware doc costs zero ongoing
  │  power)
  ├─ Message is retained in the session buffer (Section 04) in case
  │  COPY is pressed later in the same session
  ▼
MCU returns to deep sleep (or stays awake if presence sensor still
reads "near")
```

No animation, no scroll, no sound, no vibration. One redraw, then
silence — the firmware-level expression of "no alarm."

---

## 06 // COPY Button Handling

```
BUTTON PRESSED
  │
  ├─ MCU wakes if asleep (button is a hard interrupt source in addition
  │  to the sources in Section 03)
  ├─ Firmware reads whatever string is currently latched in display
  │  memory (Section 05) — it does not re-fetch from the server, it
  │  copies exactly what is on screen, matching the button's literal
  │  name
  ├─ Marks that message COPY=true in the session buffer (Section 04)
  ├─ Sends an immediate out-of-band sync (does not wait for the
  │  15-minute/session-end trigger — a COPY press is a user-initiated
  │  action and should land in the Log tab promptly)
  ▼
Server-side write to the Log tab — exact route OPEN, see
LOT-COMPUTER-SOFTWARE-API-v1.md, Section 03
```

If the device is offline when COPY is pressed, the marked entry stays in
the session buffer and sends on next reconnect — never silently dropped,
never blocked on connectivity.

---

## 07 // OTA Updates

Not yet designed in detail — marked OPEN for the Proto 1 stage
(LOT-COMPUTER-HARDWARE-v1.md, Section 08). The only commitment made
here: OTA must verify a signature against the same secure element
identity established at pairing (Section 02), so a device cannot be
remotely flashed by anything other than a release signed by LOT Systems.
No OTA mechanism has been selected (ESP-IDF's native OTA partition
scheme is the default candidate, not yet confirmed).

---

## 08 // Open Items

Marked explicitly rather than silently assumed, per benchmark doctrine
("an honest gap is worse to hide than to state"):

- Exact battery capacity (Section 03 sensor cadence assumes a target,
  not a measured result — Proto 1 measures it for real).
- Transport protocol for server→device push (Section 05).
- Exact Log-tab write endpoint (Section 06).
- OTA update mechanism (Section 07).

None of these block writing this specification. All of them block
writing the first line of firmware code, and must be closed before
Proto 0 (LOT-COMPUTER-HARDWARE-v1.md, Section 08) begins.

---

*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*S-2: VADIK MARMELADOV*
