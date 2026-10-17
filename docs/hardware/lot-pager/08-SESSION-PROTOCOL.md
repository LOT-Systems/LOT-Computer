# LOT® PAGER — Session Compression Protocol

"Compress the information in each session" is implemented at three levels.

## 1. Documentation sessions (how this project is recorded)
Each working session ends with one Markdown report in `docs/hardware/lot-pager/sessions/` named `HW-SR-YYYYMMDD-NN.md`:
- ≤ 1 page TL;DR (decisions, deltas, open questions) first;
- details after; nothing duplicated from the numbered spec docs — link to them;
- ledger line appended to `docs/assembly/LOT-LEDGER.md`.
Reports are pushed to the working branch each session (per brief). PDFs regenerated with `build.sh`.

## 2. Device payloads
Notification: CBOR (not JSON) is optional later; v0 uses JSON ≤ 240 B. 

## 3. Telemetry
Batch 5‑minute window; delta-encode readings; heatshrink/zstd‑lite on the batch; fallback gzip. Expected 2–6 KB/day/device.

## 4. Camera
JPEG q=70, ≤640×480, ~25–40 KB.

## 5. Session memory on the server
Device sessions roll up into one Memory-engine summary per day (existing Memory Engine), keeping only the notification outcome (acked / ignored / copied) and aggregated sensor stats.
