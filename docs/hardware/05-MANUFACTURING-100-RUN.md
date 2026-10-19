# HW-001 Manufacturing: PCBWay and the 100-Unit Run

## What PCBWay does here

PCB fabrication and turnkey assembly ([quote page](https://www.pcbway.com/quotesmt.aspx?f=fa)). Assembly quotes are human-reviewed, typically 1–2 business days. Submit: Gerbers, BOM with MPNs and manufacturer names, centroid/pick-and-place file, assembly drawing. Stainless CNC bodies are quoted separately; PCBWay's CNC service or a local machine shop.

## Stages

| Stage | Qty | Purpose | Exit criteria |
|---|---|---|---|
| EVT | 5–10 PCBs, 3 bodies | Boards work | Boots, pairs, shows notify, charges |
| DVT | 10–20 units | Design validated | Pass list below |
| PVT | 100 units | Production | ≥95% pass at final QC |

## DVT pass list

- Notify to screen in 2 s on Wi-Fi; Copy to Log in 3 s.
- Qi charge 0→80% in under 90 min through the inlay.
- Wi-Fi RSSI within 6 dB of the open-board reference.
- Splash test 10 min; 1 m drop onto a hard floor ×10.
- Surface: no polish marks on the back; 0.1 mm flatness.
- Temperature 0–40 °C; BME280 offset from self-heating compensated in firmware.
- OTA update and rollback.

## Final QC per unit (100-run)

Serial label, flash test firmware, scripted test (screen, button, camera, sensor, charge), pair to the staging backend, fill the QC sheet row, then pack.

## Shipping and compliance

Li-Po cells are dangerous goods: UN38.3 report from the cell maker, and shipping labelling. FCC applies if units are sold; an internal pilot run can proceed on a pre-certified module with pre-compliance scanning.

## Schedule risks

- Component lead times (an ESP32-S3 dev board showed 9 weeks on DigiKey).
- Mirror-polish yield on 316L.
- Window sealing and adhesive curing.

## Documentation deliverables

Each stage produces a PDF: assembly manual, user manual, firmware manual, API manual. Build with `docs/hardware/build-pdf.sh`.
