# LOT API Connector — Device ↔ lot-systems.com (v0.1 draft)

## Findings in current code (src/server/routes/api.ts)
- `POST /api/logs` takes `{text, event?, metadata?}` and writes `Log` for **`req.user`** — i.e. session-cookie auth. A device has no browser session, so it needs its own token auth.
- `GET /api/logs` returns only events in a `displayableEvents` allow-list. **`device_copy` and `device_notification` must be added there** or the Log tab will not show device events.

## Proposed new routes (not yet implemented)
| Method | Path | Purpose |
|---|---|---|
|POST|/api/device/pair|User (logged in) generates 6-digit code; device exchanges it for a long-lived device token (stored hashed)|
|GET|/api/device/notifications?since=<id>|Long-poll (or WSS `/api/device/stream`) for pending notifications `{id,text,icon,priority,expires}`|
|POST|/api/device/ack|Mark notification shown/dismissed|
|POST|/api/device/button|`{type:"copy", ts, deviceId, batt, rssi}` → creates Log `{event:"device_copy", text:"Copy ← LOT-HW-01"}`|
|POST|/api/device/session|Compressed session batch (CBOR+zstd) → one summary Log entry|
|POST|/api/device/weather|Optional: sensor readings into existing `weather_update` events|

Auth: `Authorization: Bearer <device token>`; revocable from the site; per-device rate limit; TLS only; device cert pinning in firmware.

## Notification sources
Server-side scheduler/AI decides ("Coffee time!") based on user rhythm data; writes to a `DeviceNotification` queue. Screen shows ≤2 lines + icon; button press = "Copy" (acknowledge + log).

## Open questions
Copy semantics: does "Copy" copy the current notification text into the Log, or is it just a signal? (Assumed: logs the notification text + timestamp.)
