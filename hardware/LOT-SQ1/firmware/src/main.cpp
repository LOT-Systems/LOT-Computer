// LOT SQ-1 — pager firmware v0.1 (single-file skeleton; split into modules in HW-02)
// Wake → (sync | copy | photo | gesture) → render → deep sleep.
// NOT YET COMPILED — first build happens at P1 breadboard bring-up.

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <Wire.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <GxEPD2_BW.h>
#include <Fonts/FreeSansBold12pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include <bme68xLibrary.h>
#include <SparkFun_MAX1704x_Fuel_Gauge_Arduino_Library.h>
#include "esp_camera.h"
#include "config.h"

// ---------- state kept across deep sleep (RTC RAM) ----------
RTC_DATA_ATTR char rtcText[SQ1_MAX_TEXT + 1] = "";
RTC_DATA_ATTR char rtcNotifId[40] = "";
RTC_DATA_ATTR uint32_t rtcNextSyncS = SQ1_DEFAULT_SYNC_S;
RTC_DATA_ATTR uint32_t rtcBootCount = 0;

// Root CA for lot-systems.com — TODO(HW-02): paste the production chain root.
static const char *LOT_ROOT_CA = nullptr;

Preferences prefs;
GxEPD2_BW<GxEPD2_154_GDEY0154D67, GxEPD2_154_GDEY0154D67::HEIGHT> epd(
    GxEPD2_154_GDEY0154D67(PIN_EPD_CS, PIN_EPD_DC, PIN_EPD_RST, PIN_EPD_BUSY));
Bme68x bme;
SFE_MAX1704X gauge(MAX1704X_MAX17048);

struct Env { float t, h, p, gasOhm; bool ok; };

// ---------- helpers ----------
static void buzz(int times) {
  pinMode(PIN_VIBE, OUTPUT);
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_VIBE, HIGH); delay(BUZZ_ON_MS);
    digitalWrite(PIN_VIBE, LOW);  delay(BUZZ_GAP_MS);
  }
}

static void drawWrapped(const char *text, int16_t y0) {
  // Greedy word wrap for a 200 px wide panel, centred lines.
  String words(text), line;
  int16_t y = y0, x1, y1; uint16_t w, h;
  auto flush = [&](const String &l) {
    epd.getTextBounds(l, 0, 0, &x1, &y1, &w, &h);
    epd.setCursor((200 - w) / 2 - x1, y); epd.print(l); y += 30;
  };
  while (words.length()) {
    int sp = words.indexOf(' ');
    String word = sp < 0 ? words : words.substring(0, sp);
    words = sp < 0 ? "" : words.substring(sp + 1);
    String trial = line.length() ? line + " " + word : word;
    epd.getTextBounds(trial, 0, 0, &x1, &y1, &w, &h);
    if (w > 184 && line.length()) { flush(line); line = word; } else line = trial;
  }
  if (line.length()) flush(line);
}

static void render(const char *main, const char *footer, bool full) {
  SPI.begin(PIN_EPD_SCK, -1, PIN_EPD_MOSI, PIN_EPD_CS);
  epd.init(115200, full, 2, false);
  epd.setRotation(0);
  epd.setTextColor(GxEPD_BLACK);
  if (full) epd.setFullWindow(); else epd.setPartialWindow(0, 0, 200, 200);
  epd.firstPage();
  do {
    epd.fillScreen(GxEPD_WHITE);
    epd.setFont(&FreeSansBold12pt7b);
    drawWrapped(main, 80);
    epd.setFont(&FreeSans9pt7b);
    epd.setCursor(8, 192); epd.print(footer);
  } while (epd.nextPage());
  epd.hibernate();  // panel keeps the image at 0 W
}

static Env readEnv() {
  Env e{0, 0, 0, 0, false};
  bme.begin(0x76, Wire);
  if (bme.checkStatus() == BME68X_ERROR) return e;
  bme.setTPH();
  bme.setHeaterProf(300, 100);
  bme.setOpMode(BME68X_FORCED_MODE);
  delayMicroseconds(bme.getMeasDur());
  delay(110);
  bme68xData d;
  if (bme.fetchData()) {
    bme.getData(d);
    e = {d.temperature, d.humidity, d.pressure / 100.0f, d.gas_resistance, true};
  }
  // TODO(HW-02): BSEC2 → iaq + AI-Studio gas class ("coffee", "fresh_air", ...)
  return e;
}

static int batteryPct() {
  if (!gauge.begin(Wire)) return -1;
  return (int)constrain(gauge.getSOC(), 0, 100);
}

static bool wifiUp() {
  String ssid = prefs.getString("ssid", ""), pass = prefs.getString("pass", "");
  if (!ssid.length()) return false;
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 8000) delay(50);
  return WiFi.status() == WL_CONNECTED;
}

