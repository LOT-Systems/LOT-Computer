# LOT-DEVICE-01 · STATE (compressed project memory)

> Rewritten at the end of every routine session. The next session reads this first. ≤ 40 lines.

**Updated:** 2026-11-20 · Session S1 · Branch `claude/brave-lamport-im7y12`

## Product (frozen inputs)
40×40×5 mm silver square · 2-part 316L (front frame satin + back #8 mirror) · front: Memory LCD 128×128 + HM0360 camera + Copy button · Qi wireless charging (face-down, through glass) · BME688 weather/IAQ + BMI270 IMU · ESP32-S3 Wi-Fi/BLE · PCBWay PCB + PCBA + CNC · 100-unit pilot.

## Done
- S1: Plan, BOM (+csv), Enclosure, API, Firmware, Roadmap, User Manual docs. PDFs in `hardware/lot-device-01/pdf/`.
- S1: Server connector `src/server/routes/device-api.ts` — pair/list/revoke/notify (site) + hello/inbox/ack/copy/telemetry (device). `device_copy` → Log tab ("DEVICE [COPY]:"). Autonomous circadian nudges ("Coffee time."). Build green; in-process inject test pass.
- S1: Firmware skeleton (PlatformIO, uncompiled) + host CLI `tools/lot-device.mjs`.

## Key numbers
Landed unit $94–163 · Pilot total ≈ $21–42k · Battery ≈ 9 days @15 min poll (80 mAh) · Stack 6.0 mm stacked / 5.0 mm side-by-side.

## Open decisions (Vadik)
D1 charge via front glass? · D2 bare chip vs module (FCC cost) · D3 5.0 vs 5.5 mm · D4 camera purpose · D5 Memory LCD vs OLED · D6 sale vs internal run.

## Blockers in routine sandbox
lot-systems.com / brand / institute sites, vendor sites (PCBWay, Digi-Key, Adafruit) and PlatformIO registry are **not reachable** → prices are estimates, brand pages unread, firmware not compiled. Allow these hosts in the environment network policy to unblock.

## Next session (S2)
1. Site UI: Settings → Device (pair / list / revoke / send test) using existing endpoints.
2. Per-device rate limit on `/api/device/v1/*`.
3. BLE provisioning GATT service in firmware + Web Bluetooth page.
4. Wire QIE/memory engine → `queueDeviceNotification(…,'ai')`.
5. Start KiCad schematic Rev A (EVT, module-based per D2 recommendation).
