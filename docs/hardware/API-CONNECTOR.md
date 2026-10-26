# LOT API Connector — device ↔ lot-systems.com

## 1. Current state (verified in repo)
- `POST /api/logs` in `src/server/routes/api.ts` accepts `{ text, event?, metadata? }` and creates a `Log` for `req.user` (session-authenticated; `event` defaults to `'note'`, text capped at `MAX_LOG_TEXT_LENGTH`).
- No device identity, token, or push-to-device channel exists. These must be added (server change — not implemented this session).

## 2. Proposed endpoints (new, under `/api/device`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/device/pair` | user session | Returns one-time code; device exchanges it for a long-lived device token |
| POST | `/api/device/claim` | pair code | Device receives `deviceToken` (store hashed server-side) |
| GET | `/api/device/notifications` | `Authorization: Bearer <deviceToken>` | Long-poll / SSE stream of pending notifications |
| POST | `/api/device/notifications/:id/ack` | device | Delivered/seen |
| POST | `/api/device/event` | device | Button + sensor events |
| POST | `/api/device/telemetry` | device | Weather/battery (batched, ≤ 1/min) |
| POST | `/api/device/capture` | device | Camera JPEG upload (only on user-requested capture) |

## 3. Notification payload (AI site → device)
```json
{ "id": "n_01", "text": "Coffee time!", "priority": "normal|urgent", "haptic": "short|double|long", "expiresAt": "ISO", "source": "ai" }
```
Text ≤ 40 chars per line, ≤ 3 lines on the 240×240 screen. The AI generator reuses the site's existing scheduling jobs (`scheduled-jobs.ts`) to enqueue notifications.

## 4. Button = Copy → Log tab
Device sends `POST /api/device/event { "type":"copy", "notificationId":"n_01", "ts":"..." }`.
Server writes a Log: `event: 'device_copy'`, `text: <notification text>`, `metadata: { deviceId, notificationId }`, so it appears in the Log tab. Reuse `getLogContext` for consistency. Log UI must render `device_copy` (check how non-`note` events display).

## 5. Security
- TLS only, token revocable per device, rate limit per token, payload size caps, camera upload requires an explicit server-side capture request. Follow `SECURITY.md`.
- Device tokens never in firmware images; provisioned at pairing.
