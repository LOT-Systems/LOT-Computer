// LOT·01 — HTTPS JSON client for the LOT device API.
#include "lot_api.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Root CAs for lot-systems.com (Let's Encrypt). VERIFY the live chain before PVT:
//   openssl s_client -connect lot-systems.com:443 -showcerts </dev/null | grep -E "s:|i:"
// If the edge uses another CA (e.g. Google Trust Services via Cloudflare), append that root here.
// ISRG Root X1 (RSA, expires 2035-06-04) SHA-256 96:BC:EC:06:...:BD:DF:08:C6
// ISRG Root X2 (ECDSA, expires 2040-09-17) SHA-256 69:72:9B:8E:...:3C:CB:14:70
static const char* LOT_ROOT_CA = R"PEM(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIICGzCCAaGgAwIBAgIQQdKd0XLq7qeAwSxs6S+HUjAKBggqhkjOPQQDAzBPMQsw
CQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJuZXQgU2VjdXJpdHkgUmVzZWFyY2gg
R3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBYMjAeFw0yMDA5MDQwMDAwMDBaFw00
MDA5MTcxNjAwMDBaME8xCzAJBgNVBAYTAlVTMSkwJwYDVQQKEyBJbnRlcm5ldCBT
ZWN1cml0eSBSZXNlYXJjaCBHcm91cDEVMBMGA1UEAxMMSVNSRyBSb290IFgyMHYw
EAYHKoZIzj0CAQYFK4EEACIDYgAEzZvVn4CDCuwJSvMWSj5cz3es3mcFDR0HttwW
+1qLFNvicWDEukWVEYmO6gbf9yoWHKS5xcUy4APgHoIYOIvXRdgKam7mAHf7AlF9
ItgKbppbd9/w+kHsOdx1ymgHDB/qo0IwQDAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0T
AQH/BAUwAwEB/zAdBgNVHQ4EFgQUfEKWrt5LSDv6kviejM9ti6lyN5UwCgYIKoZI
zj0EAwMDaAAwZQIwe3lORlCEwkSHRhtFcP9Ymd70/aTSVaYgLXTWNLxBo1BfASdW
tL4ndQavEi51mI38AjEAi/V3bNTIZargCyzuFJ0nN6T5U6VR5CmD1/iQMVtCnwr1
/q4AaOeMSQ+2b1tbFfLn
-----END CERTIFICATE-----
)PEM";

static String g_token;

static bool request(const char* method, const String& path, const JsonDocument* body, JsonDocument& out) {
  WiFiClientSecure tls;
#ifdef LOT_INSECURE_DEV
  (void)LOT_ROOT_CA;
  tls.setInsecure();            // simulator on LAN only, never in production builds
#else
  tls.setCACert(LOT_ROOT_CA);
#endif
  HTTPClient http;
  http.setTimeout(8000);
  String url = String(LOT_API_BASE) + path;
  bool isHttps = url.startsWith("https://");
  if (isHttps ? !http.begin(tls, url) : !http.begin(url)) return false;
  http.addHeader("Content-Type", "application/json");
  if (g_token.length()) http.addHeader("Authorization", "Bearer " + g_token);

  String payload;
  if (body) serializeJson(*body, payload);
  int code = http.sendRequest(method, payload);
  if (code <= 0) { http.end(); return false; }
  DeserializationError err = deserializeJson(out, http.getStream());
  http.end();
  return code >= 200 && code < 300 && !err;
}

namespace lot {

bool begin(const String& token) { g_token = token; return true; }

bool pairStart(String& deviceCode, String& userCode, uint32_t& intervalS) {
  JsonDocument req, res;
  req["serial"] = WiFi.macAddress();
  req["fw"] = LOT_FW_VERSION;
  req["hw"] = LOT_HW_REV;
  if (!request("POST", "/pair/start", &req, res)) return false;
  deviceCode = res["device_code"].as<String>();
  userCode = res["user_code"].as<String>();
  intervalS = res["interval"] | 5;
  return deviceCode.length() > 0;
}

int pairPoll(const String& deviceCode, String& tokenOut, String& deviceIdOut) {
  JsonDocument req, res;
  req["device_code"] = deviceCode;
  if (!request("POST", "/pair/poll", &req, res)) return -1;
  if (res["status"] == "ok") {
    tokenOut = res["token"].as<String>();
    deviceIdOut = res["device_id"].as<String>();
    return 1;
  }
  return res["status"] == "pending" ? 0 : -1;
}

bool inbox(const String& since, LotItem& newest, uint32_t& nextPollS) {
  JsonDocument res;
  String path = "/inbox";
  if (since.length()) path += "?since=" + since;
  if (!request("GET", path, nullptr, res)) return false;
  nextPollS = constrain((uint32_t)(res["next_poll_s"] | LOT_DEFAULT_POLL_S), LOT_MIN_POLL_S, LOT_MAX_POLL_S);
  JsonArray items = res["items"].as<JsonArray>();
  if (items.isNull() || items.size() == 0) return false;
  JsonObject last = items[items.size() - 1];
  newest.id = last["id"].as<String>();
  newest.text = last["t"].as<String>().substring(0, LOT_MAX_TEXT);
  newest.kind = last["k"] | "nudge";
  newest.ts = last["ts"] | 0;
  return true;
}

bool ack(const String& id) {
  JsonDocument req, res;
  req["id"] = id;
  return request("POST", "/ack", &req, res);
}

bool copy(const LotItem& item, const LotEnv& env, String& logIdOut) {
  JsonDocument req, res;
  if (item.id.length()) req["id"] = item.id;
  req["t"] = item.text;
  req["ts"] = (uint32_t)time(nullptr);
  if (!isnan(env.c)) {
    JsonObject e = req["env"].to<JsonObject>();
    e["c"] = env.c; e["rh"] = env.rh; e["hpa"] = env.hpa;
    if (!isnan(env.iaq)) e["iaq"] = env.iaq;
  }
  if (!request("POST", "/copy", &req, res)) return false;
  logIdOut = res["log_id"].as<String>();
  return true;
}

bool telemetry(int batPct, int mv, int rssi, uint32_t uptimeS) {
  JsonDocument req, res;
  req["bat"] = batPct; req["mv"] = mv; req["rssi"] = rssi;
  req["fw"] = LOT_FW_VERSION; req["up_s"] = uptimeS;
  return request("POST", "/telemetry", &req, res);
  // TODO(P3): handle res["ota"] → esp_https_ota on Qi power only.
}

}  // namespace lot
