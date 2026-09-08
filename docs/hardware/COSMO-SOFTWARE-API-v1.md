<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA Hardware Division
  Document: COSMO-SOFTWARE-API-v1.md
  Software Integration & LOT API Connector
  Date: 2026-06-12
-->

# COSMO® Cube — Software & LOT API Integration v1.0

**Document:** COSMO-SOFTWARE-API-v1.md  
**Author:** Vadim Marmeladov, Inventor  
**Date:** 2026-06-12  

---

## 1. System Overview

The COSMO® Cube connects to the LOT platform at lot-systems.com via HTTPS. The device is a hardware API consumer — it reads notifications from the LOT backend and posts behavioral log events back. No cloud intermediary. No third-party broker. Direct device → LOT site communication.

```
COSMO® Cube (ESP32-S3)
    │
    │ HTTPS / TLS 1.3
    │ WiFi 802.11n
    │
    ▼
lot-systems.com
    ├── GET  /api/hardware/notifications  ← Device polls every 60s
    ├── POST /api/hardware/log            ← Copy button event
    ├── GET  /api/hardware/firmware       ← OTA version check
    └── POST /api/hardware/register       ← First-boot registration
    │
    ▼
LOT Database (PostgreSQL)
    ├── hardware_devices table
    ├── hardware_logs table
    └── hardware_notifications table
```

---

## 2. Authentication

### 2.1 Device API Key

Each COSMO® Cube is provisioned with a unique API key at manufacture.

- Key format: `cq_[32-char hex]` (e.g., `cq_4a7b2f8e1d3c9a0b5e6f2d1a8c4b7e3f`)
- Key stored in: ESP32-S3 encrypted NVS partition
- Key transmitted in: HTTP header `Authorization: Bearer cq_...`
- Key rotation: Via OTA firmware update + LOT admin panel

### 2.2 Server-Side Device Record

```sql
-- LOT Database schema addition
CREATE TABLE hardware_devices (
  id            SERIAL PRIMARY KEY,
  serial        VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "CQ-001-26"
  api_key_hash  VARCHAR(64) NOT NULL,          -- bcrypt hash of device key
  user_id       INTEGER REFERENCES users(id),  -- linked LOT user account
  firmware_ver  VARCHAR(20),
  last_seen     TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  active        BOOLEAN DEFAULT true
);

CREATE TABLE hardware_logs (
  id          SERIAL PRIMARY KEY,
  device_id   INTEGER REFERENCES hardware_devices(id),
  user_id     INTEGER REFERENCES users(id),
  event_type  VARCHAR(50),               -- "copy_button", "sensor_snapshot"
  temperature FLOAT,
  humidity    FLOAT,
  pressure    FLOAT,
  light_lux   INTEGER,
  raw_json    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hardware_notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  message     VARCHAR(128) NOT NULL,
  source      VARCHAR(50),              -- "lot_ai", "calendar", "manual"
  delivered   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);
```

---

## 3. API Endpoints

### 3.1 GET /api/hardware/notifications

**Purpose:** Fetch pending notifications for this device's linked user.

