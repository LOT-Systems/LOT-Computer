// LOT SQ-1 — portable firmware core (HW-02). See lot_core.h.
#include "lot_core.h"

#include <cmath>
#include <cstdio>

namespace lot {

uint32_t clampSync(int64_t requested, int batPct) {
  uint32_t s = requested <= 0 ? kDefaultSyncS
             : requested < kMinSyncS ? kMinSyncS
             : requested > kMaxSyncS ? kMaxSyncS
             : static_cast<uint32_t>(requested);
  if (batPct >= 0 && batPct < 10 && s < kLowBatFloorS) s = kLowBatFloorS;
  return s;
}

uint32_t backoffS(uint8_t failures, uint32_t base) {
  if (base < kMinSyncS) base = kMinSyncS;
  uint64_t s = base;
  for (uint8_t i = 0; i < failures && s < kMaxSyncS; i++) s *= 2;
  return s > kMaxSyncS ? kMaxSyncS : static_cast<uint32_t>(s);
}

Press classifyPress(uint32_t heldMs) {
  if (heldMs < 30) return Press::None;  // bounce / ESD glitch
  if (heldMs >= kPortalPressMs) return Press::Portal;
  if (heldMs >= kLongPressMs) return Press::Long;
  return Press::Short;
}

// Length of the UTF-8 sequence starting at p (0 = invalid). Checks continuation bytes.
static size_t utf8Len(const unsigned char *p) {
  size_t n = p[0] < 0x80 ? 1 : (p[0] >> 5) == 0x6 ? 2 : (p[0] >> 4) == 0xE ? 3
           : (p[0] >> 3) == 0x1E ? 4 : 0;
  for (size_t i = 1; i < n; i++)
    if ((p[i] & 0xC0) != 0x80) return 0;
  return n;
}

size_t sanitizeText(const char *in, char *out, size_t outSize, size_t maxChars) {
  if (!out || outSize == 0) return 0;
  out[0] = '\0';
  if (!in || maxChars == 0) return 0;
  static const char kEllipsis[] = "\xE2\x80\xA6";  // U+2026, 3 bytes

  // Normalise into code points.
  size_t w = 0, cps = 0;
  bool pendingSpace = false, cut = false;
  const unsigned char *p = reinterpret_cast<const unsigned char *>(in);
  while (*p) {
    size_t n = utf8Len(p);
    if (n == 0) { p++; continue; }                       // invalid byte: drop
    bool space = n == 1 && (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r');
    if (n == 1 && !space && (*p < 0x20 || *p == 0x7F)) { p++; continue; }  // control
    if (space) { pendingSpace = cps > 0; p++; continue; }
    size_t need = n + (pendingSpace ? 1 : 0);
    size_t needCps = 1 + (pendingSpace ? 1 : 0);
    if (cps + needCps > maxChars || w + need + 1 > outSize) { cut = true; break; }
    if (pendingSpace) {
      out[w++] = ' '; cps++;
      pendingSpace = false;
    }
    for (size_t i = 0; i < n; i++) out[w++] = static_cast<char>(p[i]);
    cps++;
    p += n;
  }
  out[w] = '\0';
  if (!cut) return cps;

  // Make room for the ellipsis: drop code points until 1 slot and 3 bytes are free.
  while (cps > 0 && (cps + 1 > maxChars || w + sizeof(kEllipsis) > outSize)) {
    // step back one code point
    size_t b = w;
    do { b--; } while (b > 0 && (static_cast<unsigned char>(out[b]) & 0xC0) == 0x80);
    w = b; cps--;
  }
  while (w > 0 && out[w - 1] == ' ') { w--; cps--; }    // no space before "…"
  if (cps + 1 <= maxChars && w + sizeof(kEllipsis) <= outSize) {
    for (size_t i = 0; i < sizeof(kEllipsis) - 1; i++) out[w++] = kEllipsis[i];
    cps++;
  }
  out[w] = '\0';
  return cps;
}

size_t wrapLines(const char *text, int maxWidthPx, WidthFn widthPx,
                 size_t *starts, size_t *lens, size_t maxLines) {
  if (!text || !widthPx || maxLines == 0) return 0;
  size_t lines = 0, i = 0;
  while (text[i] && lines < maxLines) {
    while (text[i] == ' ') i++;
    if (!text[i]) break;
    size_t lineStart = i, lineEnd = i;  // [lineStart, lineEnd) committed
    size_t j = i;
    while (text[j]) {
      size_t wordEnd = j;
      while (text[wordEnd] && text[wordEnd] != ' ') wordEnd++;
      if (widthPx(text + lineStart, wordEnd - lineStart) <= maxWidthPx) {
        lineEnd = wordEnd; j = wordEnd;
        if (text[j] == ' ') j++;
        continue;
      }
      if (lineEnd == lineStart) {
        // Single word wider than the line: hard-split on a code-point boundary.
        size_t k = lineStart;
        while (k < wordEnd) {
          size_t next = k + 1;
          while (next < wordEnd && (static_cast<unsigned char>(text[next]) & 0xC0) == 0x80) next++;
          if (widthPx(text + lineStart, next - lineStart) > maxWidthPx && k > lineStart) break;
          k = next;
        }
        lineEnd = k; j = k;
      }
      break;
    }
    starts[lines] = lineStart;
    lens[lines] = lineEnd - lineStart;
    lines++;
    i = lineEnd;
  }
  return lines;
}

void formatFooter(char *out, size_t outSize, bool envOk, float tempC, int batPct) {
  if (!out || outSize == 0) return;
  char t[8];
  if (envOk && std::isfinite(tempC)) std::snprintf(t, sizeof(t), "%.0fC", static_cast<double>(tempC));
  else std::snprintf(t, sizeof(t), "--C");
  if (batPct >= 0) std::snprintf(out, outSize, "%s  %d%%", t, batPct > 100 ? 100 : batPct);
  else std::snprintf(out, outSize, "%s", t);
}

}  // namespace lot
