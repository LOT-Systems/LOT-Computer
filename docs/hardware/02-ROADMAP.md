# LOT Pager — Roadmap & Risk Analysis

## Phases (each phase ends with a pushed `.md` session report)
| Phase | Weeks | Deliverable | Exit gate |
|---|---|---|---|
| P0 Plan (this session) | 0 | Doc set, BOM, decisions list | Inventor answers 5 blocking Qs |
| P1 Breadboard | 1–4 | ESP32-S3 dev kit + OLED/IPS + BME688 + camera + button, talking to staging `/api/device/*` | Notification shows; COPY appears in Log tab |
| P2 Server connector | 2–5 | `/api/device/pair, /poll, /event`, `device_*` log events, Profile → "Pair device" | Contract tests green; token revocation works |
| P3 EVT board | 5–10 | Custom 4-layer PCB (PCBWay, 5 pcs), firmware v0.1, 3D-printed shell | Boots, charges via Qi, 24 h battery |
| P4 Mechanical proto | 8–14 | 5 CNC 316L sets, mirror polish, glass, gasket; RF + Qi through seam test | Wi-Fi RSSI > −70 dBm, Qi ≥ 70 % eff. |
| P5 DVT | 14–20 | 20 units, `lot-link` flasher, test jig, PDF manuals v1 | Drop/IP54 pass, OTA works |
| P6 PVT / 100-run | 20–30 | 100 units via PCBWay | ≥ 92 % first-pass yield |
| P7 Ship & learn | 30+ | Field telemetry, v1 shrink toward 5 mm | — |

## Critical path
Decisions → mechanical RF/Qi window design (P4 risk) → CNC lead time (stainless mirror polish 3–5 wks) → PVT. Start CNC quotes during P3.

## Risk register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Steel kills Wi-Fi/Qi | High | Blocking | PEEK seam antenna slot; glass-side coil; test with coupons in P1 |
| 5 mm height impossible | Certain (full spec) | Scope | Stage 9 → 7 → 5 mm; accept thinner battery |
| Camera privacy/trust | Med | Brand | LED, stills-only, on-button-only, no background capture |
| Battery life (polling + screen) | High | UX | Light sleep, 60 s poll, screen off, wake on IMU tap/button; target 3 days @ 70 mAh |
| Mirror polish scratches/fingerprints | High | Quality | Optional PVD coating; ship cloth |
| Lithium cell shipping/certs | Med | Delay | UN38.3 cell, FCC/CE via module pre-cert (ESP32-S3-MINI is pre-certified) |
| Server cost of AI notifications | Low | $ | Generate per user per day, cache, rate-limit device endpoints |
| Vendor lead times | Med | Delay | Order long-lead (CNC, glass) first |

## Compliance checklist (US-made brand)
FCC Part 15 (modular approval inherited if antenna untouched — a metal case near the antenna may void it → budget ~$5–8k for intentional-radiator test), UN38.3, RoHS. Estimates; verify with a lab.
