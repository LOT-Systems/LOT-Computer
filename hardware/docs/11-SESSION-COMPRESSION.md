# 11 · Session compression

*Session 01 · 2026-11-19 · Requirement 8: "compress the information in each session".*

Compression happens at three levels.

## 1. Device session (one wake ≈ 2 s)

| Data | Raw | Compressed |
|---|---|---|
| Sensor readings | 1 sample/min × 7 fields ≈ 40 KB/day JSON | **15-min buckets** (mean T/RH/P, max IAQ, majority gas class) → 96 buckets/day, ≈ 6 KB JSON, sent in one POST |
| Copy presses offline | — | NVS ring of 20, sent in order |
| Inbox | full history | `since=cursor`, newest message only on screen |

Planned for v0.2: switch the telemetry body to CBOR (about 40 % smaller than JSON) with `Content-Type: application/cbor`.

## 2. Site session (per device-day)

- Telemetry is stored as **one `Log` row per device per day** (`event:"device_day"`, `metadata.buckets[96]`), not one row per reading. This keeps the Log table and the Log tab clean.
- At each user's local midnight, the AI notifier writes a **digest** of ≤ 120 characters to `devices.digest`: *"Calm day. 4 logs, 2 copies. Air good until 3 pm."* The device shows it when there's no new message.

## 3. Work session (this routine)

Every session report starts with a **Session Capsule**: a short block of 10 lines or fewer that says what changed, what's decided, what's blocked and what's next. The full detail follows below it. The next session reads only the latest capsule plus the open decisions to pick up. That keeps the context small and the reports stackable.

Capsule format:

```
CAPSULE  L-01 · S<NN> · <date>
DONE     <≤ 2 lines>
STATE    phase P<n> · <gate status>
DECIDE   D-xx open: ...
BLOCKED  <or none>
NEXT     <≤ 2 lines>
METRICS  docs N · pdf N · sim checks a/b · BOM $/unit
```
