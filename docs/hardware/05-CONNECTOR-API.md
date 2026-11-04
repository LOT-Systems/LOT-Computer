# LOT Pager — API Connector Contract (PROPOSED — not implemented)

Existing server facts (from repo): Fastify routes in `src/server/routes/api.ts`; `Log` model (`userId, event, text, metadata, context`); `GET /api/logs` filters by an allow-list `displayableEvents` — **`device_*` events must be added to that list or they won't show in the Log tab**. Auth today is session-based (`req.user`); devices need a token strategy.

## Auth
`Authorization: Bearer <device_token>`. Tokens minted from Profile → "Pair device" (6-digit code shown on site, entered on device via `lot-link`, exchanged once for token). Stored hashed server-side; revocable.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/device/pair` `{code, hw, fw}` → `{token, deviceId}` | one-time pairing |
| GET | `/api/device/poll?since=<id>` → `{notifications:[{id,text,priority,ts}], config:{pollSec}, firmware?}` | pager feed |
| POST | `/api/device/event` `{type:"copy"\|"ack"\|"status", notificationId?, text?, ts}` | button + telemetry |
| POST | `/api/device/sensors` `{t,rh,p,gasClass,iaq,battery}` | weather feed |
| POST | `/api/device/photo` (multipart, ≤ 200 KB JPEG) | camera stills |

## Log mapping
`copy` → `Log{event:'device_copy', text:<copied text>, metadata:{deviceId,notificationId}}`; `ack` → `device_ack`; `status` → `device_status`. Add all three to `displayableEvents`.

## Notification generation
Reuse existing AI engine + scheduled-jobs (`src/server/scheduled-jobs.ts`): a job writes `device_notification` per paired user ("Coffee time!") from Memory/QIE context; ≤ 1 per 30 min default; user-set quiet hours.

## Limits
Rate-limit 10 req/min/device; payload ≤ 256 KB; photos opt-in per user.
