// LOT SQ-1 — portable firmware core (HW-02)
// Pure C++17: no Arduino, no ESP-IDF, no heap. Everything here is unit-tested on the
// host with g++ (firmware/test/test_lot_core.cpp), so the device logic is verified
// even when the ESP32 toolchain is unavailable.
#pragma once
#include <cstddef>
#include <cstdint>

namespace lot {

// ---- limits (mirror config.h / Device API v1) ----
constexpr uint32_t kMinSyncS = 60;
constexpr uint32_t kMaxSyncS = 7200;
constexpr uint32_t kDefaultSyncS = 900;
constexpr uint32_t kLowBatFloorS = 1800;  // device-side floor when battery < 10 %
constexpr size_t kMaxChars = 48;          // notification text, in code points
constexpr uint32_t kLongPressMs = 1500;   // COPY long press → photo
constexpr uint32_t kPortalPressMs = 10000;// COPY 10 s → SoftAP pairing portal

// Sync interval the device will actually sleep for.
// `requested` comes from the server (`next_sync_s`); <=0 means "absent".
// batPct < 0 means "gauge unavailable".
uint32_t clampSync(int64_t requested, int batPct);

// Exponential back-off after failed syncs (no Wi-Fi, 5xx, timeout):
// base, 2×, 4× … capped at kMaxSyncS. failures == 0 returns base unchanged.
uint32_t backoffS(uint8_t failures, uint32_t base);

enum class Press : uint8_t { None, Short, Long, Portal };
// Classify how long COPY was held after an EXT0 wake.
Press classifyPress(uint32_t heldMs);

// Copy `in` to `out` for the e-paper:
//  * drops ASCII control chars and invalid UTF-8 bytes,
//  * collapses runs of whitespace into one space, trims both ends,
//  * truncates to `maxChars` code points on a code-point boundary, adding "…" (U+2026)
//    in the last slot when it had to cut.
// Always NUL-terminates when outSize > 0. Returns the number of code points written.
size_t sanitizeText(const char *in, char *out, size_t outSize, size_t maxChars = kMaxChars);

// Greedy word wrap. `widthPx(s, len)` measures a byte range in pixels (font metrics
// come from the display driver on the device, a fixed-width stub in tests).
// Writes up to `maxLines` lines as [start, len) byte ranges into `starts`/`lens`.
// Words longer than a line are hard-split on a code-point boundary.
// Returns the number of lines; if the text does not fit, the last line ends with
// as much as fits and the function returns maxLines.
using WidthFn = int (*)(const char *s, size_t len);
size_t wrapLines(const char *text, int maxWidthPx, WidthFn widthPx,
                 size_t *starts, size_t *lens, size_t maxLines);

// Footer "21C  87%" / "--C  87%" / "21C" when battery is unknown.
void formatFooter(char *out, size_t outSize, bool envOk, float tempC, int batPct);

}  // namespace lot
