#!/usr/bin/env bash
# LOT·01 native firmware test: real lot_api.cpp + ArduinoJson 7.2.1 on the host, talking to the real server routes.
#   ARDUINOJSON_SRC=/path/to/ArduinoJson/src  (folder holding ArduinoJson.h; from github.com/bblanchon/ArduinoJson v7.2.1)
#   DB_* env for a throwaway Postgres, and `yarn server:build` done in the repo root.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../../../../.." && pwd)"
PORT="${PORT:-4499}"; OUT="${OUT:-$(mktemp -d)}"
: "${ARDUINOJSON_SRC:?set ARDUINOJSON_SRC to ArduinoJson/src}"
g++ -std=c++17 -Wall -Wno-unused-function -DARDUINO=10819 -DARDUINOJSON_ENABLE_PROGMEM=0 -DLOT_INSECURE_DEV \
  -DLOT_API_BASE="\"http://127.0.0.1:$PORT/device-api/v1\"" \
  -I"$HERE" -I"$ARDUINOJSON_SRC" "$HERE/test_lot_api.cpp" "$HERE/../../src/lot_api.cpp" -o "$OUT/lot01-native"
cd "$ROOT"
LOT_DEVICES_ENABLED=true node docs/hardware/lot-01/connector/device-api.itest.mjs --serve "$PORT" > "$OUT/server.log" 2>&1 &
SRV=$!; trap 'kill $SRV 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do grep -q "test server on" "$OUT/server.log" && break; sleep 0.5; done
LOT_TEST_ORIGIN="http://127.0.0.1:$PORT" "$OUT/lot01-native"
