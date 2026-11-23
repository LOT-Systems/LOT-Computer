// LOT·01 native test: runs the real firmware client (src/lot_api.cpp) + real ArduinoJson
// against the real server routes (connector/device-api.itest.mjs --serve). See run.sh.
#include <cstdio>
#include <cstdlib>
#include "../../src/config.h"
#include "../../src/lot_api.h"

static int pass = 0, fail = 0;
static void check(const char* name, bool ok, const String& extra = "") {
  ok ? pass++ : fail++;
  printf("%s %s %s\n", ok ? "✅" : "❌", name, extra.c_str());
}
static String base() { const char* b = getenv("LOT_TEST_ORIGIN"); return b ? b : "http://127.0.0.1:4499"; }
static bool sh(const String& cmd) { return system(cmd.c_str()) == 0; }

int main() {
  String deviceCode, userCode; uint32_t interval = 0;
  check("fw pairStart", lot::pairStart(deviceCode, userCode, interval) && userCode.startsWith("LOT-"), userCode);
  String token, deviceId;
  check("fw pairPoll pending", lot::pairPoll(deviceCode, token, deviceId) == 0);
  check("user claims code (Settings)", sh("curl -sf -o /dev/null -X POST -H 'Content-Type: application/json' -d '{\"user_code\":\"" + userCode + "\"}' " + base() + "/api/devices/claim"));
  check("fw pairPoll ok -> token", lot::pairPoll(deviceCode, token, deviceId) == 1 && token.startsWith("ld1_"));
  lot::begin(token);

  LotItem item; uint32_t next = 0;
  bool got = lot::inbox("", item, next);
  check("fw inbox empty; poll clamped 300..3600", !got && next >= LOT_MIN_POLL_S && next <= LOT_MAX_POLL_S, String((unsigned)next));
  check("site queues a message", sh("curl -sf -o /dev/null -X POST -H 'Content-Type: application/json' -d '{\"t\":\"Coffee time!\"}' " + base() + "/api/devices/test"));
  got = lot::inbox("", item, next);
  check("fw inbox receives \"Coffee time!\"", got && item.text == "Coffee time!" && item.kind == "test", item.text);
  check("fw ack", lot::ack(item.id));
  LotItem again;
  check("fw since-cursor: nothing new", !lot::inbox(item.id, again, next));

  LotEnv env; env.c = 21.5f; env.rh = 41.0f; env.hpa = 1013.2f; env.iaq = 25.0f;
  String logId;
  check("fw Copy -> Log row", lot::copy(item, env, logId) && logId.length() > 0, logId);
  check("fw telemetry", lot::telemetry(88, 4012, -58, 120));

  lot::begin("ld1_wrong");
  check("fw with bad token gets nothing", !lot::inbox("", again, next));
  printf("\n%d passed, %d failed\n", pass, fail);
  return fail ? 1 : 0;
}
