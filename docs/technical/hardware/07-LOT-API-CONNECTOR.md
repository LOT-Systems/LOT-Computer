# LOT PLATE — LOT API Connector Spec (HW-07)

REV A · 2026-10-31 · **PROPOSED. Not implemented in `src/server`.** Existing `POST /api/logs {text,event,metadata}` (api.ts) is session-cookie auth for users; devices need token auth, so new routes are required. Implement via Ship Mode as its own feature.

Base: `https://lot-systems.com/api/device` · Auth: `Authorization: Bearer <device token>` (scoped: `device:rw`, bound to one user, revocable).

| Method/Path | Purpose |
|---|---|
| `POST /pair {code, hwId, fw}` → `{token}` | Exchange 6-digit code shown in Settings → Devices |
| `GET /notifications?since=ID&wait=30` → `{items:[{id,text,ttl,priority,cmd?}]}` | Long-poll; `cmd` ∈ none,capture |
| `POST /event {type:"copy"|"capture"|"boot", notificationId?, ts}` | Button and lifecycle signals |
| `POST /telemetry {t,h,p,gas,lux,bat,rssi,ts}` | 5-min readings |
| `POST /frame` (image/jpeg, ≤60 KB) | Only after `cmd:"capture"` |

## Log tab mapping (req 16)
`/event copy` → create Log `{ userId, event:"device_copy", text:"COPY · <notification text>", metadata:{deviceId, notificationId, battery, rssi} }`. Follow COCKPIT-RULE: body = readings, label names event. `GET /logs` already lists events by type; add `device_copy`/`device_capture` to the Log tab filter and displayableEvents whitelist.

## Notification producers
Existing AI jobs (QIE/jobs) write `DeviceNotification` rows (new table; migration in `migrations/`). Rules: quiet hours, cooldown ≥10 min, max 12/day, gate types per Conditional Rendering doctrine ("Nothing renders without cause"). Example payload `{"text":"COFFEE TIME.","ttl":900,"priority":1}`.

## Security
Rate limit 60 req/min/token, body ≤64 KB, token hashed at rest, revoke from Settings, all device acts logged (audit-by-default).

## Reference implementation
`tools/mock-lot-api.mjs` implements the above in-memory for tests; `tools/lot-device-sim.mjs` is the client. Run: `node tools/mock-lot-api.mjs &  node tools/lot-device-sim.mjs --test`.
