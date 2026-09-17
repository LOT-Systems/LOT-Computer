<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# COSMO® SIGNAL — FIRMWARE SPECIFICATION

```
================================================================================
DOCUMENT    COSMO-SIGNAL / FIRMWARE-SPEC
ISSUE DATE  2026.09.17
CLASS       INTERNAL / BUILD
SIBLING DOCS  COSMO-SIGNAL-HARDWARE-SPEC.md (the object) ·
              COSMO-SIGNAL-SOFTWARE.md (the backend it talks to)
================================================================================
```

Kept separate from the hardware spec because firmware iterates on a sprint
timescale while the physical BOM iterates on a manufacturing-quote
timescale — see hardware spec §09.

---

## 01 — TARGET & TOOLCHAIN

| ITEM              | CHOICE                                    | WHY                          |
|--------------------|--------------------------------------------|-------------------------------|
| MCU                | ESP32-S3-WROOM-1-N8R8                       | native camera DVP interface + WiFi/BLE, matches hardware spec §03 U1 |
| Framework          | ESP-IDF (not Arduino core)                  | direct access to deep-sleep + RTC-memory retention needed for e-ink battery budget |
| Language           | C, with a thin C++ wrapper around the HTTP client | matches ESP-IDF idioms; no need for Arduino compatibility layer |
| OTA                | ESP-IDF native OTA (dual app partition)     | a device shipped in a sealed stainless shell must be field-updatable without disassembly |
| Build/CI           | PlatformIO project, built headless in CI    | reproducible builds outside any one dev machine |

---

## 02 — POWER BUDGET (the actual design constraint)

The whole firmware architecture exists to serve one number: **battery life
between wireless-charger touches should be measured in weeks, not
hours**, because the object's whole point is that it sits on a desk and
is honest, not a phone you also have to remember to charge.

```
STATE                       DRAW        DURATION PER CYCLE
─────                       ────        ──────────────────
Deep sleep (radio off)       ~10µA       most of the time
Wake + poll /api/device/notify  ~80mA avg  ~400ms (WiFi assoc + HTTPS GET)
E-ink full refresh            ~26mA       ~2s (only on message change)
BME280 sample                 ~0.7mA      ~10ms, piggybacked on poll wake
Camera capture (v2 feature)   ~120mA      ~200ms, NOT part of default poll cycle
```

Default poll interval: **every 15 minutes**, RTC-timer wake from deep
sleep. At that cadence, radio-on time is under 0.05% of the duty cycle —
the 500mAh battery (hardware spec §03 U6) should comfortably clear 3-4
weeks between Qi top-ups even with a full e-ink refresh on most wakes.

**Design rule:** nothing may hold the WiFi radio associated outside an
explicit wake window. Any firmware change that adds a background task
touching the radio must update this table and get a battery-life
regression test run before merge (see §05).

---

## 03 — STATE MACHINE

```
                    ┌─────────────┐
        RTC timer   │  DEEP SLEEP │   COPY button (GPIO interrupt,
        (15 min) ──►│   (~10µA)   │◄── wakes immediately, does not
                    └──────┬──────┘   wait for the poll timer)
                           │
                           ▼
                  ┌──────────────────┐
                  │   WAKE + ASSOC    │  connect WiFi (cached creds),
                  │                    │  read BME280
                  └────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              ▼                          ▼
     button-wake path             timer-wake path
     POST /api/device/log         GET /api/device/notify
     { type: "device_copy" }      -> message | 204
              │                          │
              │                 ┌────────┴────────┐
              │                 ▼                 ▼
              │           new message        no change
              │           -> e-ink redraw     -> skip redraw
              │                 │                 │
              └────────┬────────┴─────────────────┘
                        ▼
                POST /api/device/telemetry
                { battery_mv, rssi }
                        │
                        ▼
                  DEEP SLEEP
```

Every wake ends in the telemetry POST (hardware spec §05) — this is the
one unconditional network call per cycle, and it is what the fleet-health
view in the software doc depends on to detect a dead or unreachable unit.

---

## 04 — PAIRING (first boot)

1. Unit ships with a printed pairing code etched near the COPY button
   (laser-etched during the PCBWay CNC back-shell step — hardware spec
   §02).
2. On first boot with no stored WiFi credentials, the ESP32 opens a
   **BLE provisioning** session (ESP-IDF `wifi_provisioning` component) —
   the LOT web app's account settings page (new UI, tracked in the
   software doc, not built this session) scans for it and pushes WiFi
   creds + the pairing code over BLE.
3. Firmware calls `POST /api/device/pair { pairing_code }`, receives and
   persists `device_token` in NVS (flash), and never repeats provisioning
   unless factory-reset (10-second COPY-button hold).

No WiFi credentials or device token are ever hardcoded or shipped
pre-provisioned — every unit pairs itself to whichever LOT account scans
its code, keeping the 100-unit production run identical firmware images.

---

## 05 — TESTING BEFORE ANY OTA PUSH

- **Battery regression**: bench test against a calibrated power profiler
  for 48h simulated (accelerated poll interval), confirm draw stays inside
  §02's table before shipping any firmware update.
- **Notify/copy round-trip**: automated test hitting a staging instance of
  `/api/device/notify` and `/api/device/log`, confirming a message
  written server-side appears on a physical unit's e-ink within one poll
  cycle, and a COPY press appears in that account's Log tab within one
  request.
- **OTA rollback**: every OTA image must boot and successfully complete
  one full wake cycle before the bootloader marks the new app partition
  valid — a bad update self-reverts to the previous known-good image
  rather than bricking a sealed stainless unit in the field.

---

## 06 — OPEN ITEMS FOR NEXT FIRMWARE SESSION

- Camera capture path (hardware spec §06 v2 feature) is stubbed but not
  implemented — no ambient-presence logic exists yet.
- `/api/device/pair`, `/api/device/notify`, `/api/device/log`,
  `/api/device/telemetry` are specified in the software doc but not yet
  implemented server-side — firmware development against a live backend
  is blocked on that work landing first.

================================================================================
LOT SYSTEMS CORPORATION · COSMO® HARDWARE DIVISION            LOS ANGELES, CA
END OF FIRMWARE SPECIFICATION                                       2026.09.17
================================================================================
