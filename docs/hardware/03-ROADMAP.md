# Roadmap (analysis)
| Phase | Weeks | Output | Gate |
|---|---|---|---|
| 0 Decide | 0–1 | Height decision (9 mm vs 5 mm), Qi-window concept, display size | Vadik sign-off |
| 1 Proof on dev kits | 1–4 | XIAO ESP32S3 Sense + display: notification, Copy button → Log, weather | Demo end-to-end with real site |
| 2 Server API | 2–4 | `/api/device/*` (04), pairing, Log `device_copy` | Green benchmark |
| 3 EVT PCB | 4–10 | KiCad design, 5 boards at PCBWay, 3D-printed + 1–2 CNC steel bodies | Boots, charges via Qi through window |
| 4 DVT | 10–18 | 20 units, polish spec, drop/thermal, FCC pre-scan | Battery ≥ 3 days at 10 polls/day |
| 5 Docs + tools | 12–20 | PDF manuals, web flasher | Manuals reviewed |
| 6 PVT / 100-unit run | 18–28 | 100 units, QA, serials | Yield ≥ 90% |
Critical path: enclosure + Qi window. Start CNC quotes in week 1.
