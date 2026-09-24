================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER
ON-DEVICE FIRMWARE SPECIFICATION
================================================================================

DOCUMENT    LOT-COMPUTER-FIRMWARE-SPEC / REV A
ISSUE DATE  2026.09.24
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
COMPANION   docs/technical/LOT-COMPUTER-HARDWARE-SPEC.md   (the metal)
            docs/technical/LOT-COMPUTER-SOFTWARE-API-SPEC.md (the server side)

Kept as a separate document from the software/API spec by design (S-2 brief,
point 11): a firmware engineer needs the sleep budget, the sensor bus map,
and the flash layout — not the Fastify route table, and vice versa.

================================================================================

## 00  TARGET + TOOLCHAIN

```
MCU              ESP32-S3 (WROOM-1, 8MB PSRAM) — see HARDWARE-SPEC 02, item 1
FRAMEWORK        ESP-IDF (not Arduino-core) — direct camera DVP driver
                 access and fine-grained light-sleep control matter more
                 here than Arduino convenience
LANGUAGE         C (ESP-IDF native) for the core loop; firmware size and
                 power budget do not leave room for a managed runtime
OTA              ESP-IDF native OTA (dual-partition A/B) over WiFi, signed
                 images only (see 05)
```

================================================================================

## 01  POWER BUDGET — THE "PAGER" CONSTRAINT

The whole device is judged on whether it survives on a coin-sized cell
between Qi charges without becoming another thing to plug in. Every
subsystem below is gated by this.

```
STATE            DISPLAY          RADIO             SENSORS         DRAW (est.)
-----            -------          -----             -------         -----------
DEEP SLEEP        static (Memory   off                off             ~20-50 uA
                  LCD holds image
                  with zero power
                  when static)
SENSOR POLL       static           off (buffered)    BME280+VEML7700  ~2-5 mA,
                  (wakes MCU only                     poll every       burst <1s
                  briefly)                            10 min
WIFI SYNC         static           WiFi TX/RX,        —                ~80-150 mA,
                  briefly                             burst <5s
NEW NOTIFICATION  redraw (~200ms   —                  —               ~15-25 mA,
                  refresh, Memory                                     burst
                  LCD is a fast
                  1-bit panel)
CAMERA CAPTURE    —                WiFi TX for        —               ~120-200 mA,
                  (event-driven,                      upload                burst <2s
                  not continuous)
BUTTON PRESS      brief screen     WiFi TX (signal     IMU wake        ~80-120 mA,
                  ack               POST)              source          burst <2s
```

DESIGN RULE: the device defaults to DEEP SLEEP. Every other state is a
timed or event-driven excursion, never a steady state. Continuous camera
streaming or continuous WiFi association are explicitly OUT OF SCOPE for
Rev A firmware — they would burn the 300-400mAh cell in hours, not days.

TARGET RUNTIME: 5-7 days between Qi charges at the default 10-minute
sensor poll + 1 WiFi sync per poll cycle. This is an ESTIMATE pending a
real current-draw measurement on the S3 bring-up prototype (HARDWARE-SPEC
05, stage S1-S2) — mark it PROVISIONAL until measured.

================================================================================

## 02  MAIN LOOP

```
BOOT
  -> load config from NVS (WiFi creds, device API key, poll interval)
  -> if unpaired: enter PROVISIONING MODE (see 03)
  -> else: enter DEEP SLEEP, wake on timer or GPIO interrupt

WAKE SOURCES
  TIMER (10 min default)   -> SENSOR POLL cycle
  GPIO (COPY button)       -> BUTTON PRESS cycle
  GPIO (IMU tap/pickup)    -> DISPLAY WAKE cycle (show last notification
                              + battery/status glyph for 3s, back to sleep)
  RTC (remote push waiting)-> WIFI SYNC cycle (see 03 below, polling model)

SENSOR POLL CYCLE
  1. Read BME280 (temp/humidity/pressure), VEML7700 (ambient light)
  2. Compress this poll's readings against the last-sent baseline —
     only queue a delta if it crosses a threshold (temp +/-0.5C, RH
     +/-3%, pressure +/-1hPa, light +/-30% relative) — see 06,
     COMPRESSION
  3. If nothing crosses threshold: back to sleep, no radio use.
  4. If something crossed: join WIFI SYNC cycle to flush the queued
     delta (batched with any pending notification poll, never a
     radio wake for sensor data alone if a sync is already due).

WIFI SYNC CYCLE
  1. Associate WiFi (cached credentials, no scan if BSSID unchanged
     recently)
  2. GET notification poll against the LOT API connector (see
     SOFTWARE-API-SPEC 02) — short-poll, not persistent socket
     (ESP32-S3 + always-on socket is a bigger power cost than a
     30-60s poll interval; SSE/WebSocket is a Rev B option once real
     draw numbers justify it)
  3. If a notification is pending: redraw Memory LCD with the short
     text line (pager-style, single line, ~20 char budget — see 04)
  4. POST any queued sensor delta / button signal
  5. Disassociate WiFi, back to sleep

BUTTON PRESS CYCLE (COPY)
  1. Debounce (50ms), confirm single press vs. held (held = reserved
     for a future function, e.g. factory-reset combo — see 05)
  2. Capture: read current sensor snapshot + (if a notification is
     showing) which notification was on-screen at press time
  3. Immediate WIFI SYNC to POST the signal event (see SOFTWARE-API-
     SPEC 02, device_copy event) — the whole point of the button is
     that the press-to-Log-tab round trip is fast, so this cycle does
     NOT wait for the next scheduled poll
  4. Screen shows a brief ack glyph (checkmark), back to sleep
```