**Request:**
```http
GET /api/hardware/notifications HTTP/1.1
Host: lot-systems.com
Authorization: Bearer cq_4a7b2f8e1d3c9a0b5e6f2d1a8c4b7e3f
Accept: application/json
X-Device-Serial: CQ-001-26
X-Firmware-Version: 1.0.0-001
```

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "id": 1042,
      "message": "Coffee time!",
      "source": "lot_ai",
      "type": "reminder",
      "created_at": "2026-06-12T14:30:00Z",
      "expires_at": "2026-06-12T16:00:00Z"
    }
  ],
  "count": 1
}
```

**Response (204 No Content):** No pending notifications.

**Response (401 Unauthorized):** Invalid API key.

**Server logic:**
```typescript
// LOT Backend — Fastify route
fastify.get('/api/hardware/notifications', async (req, reply) => {
  const device = await db.hardware_devices.findOne({
    where: { api_key_hash: hashKey(req.headers.authorization) }
  });
  if (!device) return reply.code(401).send({ error: 'Invalid device key' });

  await db.hardware_devices.update(
    { last_seen: new Date() },
    { where: { id: device.id } }
  );

  const notifications = await db.hardware_notifications.findAll({
    where: {
      user_id: device.user_id,
      delivered: false,
      expires_at: { [Op.gt]: new Date() }
    },
    order: [['created_at', 'ASC']],
    limit: 5
  });

  if (notifications.length === 0) return reply.code(204).send();

  // Mark as delivered
  await db.hardware_notifications.update(
    { delivered: true },
    { where: { id: notifications.map(n => n.id) } }
  );

  return reply.send({ notifications, count: notifications.length });
});
```

---

### 3.2 POST /api/hardware/log

**Purpose:** Copy button press — sends sensor snapshot to LOT Log tab.

**Request:**
```http
POST /api/hardware/log HTTP/1.1
Host: lot-systems.com
Authorization: Bearer cq_4a7b2f8e1d3c9a0b5e6f2d1a8c4b7e3f
Content-Type: application/json

{
  "device": "COSMO® Cube",
  "serial": "CQ-001-26",
  "timestamp": "2026-06-12T14:35:22Z",
  "event": "copy_button",
  "temperature": 22.4,
  "humidity": 58.2,
  "pressure": 1013.2,
  "light_lux": 420,
  "accel_x": 0.02,
  "accel_y": -0.01,
  "accel_z": 9.81,
  "firmware_version": "1.0.0-001"
}
```

**Response (200 OK):**
```json
{
  "status": "logged",
  "log_id": 8821,
  "message": "Entry added to Log tab."
}
```

**Server logic:**
```typescript
fastify.post('/api/hardware/log', async (req, reply) => {
  const device = await authenticateDevice(req.headers.authorization);
  if (!device) return reply.code(401).send();

  const { temperature, humidity, pressure, light_lux, event, timestamp } = req.body;

  // Create log entry visible in LOT Log tab
  const log = await db.logs.create({
    userId: device.user_id,
    text: `[COSMO® Cube] ${event} — ${temperature}°C, ${humidity}% RH, ${pressure} hPa`,
    eventType: 'hardware_log',
    metadata: {
      serial: device.serial,
      source: 'cosmo_cube',
      ...req.body
    },
    createdAt: new Date(timestamp)
  });

  // Also save to hardware_logs for device analytics
  await db.hardware_logs.create({
    device_id: device.id,
    user_id: device.user_id,
    event_type: event,
    temperature, humidity, pressure, light_lux,
    raw_json: req.body
  });

  return reply.send({ status: 'logged', log_id: log.id, message: 'Entry added to Log tab.' });
});
```

---

### 3.3 POST /api/hardware/register

**Purpose:** First-boot device registration. Links device serial to a LOT user account.

**Request:**
```http
POST /api/hardware/register HTTP/1.1
Host: lot-systems.com
Content-Type: application/json

