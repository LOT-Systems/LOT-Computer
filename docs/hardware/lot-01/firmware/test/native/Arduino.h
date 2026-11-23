// Host shim of the Arduino core: just enough for lot_api.cpp + ArduinoJson to compile and run on Linux.
#pragma once
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <ctime>
#include <string>

class String {
 public:
  String() {}
  String(const char* s) { if (s) s_ = s; }
  String(const std::string& s) : s_(s) {}
  explicit String(int v) : s_(std::to_string(v)) {}
  explicit String(unsigned v) : s_(std::to_string(v)) {}
  String& operator=(const char* s) { s_ = s ? s : ""; return *this; }
  const char* c_str() const { return s_.c_str(); }
  unsigned length() const { return (unsigned)s_.size(); }
  bool concat(const char* s) { s_ += s; return true; }
  bool startsWith(const String& p) const { return s_.rfind(p.s_, 0) == 0; }
  String substring(unsigned from, unsigned to) const { if (from > s_.size()) return String(); return String(s_.substr(from, to - from)); }
  String& operator+=(const String& o) { s_ += o.s_; return *this; }
  String& operator+=(const char* o) { s_ += o; return *this; }
  friend String operator+(const String& a, const String& b) { return String(a.s_ + b.s_); }
  friend String operator+(const String& a, const char* b) { return String(a.s_ + b); }
  friend String operator+(const char* a, const String& b) { return String(std::string(a) + b.s_); }
  bool operator==(const char* o) const { return s_ == o; }
 private:
  std::string s_;
};

class Print {
 public:
  virtual ~Print() {}
  virtual size_t write(uint8_t c) = 0;
  virtual size_t write(const uint8_t* b, size_t n) { size_t i = 0; while (i < n && write(b[i])) i++; return i; }
};

class Printable {
 public:
  virtual ~Printable() {}
  virtual size_t printTo(Print& p) const = 0;
};

class Stream : public Print {
 public:
  virtual int read() = 0;
  size_t readBytes(char* buf, size_t n) { size_t i = 0; int c; while (i < n && (c = read()) >= 0) buf[i++] = (char)c; return i; }
  size_t write(uint8_t) override { return 0; }
};

// Arduino defines constrain as a macro (mixed argument types allowed).
#define constrain(amt, low, high) ((amt) < (low) ? (low) : ((amt) > (high) ? (high) : (amt)))
using std::isnan;
