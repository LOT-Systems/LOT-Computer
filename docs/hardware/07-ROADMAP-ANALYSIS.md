<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · Roadmap & Analysis

**Document:** LD-01-DOC-07 · Rev A · 2026-11-21

## 1. Roadmap

| Step | Name | Output | Est. duration | Est. cost | Depends on |
|------|------|--------|---------------|-----------|------------|
| S-0 | Plan (this session) | Docs 01–08, PDFs, firmware skeleton | done | $0 | — |
| S-1 | Buy Proto-A kits | 3 kits (doc 02 §A) | 1 week shipping | ≈ $480 | S-0 approval |
| S-2 | Proto-A firmware | Inbox render, Copy, BME688 batch | 1–2 weeks | — | S-1 |
| S-3 | Server device API | Wire in `device-api.ts`, migration, Settings → Devices, AI notification producer | 1 week | — | S-0 (parallel with S-1/S-2) |
| S-4 | End-to-end demo | "Coffee time." on the device → Copy → Log tab | — | — | S-2 + S-3 |
| S-5 | Schematic + PCB layout Rev A | KiCad project, Gerbers | 2–3 weeks | — | S-4 |
| S-6 | Enclosure CAD | STEP A/B, glass DXF | 2 weeks (parallel with S-5) | — | S-0 |
| S-7 | EVT build (10) | PCBWay PCBA + CNC | 4–5 weeks | ≈ $3–4k | S-5, S-6 |
| S-8 | DVT build (20) | 5 mm stretch, pre-scan | 5–6 weeks | ≈ $5–6k | S-7 |
| S-9 | PVT / 100-unit run | 100 shipped | 6–8 weeks | ≈ $13–17k | S-8 |

**Critical path:** S-1 → S-2 → S-4 → S-5 → S-7 → S-8 → S-9, about **5–6 months** from approval to
100 units. If approved now, the earliest delivery is around late April–May 2027.

## 2. Analysis

**Strong points**
- No custom hardware is needed to prove the value. The Proto-A dev kits plus the server API can show
  the "AI pager + Copy to Log" loop within about 3 weeks.
- The server already has the pieces the device needs: the Log model, weather, AI engines and scheduled
  proactive jobs. The device API is small and additive.
- A memory LCD fits the LOT aesthetic (monochrome, quiet, readable in daylight) and uses almost no power.

**Hard truths**
1. **Steel blocks radio and Qi.** The design only works because the front is glass. This is decided,
   and it sets the industrial design: the polished back cannot be the charging face.
2. **5.0 mm is a stretch target.** Plan for 6.0 mm at EVT and treat 5.0 mm as a DVT goal.
3. **"Pager" latency is set by battery.** Wi-Fi polling every 15 min means a "Coffee time." message
   can arrive up to 15 min late. Getting pager speed needs the phone-BLE relay (Rev B) or a bigger cell.
4. **The camera is the weakest fit** for a 5 mm, ~100 mAh device. Keep it, because it supports
   the long-press capture-to-Log feature, but it could move to Rev B if the Z-stack fails.
5. **Price:** about $130–175 per unit landed at 100 units, before NRE. A retail price of $350+ or a
   bundle with Usership ($50/month) is reasonable for a numbered 100-unit edition.

## 3. Decisions needed from S-2

| # | Question | Recommendation |
|---|----------|----------------|
| D1 | Accept 6.0 mm for EVT? | **Yes** |
| D2 | Charge face = front glass (face-down on a soft pad)? | **Yes** |
| D3 | Camera in Rev A or Rev B? | **Rev A**, with the option to depopulate it |
| D4 | Glass or sapphire window? | Glass for EVT, sapphire for the numbered 100 edition |
| D5 | Approve buying the Proto-A kits (≈ $480)? | **Yes**, this unblocks everything |
| D6 | Allow lot-systems.com domains in this cloud environment's network settings? | Yes, so future sessions can read brand.lot-systems.com and the institute pages |
