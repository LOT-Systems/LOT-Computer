// LOT·01 — peripheral drivers (P1: breakout boards; EVT: same buses).
#include "hw.h"
#include "config.h"
#include <Wire.h>
#include <Adafruit_SharpMem.h>
#include <SparkFun_MAX1704x_Fuel_Gauge_Arduino_Library.h>
#include <bsec2.h>

static Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_SI, PIN_LCD_SCS, LCD_W, LCD_H);
static SFE_MAX1704X gauge(MAX1704X_MAX17048);
static Bsec2 bsec;
static LotEnv g_env;

static void bsecCallback(const bme68xData, const bsecOutputs outputs, Bsec2) {
  for (uint8_t i = 0; i < outputs.nOutputs; i++) {
    const bsecData& o = outputs.output[i];
    switch (o.sensor_id) {
      case BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_TEMPERATURE: g_env.c = o.signal; break;
      case BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_HUMIDITY:    g_env.rh = o.signal; break;
      case BSEC_OUTPUT_RAW_PRESSURE:                        g_env.hpa = o.signal / 100.0f; break;
      case BSEC_OUTPUT_IAQ:                                 g_env.iaq = o.signal; break;
    }
  }
}

namespace hw {

void begin() {
  pinMode(PIN_HAPTIC_EN, OUTPUT); digitalWrite(PIN_HAPTIC_EN, LOW);
  pinMode(PIN_CAM_PWR_EN, OUTPUT); digitalWrite(PIN_CAM_PWR_EN, LOW);
  pinMode(PIN_CHG_STAT, INPUT_PULLUP);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, 400000);
  lcd.begin();
  lcd.setRotation(0);
  gauge.begin();
  bsecSensor list[] = {BSEC_OUTPUT_IAQ, BSEC_OUTPUT_RAW_PRESSURE,
                       BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_TEMPERATURE,
                       BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_HUMIDITY};
  if (bsec.begin(BME68X_I2C_ADDR_HIGH, Wire)) {
    bsec.updateSubscription(list, ARRAY_LEN(list), BSEC_SAMPLE_RATE_ULP);  // ultra-low-power, 5 min
    bsec.attachCallback(bsecCallback);
  }
  // LSM6DSOX: configure double-tap → INT1 in P1 (MLC/FSM config blob from ST Unico-GUI).
}

void showText(const String& text, const String& footer) {
  lcd.clearDisplay();
  lcd.setTextColor(0);  // black on reflective white
  lcd.setTextSize(2);   // 12 px wide glyphs → 10 chars/line, 5 lines ≈ 50 chars
  lcd.setCursor(4, 8);
  lcd.setTextWrap(true);
  lcd.print(text.substring(0, LOT_MAX_TEXT));
  if (footer.length()) {
    lcd.setTextSize(1);
    lcd.setCursor(4, LCD_H - 12);
    lcd.print(footer);
  }
  lcd.refresh();
}

void showPairCode(const String& userCode) {
  showText("Pair at\nlot-systems\n.com", userCode);
  lcd.setTextSize(2);
  lcd.setCursor(4, 80);
  lcd.print(userCode);
  lcd.refresh();
}

void buzz(uint8_t pulses) {
  for (uint8_t i = 0; i < pulses; i++) {
    digitalWrite(PIN_HAPTIC_EN, HIGH); delay(120);
    digitalWrite(PIN_HAPTIC_EN, LOW);  delay(120);
  }
}

LotEnv readEnv() {
  uint32_t until = millis() + 2500;
  while (millis() < until) { bsec.run(); delay(10); }
  return g_env;
}

int batteryPct() { return (int)gauge.getSOC(); }
int batteryMv() { return (int)(gauge.getVoltage() * 1000); }
bool onCharger() { return digitalRead(PIN_CHG_STAT) == LOW; }

void powerDownPeripherals() {
  digitalWrite(PIN_CAM_PWR_EN, LOW);
  digitalWrite(PIN_HAPTIC_EN, LOW);
  // LCD keeps the image; EXTCOMIN handled per 06-FIRMWARE.md §3.
}

}  // namespace hw
