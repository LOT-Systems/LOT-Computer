#!/usr/bin/env bash
# Build one PDF per document: pandoc (MD → standalone HTML) → Chromium (HTML → PDF).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/pdf"; TMP="$(mktemp -d)"; mkdir -p "$OUT"
for md in "$DIR"/0*.md; do
  name="$(basename "$md" .md)"
  pandoc "$md" -s --metadata lang=en -c "$DIR/print.css" --embed-resources -o "$TMP/$name.html"
done
node "$DIR/html-to-pdf.cjs" "$TMP" "$OUT"
rm -rf "$TMP"
