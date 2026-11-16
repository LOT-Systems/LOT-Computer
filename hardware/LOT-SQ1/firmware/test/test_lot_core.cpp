// Host unit tests for firmware/src/lot_core.* — no ESP32 toolchain needed.
//   g++ -std=c++17 -Wall -Wextra -Werror -I../src ../src/lot_core.cpp test_lot_core.cpp -o t && ./t
// or: firmware/test/run.sh
#include <cstdio>
#include <cstring>
#include <string>

#include "lot_core.h"

using namespace lot;
static int passed = 0, failed = 0;
#define CHECK(cond)                                                       \
  do {                                                                    \
    if (cond) passed++;                                                   \
    else { failed++; std::printf("FAIL %s:%d  %s\n", __FILE__, __LINE__, #cond); } \
  } while (0)

static size_t cpCount(const char *s) {
  size_t n = 0;
  for (; *s; s++) if ((static_cast<unsigned char>(*s) & 0xC0) != 0x80) n++;
  return n;
}
// Fixed-width stub: 10 px per code point (the device uses GxEPD2 getTextBounds).
static int w10(const char *s, size_t len) {
  int n = 0;
  for (size_t i = 0; i < len; i++) if ((static_cast<unsigned char>(s[i]) & 0xC0) != 0x80) n++;
  return n * 10;
}

int main() {
  // ---- clampSync ----
  CHECK(clampSync(0, 80) == kDefaultSyncS);
  CHECK(clampSync(-5, 80) == kDefaultSyncS);
  CHECK(clampSync(10, 80) == kMinSyncS);
  CHECK(clampSync(600, 80) == 600);
  CHECK(clampSync(99999, 80) == kMaxSyncS);
  CHECK(clampSync(600, 5) == kLowBatFloorS);     // low battery floor
  CHECK(clampSync(3600, 5) == 3600);             // already above the floor
  CHECK(clampSync(600, -1) == 600);              // unknown gauge: trust the server

  // ---- backoffS ----
  CHECK(backoffS(0, 900) == 900);
  CHECK(backoffS(1, 900) == 1800);
  CHECK(backoffS(2, 900) == 3600);
  CHECK(backoffS(3, 900) == kMaxSyncS);
  CHECK(backoffS(255, 900) == kMaxSyncS);
  CHECK(backoffS(1, 0) == 2 * kMinSyncS);

  // ---- classifyPress ----
  CHECK(classifyPress(5) == Press::None);
  CHECK(classifyPress(200) == Press::Short);
  CHECK(classifyPress(1499) == Press::Short);
  CHECK(classifyPress(1500) == Press::Long);
  CHECK(classifyPress(9999) == Press::Long);
  CHECK(classifyPress(10000) == Press::Portal);

  // ---- sanitizeText ----
  char out[200];
  CHECK(sanitizeText("Coffee time!", out, sizeof out) == 12 && !std::strcmp(out, "Coffee time!"));
  sanitizeText("  Coffee \n\t time!  ", out, sizeof out);
  CHECK(!std::strcmp(out, "Coffee time!"));
  sanitizeText("a\x01" "b\x7f" "c", out, sizeof out);
  CHECK(!std::strcmp(out, "abc"));
  sanitizeText("bad\xC3(utf8", out, sizeof out);            // truncated 2-byte seq dropped
  CHECK(!std::strcmp(out, "bad(utf8"));
  sanitizeText("Café ☕ 21°C", out, sizeof out);
  CHECK(!std::strcmp(out, "Café ☕ 21°C") && cpCount(out) == 11);
  {
    std::string longText(80, 'x');
    size_t n = sanitizeText(longText.c_str(), out, sizeof out);
    CHECK(n == kMaxChars && cpCount(out) == kMaxChars);
    CHECK(!std::strcmp(out + std::strlen(out) - 3, "\xE2\x80\xA6"));  // ends with …
  }
  {
    // Cut lands right after a word: no "word …" with a space before the ellipsis.
    size_t n = sanitizeText("Rain at 16:00 take the umbrella", out, sizeof out, 14);
    CHECK(n <= 14 && !std::strcmp(out, "Rain at 16:00\xE2\x80\xA6"));
  }
  {
    // Multi-byte text never split mid code point, even with a tiny byte buffer.
    char small[8];
    sanitizeText("☕☕☕☕☕", small, sizeof small, 48);
    CHECK(cpCount(small) >= 1 && std::strlen(small) < sizeof small);
    CHECK((static_cast<unsigned char>(small[std::strlen(small) - 1]) & 0xC0) == 0x80 ||
          static_cast<unsigned char>(small[std::strlen(small) - 1]) < 0x80);
  }
  CHECK(sanitizeText(nullptr, out, sizeof out) == 0 && out[0] == '\0');
  CHECK(sanitizeText("", out, sizeof out) == 0 && out[0] == '\0');

  // ---- wrapLines ----
  size_t st[6], ln[6];
  {
    const char *t = "Coffee time!";
    size_t n = wrapLines(t, 184, w10, st, ln, 6);  // 18 chars per line
    CHECK(n == 1 && ln[0] == 12);
  }
  {
    const char *t = "Rain at 16:00 take the umbrella";  // 31 chars
    size_t n = wrapLines(t, 184, w10, st, ln, 6);
    CHECK(n == 2);
    CHECK(std::string(t + st[0], ln[0]) == "Rain at 16:00 take");
    CHECK(std::string(t + st[1], ln[1]) == "the umbrella");
  }
  {
    const char *t = "Supercalifragilisticexpialidocious";  // 34 chars, one word
    size_t n = wrapLines(t, 184, w10, st, ln, 6);
    CHECK(n == 2 && ln[0] == 18 && ln[1] == 16);
  }
  {
    const char *t = "aa bb cc dd ee ff gg";
    size_t n = wrapLines(t, 50, w10, st, ln, 2);     // 5 chars/line, only 2 lines allowed
    CHECK(n == 2 && std::string(t + st[0], ln[0]) == "aa bb" && std::string(t + st[1], ln[1]) == "cc dd");
  }
  {
    const char *t = "☕☕☕";
    size_t n = wrapLines(t, 20, w10, st, ln, 6);     // 2 cups per line, split on code points
    CHECK(n == 2 && ln[0] == 6 && ln[1] == 3);
  }
  CHECK(wrapLines("   ", 100, w10, st, ln, 6) == 0);

  // ---- formatFooter ----
  formatFooter(out, sizeof out, true, 21.4f, 87);
  CHECK(!std::strcmp(out, "21C  87%"));
  formatFooter(out, sizeof out, false, 0, 87);
  CHECK(!std::strcmp(out, "--C  87%"));
  formatFooter(out, sizeof out, true, 21.6f, -1);
  CHECK(!std::strcmp(out, "22C"));

  std::printf("%d/%d passed\n", passed, passed + failed);
  return failed ? 1 : 0;
}
