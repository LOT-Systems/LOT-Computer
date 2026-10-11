# LOT COMPUTER — Firmware Specification

```
DOCUMENT   LOT-COMPUTER / 03 FIRMWARE      REV A   2026-10-11
S-2        VADIK MARMELADOV
STATUS     SPEC — no firmware written yet
TARGET     ESP32-S3 · ESP-IDF 5.x (Arduino-compat optional)
```

## 1. Principles
- Poll, don't hold sockets open (battery). Deep-sleep between polls.
- Every user action and every sensor batch is logged to the site.
- Camera power is hard-wired to the status LED; no capture without it lighting.
- Secrets (Wi-Fi, device token) live in NVS with flash encryption; never in logs.

## 2. State machine

```
BOOT → PROVISION? ─no→ CONNECT → SYNC → IDLE ⇄ NOTIFY ⇄ SLEEP
           │yes                              │
           ▼                                 ├─ button short → COPY
      PAIRING (lotctl/BLE)                   ├─ button long  → ACK/dismiss
                                             └─ button double → CAPTURE (assumed, Q-1)
```

| State | Behaviour |
|---|---|
| PROVISION | no token in NVS → BLE/USB serial pairing with `lotctl` |
| SYNC | `GET /api/device/notifications?since=<id>`; send queued events and digest |
| NOTIFY | wake display, short haptic/beep if hardware present, show text (≤ 64 chars), auto-dismiss 60 s |
| COPY | `POST /api/logs` event `device_copy` with notification id; show "COPIED" |
| SLEEP | deep-sleep, wake on button or timer (default 5 min poll) |

## 3. Tasks / modules
`net` (TLS, retry/backoff) · `store` (NVS, ring buffer for offline events) ·
`sensors` (BME688 via BSEC, SHT45, VEML7700) · `ui` (notification card, LOT
terminal-grid styling, opacity hierarchy per LOT-STYLE-GUIDE) · `power` (fuel
gauge, charge state, Qi detect) · `ota` (signed images, A/B partitions) ·
`camera` (on demand, JPEG, LED interlock) · `digest` (see §5).

## 4. Sensor handling
- Sample environment every 60 s while awake; keep 1 h rolling min/mean/max.
- Compensate T/RH for board self-heating (calibrate during DVT).
- BME688 gas classes trained with Bosch BME AI-Studio; licence check required (Plan R-5).
- Weather is *local* ambient; server `/api/weather` stays the forecast source.

## 5. Session compression (req. 8)
A "session" = wake → sleep. Per session the device builds a **digest**, not raw
samples:
- fixed-order CBOR map: `{d:device, t:start, n:notif_ids_seen, b:button_events, s:{tmin,tmax,tmean,rhmean,p,iaq}, bat:%}`
- deltas against the previous digest; heatshrink/zlib when > 256 B
- target: ≤ 200 B per session; hard cap 1 KB. Server stores digest in Log
  `metadata`; the existing memory-compression layer summarises across sessions.
Compression ratios are to be *measured* in DVT, not assumed.

## 6. OTA & recovery
A/B partitions, rollback on failed boot, signed images, version in every request
header `X-LOT-FW`. Factory reset: hold button 10 s.

## 7. Test plan
Unit (host): digest encoder, retry/backoff, ring buffer. HIL: button→Log latency,
offline queue flush, Qi attach/detach, brown-out, OTA rollback. Soak: 72 h.

## 8. Milestones
M1 notify→display (dev kit) · M2 Copy→Log live · M3 sensors + digest ·
M4 camera + LED interlock · M5 OTA · M6 custom board port.
