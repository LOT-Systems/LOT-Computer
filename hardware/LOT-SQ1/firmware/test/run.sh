#!/usr/bin/env bash
# Host unit tests for the portable firmware core (no ESP32 toolchain needed).
set -euo pipefail
cd "$(dirname "$0")"
OUT="$(mktemp -d)/t"
g++ -std=c++17 -Wall -Wextra -Wpedantic -Werror -fsanitize=address,undefined -I../src \
  ../src/lot_core.cpp test_lot_core.cpp -o "$OUT"
"$OUT"