// POST JSON or raw bytes; returns HTTP status, fills `out` with the reply body.
static int apiPost(const char *path, const char *ctype, const uint8_t *body, size_t len,
                   String &out, const char *extraHdrName = nullptr, const char *extraHdrVal = nullptr) {
  String host = prefs.getString("host", SQ1_API_HOST);
  String url = host + SQ1_API_PREFIX + path;
  HTTPClient http;
  WiFiClientSecure tls;
  WiFiClient plain;
  if (url.startsWith("https://")) {
    if (LOT_ROOT_CA) tls.setCACert(LOT_ROOT_CA);
#ifdef SQ1_DEV_INSECURE
    else tls.setInsecure();  // dev only, never in release builds
#endif
    http.begin(tls, url);
  } else {
    http.begin(plain, url);  // local mock server on the LAN
  }
  http.setTimeout(SQ1_HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", ctype);
  String token = prefs.getString("token", "");
  if (token.length()) http.addHeader("Authorization", "Bearer " + token);
  if (extraHdrName) http.addHeader(extraHdrName, extraHdrVal);
  int code = http.POST((uint8_t *)body, len);
  out = code > 0 ? http.getString() : "";
  http.end();
  return code;
}

// ---------- actions ----------
static void doPair(const String &code) {
  JsonDocument req;
  req["code"] = code;
  req["serial"] = prefs.getString("serial", "SQ1-DEV");
  req["fw"] = SQ1_FW_VERSION;
  String body, out; serializeJson(req, body);
  int st = apiPost("/pair", "application/json", (const uint8_t *)body.c_str(), body.length(), out);
  JsonDocument res;
  if (st == 200 && !deserializeJson(res, out) && res["device_token"].is<const char *>()) {
    prefs.putString("token", res["device_token"].as<const char *>());
    String hello = String("Hello, ") + (res["name"] | "friend");
    render(hello.c_str(), "paired", true);
  } else {
    render("Pairing failed", "check the code", true);
  }
}

static void doSync(const char *wake) {
  Env e = readEnv();
  int bat = batteryPct();
  JsonDocument req;
  req["fw"] = SQ1_FW_VERSION;
  req["bat"] = bat;
  req["rssi"] = WiFi.RSSI();
  req["wake"] = wake;
  if (e.ok) {
    JsonObject env = req["env"].to<JsonObject>();
    env["t"] = roundf(e.t * 10) / 10; env["h"] = roundf(e.h); env["p"] = roundf(e.p * 10) / 10;
    env["gr"] = (uint32_t)e.gasOhm;
  }
  if (rtcNotifId[0]) req["seen"].to<JsonArray>().add(rtcNotifId);
  String body, out; serializeJson(req, body);
  int st = apiPost("/sync", "application/json", (const uint8_t *)body.c_str(), body.length(), out);
  if (st == 401) { prefs.remove("token"); render("Pair at lot-systems.com", "Settings > Devices", true); return; }
  if (st != 200) return;  // keep the screen as it is; retry on the next wake
  JsonDocument res;
  if (deserializeJson(res, out)) return;
  rtcNextSyncS = constrain((uint32_t)(res["next_sync_s"] | SQ1_DEFAULT_SYNC_S), SQ1_MIN_SYNC_S, SQ1_MAX_SYNC_S);
  JsonVariant n = res["notification"];
  if (!n.isNull()) {
    strlcpy(rtcText, n["text"] | "", sizeof(rtcText));
    strlcpy(rtcNotifId, n["id"] | "", sizeof(rtcNotifId));
    char footer[32];
    snprintf(footer, sizeof(footer), "%.0fC  %d%%", e.t, bat);
    render(rtcText, footer, true);
    if (!(res["quiet"] | false)) buzz(n["buzz"] | 2);
  }
}

static void doCopy() {
  if (!rtcText[0]) return;
  JsonDocument req;
  req["notification_id"] = rtcNotifId;
  req["text"] = rtcText;
  String body, out; serializeJson(req, body);
  int st = apiPost("/copy", "application/json", (const uint8_t *)body.c_str(), body.length(), out);
  render(rtcText, st == 200 ? "copied to Log" : "copy failed", false);
  buzz(1);
}

static void doPhoto() {
  digitalWrite(PIN_CAM_PWR, HIGH);  // privacy LED on (same rail)
  delay(20);
  Wire.end();  // camera SCCB takes over the shared I2C pins
  camera_config_t c = {};
  c.pin_pwdn = -1; c.pin_reset = -1; c.pin_xclk = PIN_CAM_XCLK;
  c.pin_sccb_sda = PIN_I2C_SDA; c.pin_sccb_scl = PIN_I2C_SCL;
  c.pin_d0 = PIN_CAM_D0; c.pin_d1 = PIN_CAM_D1; c.pin_d2 = PIN_CAM_D2; c.pin_d3 = PIN_CAM_D3;
  c.pin_d4 = PIN_CAM_D4; c.pin_d5 = PIN_CAM_D5; c.pin_d6 = PIN_CAM_D6; c.pin_d7 = PIN_CAM_D7;
  c.pin_vsync = PIN_CAM_VSYNC; c.pin_href = PIN_CAM_HREF; c.pin_pclk = PIN_CAM_PCLK;
  c.xclk_freq_hz = 20000000; c.ledc_timer = LEDC_TIMER_0; c.ledc_channel = LEDC_CHANNEL_0;
  c.pixel_format = PIXFORMAT_JPEG; c.frame_size = FRAMESIZE_VGA; c.jpeg_quality = 12;
  c.fb_count = 1; c.fb_location = CAMERA_FB_IN_PSRAM; c.grab_mode = CAMERA_GRAB_LATEST;
  // TODO(HW-02): GC0308 outputs YUV, not JPEG — convert with frame2jpg() for the thin module.
  bool ok = esp_camera_init(&c) == ESP_OK;
  camera_fb_t *fb = ok ? esp_camera_fb_get() : nullptr;
  String out; int st = -1;
  if (fb && fb->len <= PHOTO_MAX_BYTES)
    st = apiPost("/photo", "image/jpeg", fb->buf, fb->len, out, "X-Notification-Id", rtcNotifId);
  if (fb) esp_camera_fb_return(fb);
  if (ok) esp_camera_deinit();
  digitalWrite(PIN_CAM_PWR, LOW);  // privacy LED off
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  render(rtcText[0] ? rtcText : "LOT", st == 200 ? "photo to Log" : "photo failed", false);
  buzz(1);
}

// Breadboard provisioning over USB serial (BLE/SoftAP portal in HW-02):
//   wifi <ssid> <password> | host <url> | serial <SQ1-0042> | pair <123456>
static void serialProvision() {
  render("Pair at lot-systems.com", "Settings > Devices", true);
  uint32_t t0 = millis();
  while (millis() - t0 < 120000) {
    if (!Serial.available()) { delay(20); continue; }
    String l = Serial.readStringUntil('\n'); l.trim();
    if (l.startsWith("wifi ")) { int s = l.indexOf(' ', 5); prefs.putString("ssid", l.substring(5, s)); prefs.putString("pass", s > 0 ? l.substring(s + 1) : ""); Serial.println("ok"); }
    else if (l.startsWith("host ")) { prefs.putString("host", l.substring(5)); Serial.println("ok"); }
    else if (l.startsWith("serial ")) { prefs.putString("serial", l.substring(7)); Serial.println("ok"); }
    else if (l.startsWith("pair ")) { if (wifiUp()) doPair(l.substring(5)); else Serial.println("wifi failed"); if (prefs.getString("token", "").length()) return; }
  }
}

static void sleepNow() {
  WiFi.disconnect(true); WiFi.mode(WIFI_OFF);
  esp_sleep_enable_timer_wakeup((uint64_t)rtcNextSyncS * 1000000ULL);
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_BTN_COPY, 0);
  esp_sleep_enable_ext1_wakeup(1ULL << PIN_IMU_INT1, ESP_EXT1_WAKEUP_ANY_HIGH);
  esp_deep_sleep_start();
}

