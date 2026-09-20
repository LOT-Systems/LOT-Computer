<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
COSMO® CUBE — FIRMWARE SPECIFICATION
================================================================================

DOCUMENT    LOT-COMPUTER-FIRMWARE-SPEC
VERSION     v0.1 (design)
ISSUE DATE  2026.09.20
CLASS       INTERNAL / BUILD
S-2         VADIK MARMELADOV
SEE ALSO    LOT-COMPUTER-HW-SPEC.md (mechanical/BOM), LOT-COMPUTER-CONNECTOR-SPEC.md
            (server-side LOT API connector) — kept SEPARATE per item 11 of the brief.

================================================================================

## 00 — TARGET

MCU: ESP32-S3-WROOM-1 (N16R8). Toolchain: ESP-IDF (not Arduino core) — the
camera driver (esp32-camera component) and I2S mic driver are both native
ESP-IDF components with better documentation than their Arduino wrappers, and
this device needs OTA + deep sleep + BLE provisioning all at once, which is
easier to get right against the raw IDF APIs.

```
FLASH        16MB (firmware + OTA A/B partitions + small local log ring buffer)
PSRAM        8MB (camera JPEG framebuffer + double-buffer for OTA)
RTOS         FreeRTOS (built into ESP-IDF)
POWER MODES  ACTIVE (screen + radio on) / LIGHT-SLEEP (radio on, screen off,
             PIR wake) / DEEP-SLEEP (radio off, PIR/RTC wake only)
```

================================================================================

## 01 — BOOT + PROVISIONING (first power-on)

```
1. Cold boot -> no stored WiFi credentials found
2. Device starts BLE GATT provisioning service (ESP-IDF's built-in
   `wifi_provisioning` component over BLE — no custom protocol needed)
3. Companion phone/desktop flow (LOT Systems account, already logged in)
   scans, sends WiFi SSID/password + a short-lived pairing code
4. Device connects to WiFi, then calls the LOT API connector's
   POST /api/device/pair endpoint (see connector spec) with the pairing
   code -> receives a long-lived device token + assigned device_id
5. Device token stored in NVS (encrypted partition — ESP-IDF NVS encryption,
   not a plaintext credentials file)
6. Display shows a one-time confirmation ("Paired ✓") then goes idle
```

Re-pairing (device changes owner, factory reset) is a long-press on the
"Copy" button (5s) — a deliberate, hard-to-trigger-by-accident gesture, since
it wipes the stored device token.

================================================================================

## 02 — MAIN LOOP

```
STATE          TRIGGER                          ACTION
-----          -------                          ------
IDLE           default                          Screen off/dim, radio in
                                                 light-sleep, PIR armed
NOTIFY         server push arrives (WSS)         Wake screen, buzz motor
                                                 (short pager-style pulse,
                                                 not a phone-length ring),
                                                 render message text
                                                 ("Coffee time!")
AWAKE          PIR fires OR button pressed       Wake screen, show last
                                                 notification + local
                                                 weather reading
COPY-PRESS     "Copy" button short-press         See §03 — the one
                                                 button's entire job
SENSOR-TICK    every 5 min (BME280) /            Batch sensor reading,
               every 60s (light, for             queue for next uplink
               brightness only, not uplinked
               every tick)
OTA-CHECK      daily, 03:00 device-local time    Check for firmware
                                                 update (see §04)
```

The screen defaults OFF, not on. This is a pager-like device (item 2): it
should be invisible until it has something to say, or until the operator
picks it up. A screen that is always-on defeats the "ambient, not another
thing to check" principle in the HW spec's §00.

================================================================================

## 03 — THE "COPY" BUTTON (item 16)

Single button, single job, done honestly rather than overloaded:

```
SHORT PRESS (<1s)   Acknowledge the currently displayed notification.
                    Fires one uplink message: { type: "ack", device_id,
                    notification_id, ts }. Screen shows a brief checkmark,
                    then goes idle. This is what closes the loop back to
                    the Log tab (see connector spec §02 for the exact
                    Log.create() event this becomes on the server).

LONG PRESS (5s)     Factory reset / re-pair (see §01).

NO OTHER GESTURES.  No double-press, no press-and-hold-for-menu. One
                    button, one meaning per press length. A "Copy" button
                    that grows a gesture vocabulary stops being a single
                    honest action and starts being a tiny unlabeled remote.
```

The button never queues an action locally and "syncs later" silently — if
the uplink fails, the device shows a visible "not sent" state and retries
with backoff, because a Copy press that silently vanishes breaks the exact
transparency principle ("an action that cannot be seen did not happen") this
whole system is built around.

================================================================================

## 04 — OTA

ESP-IDF native OTA (A/B partition scheme — a failed update always leaves a
bootable previous image, never bricks the device). Update package signed;
device verifies signature before flashing partition B, only switches boot
partition after a successful post-flash self-test (WiFi connects, sensors
respond). This matters more here than on a typical IoT gadget because these
units ship to non-technical operators — there is no serial-console recovery
path once it's on someone's desk.

================================================================================

## 05 — POWER BUDGET (SKU-1)

```
STATE          DRAW           NOTES
-----          ----           -----
Deep sleep     ~10-20uA       Radio + camera + display all off; PIR wake pin
                               kept alive on RTC domain
Light sleep    ~1-2mA         Radio associated, listening for WSS push;
                               display off
Active/notify  ~80-150mA      Display on, WiFi TX bursts; camera adds
               peak ~250mA    ~100-150mA when actually capturing a frame
                               (only during an explicit "who's there"
                               presence-confirm capture, not continuously —
                               continuous camera streaming would blow the
                               power budget and is not this device's job)
```

250mAh cell at mostly-idle duty cycle: target **5-7 days per charge** before
needing the Qi dock, assuming a handful of notify/ack cycles per day and
occasional presence-triggered wake — this is a budget to validate at bench
prototype (Phase 2 of the HW roadmap), not a guaranteed number yet.

================================================================================

## 06 — CAMERA USE (item 5) — SCOPED HONESTLY

The camera is NOT a always-on webcam and does not stream. Its one job:
presence-confirm. When the PIR fires, the device may grab a single low-res
frame locally (never transmitted raw) and run a tiny on-device
presence/face-count model to decide "is someone actually here" before
bothering to wake the screen for a notification — this avoids buzzing at an
empty room because a curtain moved. No image or video ever leaves the
device; only a boolean/count crosses the LOT API connector, if this feature
ships at all. This is marked **PROVISIONAL** — it depends on finding an
on-device model small enough for the S3's compute budget; if that doesn't
pan out, the camera becomes PIR-only wake with no visual confirm, which is a
perfectly good fallback and should be treated as equally acceptable.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.20
================================================================================
