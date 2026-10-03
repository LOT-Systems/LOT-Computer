# LOT API Connector — Device ⇄ lot-systems.com (items 2, 6, 16)

Status: **SPEC — not implemented.** Existing session-cookie routes in `src/server/routes/api.ts` are not suitable for a headless device, so devices get their own token and namespace `/api/device/*`.

## 1. Data model (new)
`Device { id, userId, serial, tokenHash, name, fwVersion, lastSeenAt, batteryPct, revokedAt }`
`DeviceMessage { id, deviceId, text(≤80), kind('notify'|'alert'), createdAt, deliveredAt, ackAt }`

## 2. Auth & provisioning
1. Operator logs in on site → Settings → Devices → "Pair" generates a 6-digit code (5 min).
2. Device (via LOT Link BLE or Wi-Fi portal) calls `POST /api/device/pair {serial, code}` → returns a long-lived bearer token (stored in NVS, hashed on server).
3. All calls: `Authorization: Bearer <token>`; per-device rate limit (60 req/min); revoke from Settings. TLS only, pin the site CA bundle in firmware.

## 3. Notification (site → device)
- `GET /api/device/inbox?since=<id>&wait=25` — long-poll; returns `[{id,text,kind,ts}]`.
- `POST /api/device/messages/:id/ack` — device confirms display.
- Producers: the AI engine / scheduled jobs (QIE) write `DeviceMessage` rows (e.g. "Coffee time!"). Text is generated server-side, ≤80 chars, ASCII+basic Latin for the small font; shown with haptic buzz.
- Same text surface as `GET /api/live-message`, which can seed v0 before the device table exists.

## 4. "Copy" button → Log tab (item 16)
- `POST /api/device/events {type:'copy', msgId?, ts, battery}` → server writes a Log row `event: 'device_copy'` for the owner; add `'device_copy'` to the `displayableEvents` list in `GET /api/logs` so it appears in the Log tab on lot-systems.com.
- Semantics: "Copy" = copy the currently shown notification into the user's log (and clipboard when the web app is open). Debounce 300 ms, device vibrates once on 200 OK.

## 5. Telemetry & sensors
- `POST /api/device/telemetry` every 15 min batch: `{t,h,p,gasClass,lux,motion,battery}` (BME688/SHT45/VEML7700/BMI270, edge-classified). Weather can complement `GET /api/weather`.
- **Compression (item 8 for the product):** on-device delta + 16-bit quantization; send JSON `application/json` gzip; one 15-min batch ≈ 200 B.

## 6. Camera
- `POST /api/device/photo` (JPEG ≤120 kB, QVGA/VGA) only after a button gesture (long-press); stored private to the owner; displayed in Log as `device_photo`. No streaming in v1.

## 7. Errors & offline
- 401 → re-pair; 429 → back off; queue up to 50 events in flash, flush on reconnect.

## 8. Backend work estimate
Migration + 2 models + 5 routes + Log render + Settings pairing UI ≈ 3–4 dev-days; gate with `lot-benchmark` before any push to master.