void setup() {
  rtcBootCount++;
  Serial.begin(115200);
  pinMode(PIN_BTN_COPY, INPUT_PULLUP);
  pinMode(PIN_CAM_PWR, OUTPUT); digitalWrite(PIN_CAM_PWR, LOW);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  prefs.begin("sq1", false);

  if (!prefs.getString("token", "").length()) serialProvision();

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  if (cause == ESP_SLEEP_WAKEUP_EXT0) {
    uint32_t t0 = millis();
    while (digitalRead(PIN_BTN_COPY) == LOW && millis() - t0 < LONG_PRESS_MS) delay(10);
    bool longPress = millis() - t0 >= LONG_PRESS_MS;
    if (wifiUp()) { if (longPress) doPhoto(); else doCopy(); }
  } else if (cause == ESP_SLEEP_WAKEUP_EXT1) {
    // TODO(HW-02): read LSM6DSOX MLC result; double-tap → weather card (no network)
    Env e = readEnv();
    char l[40]; snprintf(l, sizeof(l), "%.0fC  %.0f%%  %.0fhPa", e.t, e.h, e.p);
    render(l, rtcText, false);
    delay(4000);
    if (rtcText[0]) render(rtcText, "", false);
  } else {
    if (wifiUp()) doSync(cause == ESP_SLEEP_WAKEUP_TIMER ? "timer" : "boot");
  }
  sleepNow();
}

void loop() {}
