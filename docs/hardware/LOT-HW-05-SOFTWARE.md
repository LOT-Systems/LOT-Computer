# LOT-HW-05 — Companion Software

## `hardware/tools/lot-pager-sim.mjs`: device simulator / CLI
Has no dependencies and needs Node 18+. It behaves like firmware v0.1, so you can try the whole loop before any hardware exists.
```
# 1) signed in on the site:  POST /api/devices {"name":"Pager 001"}  → copy the token
LOT_HOST=https://lot-systems.com LOT_DEVICE_TOKEN=lotd_... node hardware/tools/lot-pager-sim.mjs
#   <Enter> = Copy → Log tab     s = send sensor reading     q = quit
```
Verified in S3 against a local server: notice "Coffee time!" drawn → Enter → Log row `device_copy | Coffee time! | Sim`.

## `hardware/tools/device-api-e2e.mjs`: connector test
Runs against a throwaway Postgres database (it refuses to run unless `DB_NAME` contains "test"). 23 checks: pairing, auth, inbox, ack, copy, sensor clamp and rate limit, Log tab visibility, cross-user isolation, revoke.

## `hardware/tools/build-pdfs.mjs`: manuals
Turns `docs/hardware/*.md` into `docs/hardware/pdf/*.pdf` with pandoc and headless Chromium.

## Planned (S4+)
A settings page "Devices" (pair, show token once, revoke, test notice). Factory provisioning: the jig writes the token into NVS over USB at the test station. OTA push.