{
  "serial": "CQ-001-26",
  "pairing_code": "LOT-7F3A",
  "firmware_version": "1.0.0-001"
}
```

**Pairing flow:**
1. User generates pairing code in LOT web app (My Devices → Add Device)
2. User enters code on COSMO® Cube via companion BLE app (or QR code scan)
3. Device POSTs serial + pairing code to /api/hardware/register
4. Server links device to user, returns device API key
5. Device stores API key in encrypted NVS

**Response (200 OK):**
```json
{
  "api_key": "cq_4a7b2f8e1d3c9a0b5e6f2d1a8c4b7e3f",
  "user_id": 412,
  "display_name": "Vadik's COSMO® Cube"
}
```

---

### 3.4 GET /api/hardware/firmware

**Purpose:** OTA version check — device checks if update is available.

**Request:**
```http
GET /api/hardware/firmware HTTP/1.1
Host: lot-systems.com
Authorization: Bearer cq_...
X-Firmware-Version: 1.0.0-001
```

**Response (200 — Update Available):**
```json
{
  "update_available": true,
  "version": "1.0.1-005",
  "download_url": "https://lot-systems.com/firmware/cosmo-1.0.1-005.bin",
  "sha256": "abc123...",
  "release_notes": "Improved notification reliability, BME280 calibration fix"
}
```

**Response (204 — Up to Date):** No update needed.

---

## 4. LOT Web App — Hardware Integration

### 4.1 New Routes Required

```
/devices                    → My Devices page (list registered COSMO® Cubes)
/devices/add                → Pairing flow (generate pairing code)
/devices/[serial]           → Device detail (status, battery, last seen, logs)
/api/hardware/notifications → POST from LOT AI system (create notification for device)
```

### 4.2 Log Tab Display

Hardware log entries appear in the LOT Log tab with a hardware badge:

```tsx
// LogEntry component — hardware entries
{log.eventType === 'hardware_log' && (
  <div className="log-entry hardware-log">
    <span className="badge">COSMO® Cube</span>
    <span className="text">{log.text}</span>
    <span className="meta">
      {log.metadata?.temperature}°C ·
      {log.metadata?.humidity}% RH ·
      {log.metadata?.pressure} hPa
    </span>
    <span className="time">{formatRelative(log.createdAt)}</span>
  </div>
)}
```

### 4.3 Notification Creation (LOT AI → Device)

The LOT AI system (QI-46 Engine) can push notifications to a user's COSMO® Cube:

```typescript
// Called by QI-46 Engine when a contextual notification triggers
async function pushHardwareNotification(userId: number, message: string, source: string) {
  await db.hardware_notifications.create({
    user_id: userId,
    message,           // e.g., "Coffee time!", "Deep work block starting", "Mood check-in"
    source,            // "lot_ai", "calendar", "benchmark", "manual"
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000)  // expires in 2 hours
  });
}
```

**Trigger examples:**
- QI-46 detects coffee pattern → "Coffee time!"
- Calendar alert → "Meeting in 10 minutes."
- Benchmark achievement → "Purple tier reached. COSMO® eligible."
- Self-care prompt → "2-minute breathing exercise."
- Weather event → "Rain arriving in 30min."

---

## 5. Companion Mobile App (Future Phase)

For device provisioning and configuration, a companion BLE app handles:

| Function | Platform |
|----------|---------|
| Device pairing (BLE + pairing code) | iOS + Android (React Native) |
| WiFi credential setup | BLE GATT characteristic write |
| Notification preferences | LOT web app (not app) |
| Firmware update trigger | BLE or WiFi OTA |
| Device status | BLE GATT read |

**BLE GATT Services:**
```
Service UUID: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E (Nordic UART)

Characteristics:
  TX (Notify): 6E400003-... → Device → App (status, sensor readings)
  RX (Write):  6E400002-... → App → Device (WiFi creds, commands)
```

---

## 6. Data Compression (Session Context)

Per user instruction: compress behavioral information in each session.

Hardware log entries are compressed before storage using the LOT memory compression architecture:

```typescript
// Compression: each hardware log session is summarized after 24h
// Instead of storing 1440 individual sensor readings (1/min),
// store a daily summary:

interface HardwareDaySummary {
  date: string;
  serial: string;
  avg_temperature: number;
  min_temperature: number;
  max_temperature: number;
  avg_humidity: number;
  avg_pressure: number;
  copy_button_count: number;     // How many times user pressed Copy
  peak_light_hour: number;       // Hour of day with highest light (proxy for activity)
  notifications_delivered: number;
  notifications_dismissed: number;
}
```

Raw sensor readings are kept for 7 days, then compressed to daily summaries (permanent). Button press events are kept permanently.

---

*Document v1.0 — COSMO® CIA — LOT Systems, Inc.*  
*Inventor: Vadim Marmeladov — 2026-06-12*
