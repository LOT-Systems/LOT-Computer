# LOT PLATE — Hardware Programme Index

Hardware computer bound to lot-systems.com. Owner S-2 Vadik Marmeladov. Start at `STATE.md` (1 page), then:

| File | Content |
|---|---|
| STATE.md | Compressed current state (rewritten every session) |
| 01-PLAN.md | Plan, requirement trace (19 items), decisions, open questions |
| 02-BOM.md | Components buying list with links + cost roll-up |
| 03-ROADMAP.md | Phases, gates, risk register, analysis |
| 04-MECHANICAL-RF.md | Body, stack budget, RF and Qi through steel |
| 05-ELECTRONICS.md | Block diagram, pins, power, sensors, PCBWay rules |
| 06-FIRMWARE.md | Firmware state machine + `firmware/` skeleton |
| 07-LOT-API-CONNECTOR.md | Proposed `/api/device/*`, Log-tab mapping |
| 08-MANUFACTURING-100.md | PCBWay scope, 100-unit cost |
| 09-OPERATOR-MANUAL.md | Draft user manual |
| tools/ | Mock API + device simulator (`node tools/lot-device-sim.mjs --test`) |
| manuals/ | PDF manuals built from the .md (`bash build-pdfs.sh`) |

Session reports: `docs/benchmark/LOT-SR-*.md` (verbatim, one per session).
Honesty rule: ESTIMATE = unverified; UNTESTED = never compiled/run.