================================================================================

## 03  PROVISIONING (FIRST PAIR)

```
1. Device boots unpaired -> BLE advertises as "LOT-COMPUTER-<serial>"
2. Operator pairs via the LOT web app (a new pairing flow — see
   SOFTWARE-API-SPEC 03) which pushes WiFi credentials + a freshly
   issued device API key over BLE (encrypted BLE GATT characteristic,
   not cleartext)
3. Device stores credentials in NVS (encrypted partition, ESP32-S3
   flash encryption enabled — see 05), reboots into the main loop
4. First WIFI SYNC confirms pairing server-side; screen shows a one-
   time "Connected" glyph
```

No WiFi credentials or API key are ever set via a QR code containing
plaintext secrets — BLE pairing scoped to the operator's own logged-in
session is the only path, to avoid a device that can be silently re-paired
by anyone in range.

================================================================================

## 04  DISPLAY PROTOCOL — PAGER TEXT

```
BUDGET        1 line, ~20 characters, Memory LCD 128x128 at a legible
              fixed-width size (larger glyph = fewer characters; this
              is a hard constraint, not a UI nicety — the server side
              must truncate/author within this budget, see SOFTWARE-
              API-SPEC 02)
EXAMPLES      "Coffee time!"          "Weather: rain soon"
              "Streak: 12 days"       "Battery low — dock me"
LIFECYCLE     A new notification replaces the prior one on screen;
              there is no on-device history or scroll — the device is
              a pager, not a reader. Full history lives in the Log
              tab on the site, not on the device.
STATUS GLYPHS Small persistent corner glyph set (battery level, WiFi
              last-sync-ok/stale, weather icon) drawn alongside the
              text line, not replacing it.
```

================================================================================

## 05  SECURITY + RECOVERY

```
FLASH ENCRYPTION   ESP32-S3 flash encryption + secure boot enabled at
                    manufacture (HARDWARE-SPEC 05, stage S5-S6) — a
                    physically stolen device cannot be read out for
                    the WiFi credentials or device API key.
OTA                 Signed images only, dual-partition A/B rollback —
                    a bad OTA push cannot brick the fleet; device
                    rolls back to the last-known-good partition on
                    boot failure.
DEBUG / DFU HEADER  4-pad pogo header (HARDWARE-SPEC 03) is the only
                    physical recovery path if OTA and the running
                    partition are both bad — requires opening the
                    shell, i.e. physical possession, by design.
FACTORY RESET       Button-held (>10s) combo, screen confirms with a
                    countdown glyph before wiping NVS — prevents an
                    accidental long-press from silently unpairing.
```

================================================================================

## 06  COMPRESSION (PER-SESSION, POINT 8 OF THE S-2 BRIEF)

"Compress the information in each session" is a firmware-side data
question first (send deltas, not raw polls — 02 above) and a server-side
question second (fold device signals into the Memory Engine's existing
Log/compression pipeline rather than opening a parallel history). The
device side is deliberately simple and is specified in full here:

```
RULE   Never transmit a sensor reading that has not moved past its
       threshold since the last transmitted reading (02, step 2).
       Never wake WiFi for sensor data alone if no threshold was
       crossed. A button press or a pending-notification poll always
       transmits immediately regardless of thresholds — those are
       the two truly latency-sensitive paths (COPY has to land in the
       Log tab fast; a notification has to draw promptly).
```

The server-side half of "compress the information in each session" —
folding this device's events into the existing Memory Engine compression
architecture (docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md)
rather than starting a second, device-only history — is specified in
SOFTWARE-API-SPEC.md, section 04.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.24
================================================================================
