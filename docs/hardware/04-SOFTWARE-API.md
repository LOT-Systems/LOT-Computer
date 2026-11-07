# 04 — SOFTWARE & LOT API CONNECTOR

Existing repo facts: Fastify server (`src/server/routes/{api,public-api,os-api,admin-api}.ts`), Prisma/Postgres,
scheduled jobs (`src/server/scheduled-jobs.ts`), Anthropic key already configured (`config.anthropic`).
Nothing device-related exists yet — all below is new.

## Data model (Prisma, proposed)
```prisma
model Device {
  id           String   @id @default(cuid())
  userId       String
  serial       String   @unique   // LOT-P1-000001
  publicKey    String             // ECDSA P-256, set at provisioning
  fwVersion    String?
  lastSeenAt   DateTime?
  battery      Int?
  createdAt    DateTime @default(now())
}
model DeviceEvent {
  id        String   @id @default(cuid())
  deviceId  String
  type      String   // copy | telemetry | boot | error
  payload   Json?
  createdAt DateTime @default(now())
}
model DeviceNotification {
  id        String   @id @default(cuid())
  deviceId  String
  text      String   // ≤ 64 chars
  icon      String?
  source    String   // ai | user | system
  deliveredAt DateTime?
  ackedAt     DateTime?
  createdAt DateTime @default(now())
}
```

## Endpoints (prefix `/api/device`, device-signed requests: `X-Device-Id`, `X-Timestamp`, `X-Signature`)
| Method | Path | Purpose |
|---|---|---|
| POST | `/claim` | User (logged in) claims a serial with a pairing code |
| GET | `/inbox?since=` | Device pulls pending notifications (long-poll 25 s optional) |
| POST | `/event` | `{type:"copy",notificationId}` → creates DeviceEvent **and a Log entry** |
| POST | `/telemetry` | Batched sensor readings |
| GET | `/firmware/latest` | Signed OTA manifest |
| POST | `/notify` (user session / admin) | Send a manual notification to a device |

## AI notifications
New scheduled job `device-notify`: for each device, build context (time, user's recent log, weather telemetry),
call Claude with a hard instruction: *one line ≤ 64 chars, no emoji, imperative, calm*. Store as `DeviceNotification(source=ai)`.
Rate-limit (≤ 6/day default, quiet hours). Example: "Coffee time!" / "Rain in 20 min — take the coat."

## Log tab signal (req. 16)
`POST /event {type:"copy"}` writes a Log entry on the user's Log tab: *"Device LOT-P1-0007 · COPY · 'Coffee time!' · 14:32"*.
Front-end: add a "Device" filter chip in the Log view. (Client Log component to be located in `src/client` — to do in Phase 1.)

## Host software
- **`lot-flash` CLI** (Node, `esptool`/`esp-idf-monitor` wrapper): flash, burn keys, write serial, register public key to API, print label QR.
- **Web pairing**: Web Bluetooth page at `lot-systems.com/device` sends Wi-Fi creds + pairing code.
- **Factory fixture script**: runs QA checklist (05) and uploads the report.
