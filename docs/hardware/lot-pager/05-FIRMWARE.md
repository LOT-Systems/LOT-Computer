<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 05 · FIRMWARE

```
DOCUMENT   HW-05 / FIRMWARE
ISSUE      2026-11-26 · rev 0.1  ·  firmware v0.1.0 (EVT-0)
SOURCE     hardware/lot-pager/firmware/  (PlatformIO, Arduino-ESP32 core)
STATUS     WRITTEN, NOT COMPILED. The sandbox had no toolchain or network. First P1 action: compile it.
```

## 00 · FILES

| File | Role |
|------|------|
| `platformio.ini` | Target `seeed_xiao_esp32s3` and its library dependencies |
| `include/config.example.h` | Wi-Fi, host, token and pins. Copy it to `config.h`, which is git-ignored |
| `src/main.cpp` | Boot → sync → show → deep sleep state machine; button handling |
| `src/lot_client.{h,cpp}` | LOT API connector: fetch notice, post Copy, pager-line compression |

## 01 · STATE MACHINE

```
          ┌──────────── timer wake (POLL_INTERVAL_S = 15 min) ────────────┐
          ▼                                                               │
 BOOT ─▶ SYNC ─▶ fetchNotice() ─▶ SHOW (memory LCD keeps the image) ─▶ DEEP SLEEP
                                                                          │
          ┌──────────── button wake (ext0, PIN_BUTTON LOW) ───────────────┘
          ▼
   press < 1.2 s ─▶ COPY  ─▶ POST /api/logs ─▶ "Copied." | "Not sent. Retry."
   press ≥ 1.2 s ─▶ SNAP  ─▶ (EVT-1) camera → POST /api/device/snap
```

- The last notice is kept in `RTC_DATA_ATTR` memory, so deep sleep does not lose it, and
  Copy always sends exactly what the user sees.
- **Notice priority:**
  1. The highest-`priority` item from `/api/contextual-prompts`. These are the per-user,
     pattern-driven autonomous lines.
  2. Otherwise the `/api/live-message` global broadcast, for example an admin-set "Coffee time!".
  3. Otherwise "Quiet."

## 02 · SESSION COMPRESSION ON THE DEVICE (`lot::compress`)

Every line is compressed to a pager line of 64 characters or fewer before it reaches the screen
or goes back to the Log:

1. Collapse whitespace.
2. Strip non-ASCII characters (emoji and degree signs). This follows the LOT style rule of no emoji and periods instead of symbols.
3. If the line is too long, keep the first sentence.
4. Otherwise cut at a word boundary and end with ".".

The host connector carries an identical JavaScript port. Tested 2026-11-26:

```
IN : "Coffee time!  ☕ You tend to feel calm at 14°C. How are you now? ..."
OUT: "Coffee time! You tend to feel calm at 14C."
IN : "Coffee time!"
OUT: "Coffee time!"
```

## 03 · POWER MODES

| Mode | Behaviour | Avg current (est.) | Life on 85 mAh |
|------|-----------|--------------------|----------------|
| **Pager** (default) | Deep sleep; wakes every 15 min for one TLS sync (~3 s at ~100 mA) | ~0.36 mA | **~9–10 days** |
| Pager-30 | Same, 30-min interval | ~0.20 mA | ~17 days |
| Instant | Wi-Fi light sleep plus `/api/sync` SSE kept open (DTIM 3) | ~1.5–2.5 mA | ~2 days. Use on the puck |
| Ship | Everything off; the fuel gauge ALRT or the button wakes it | < 10 µA | months |

TLS session resumption and a static IP (EVT-1) cut each sync to about 1 s, which roughly
doubles pager life. **P1 measures all of these on a PPK2.**

## 04 · EVT-1 ADDITIONS (spec)

- **Pairing:** first boot opens a BLE GATT service, `LOT-PAIR`.
  1. The phone sends the Wi-Fi details.
  2. The screen shows a 6-character code.
  3. The user enters the code at lot-systems.com → Settings → Devices.
  4. The server issues a scoped device token, and the device stores it in NVS. Flash encryption is on.
- **OTA:** `esp_https_ota` from `GET /api/device/firmware?v=`, with signed images (Secure Boot V2).
- **Weather:** BSEC2 library → IAQ, CO₂-eq and bVOC-eq, plus a per-unit temperature offset from
  EOL calibration. The device's weather is attached to every Copy, so the Log gains
  *local* weather next to the server-side city weather.
- **AI IMU (BHI260AP):** raise-to-wake refreshes the screen, and a double-tap repeats the
  last buzz. Step and activity classes go into the Copy metadata.
- **Camera:** long press takes one QVGA/VGA JPEG, which is POSTed to `/api/device/snap`. The server
  writes a captioned Log entry, for example "Photo: window, rain.". The image is not stored on
  the device, and the indicator LED and an inverted screen frame show while the camera is live.
- **Pager buzz:** DRV2605L effect #1, "strong click", once when a new notice differs from the
  last one. It is silent between 22:00 and 07:00 local time, using the user's timezone from the server.

## 05 · BUILD AND FLASH (P1)

```bash
cd hardware/lot-pager/connector
node lot-pager.mjs provision --ssid "<wifi>" --pass "<pass>" \
  --token "<test-account auth_token>" --id TILE40-EVT0-001
cd ../firmware
pio run -t upload && pio device monitor
```

To get a test token: sign in on lot-systems.com with a **dedicated test account**, then copy the
`auth_token` cookie value from browser devtools. Do not use a personal account.
