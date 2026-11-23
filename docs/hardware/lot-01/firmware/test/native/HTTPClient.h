// Host shim of ESP32 HTTPClient backed by the curl CLI (http:// only is used in the native test).
#pragma once
#include <cstdlib>
#include <string>
#include <vector>
#include "Arduino.h"
#include "WiFiClientSecure.h"

class StringStream : public Stream {
 public:
  std::string buf; size_t pos = 0;
  int read() override { return pos < buf.size() ? (unsigned char)buf[pos++] : -1; }
};

class HTTPClient {
 public:
  void setTimeout(int ms) { timeoutS_ = ms / 1000 + 1; }
  bool begin(const String& url) { url_ = url.c_str(); return true; }
  bool begin(WiFiClientSecure&, const String& url) { return begin(url); }
  void addHeader(const String& k, const String& v) { headers_.push_back(std::string(k.c_str()) + ": " + v.c_str()); }
  int sendRequest(const char* method, const String& payload) {
    char bodyPath[] = "/tmp/lot01-native-XXXXXX";
    int fd = mkstemp(bodyPath); if (fd < 0) return -1;
    FILE* f = fdopen(fd, "w"); fputs(payload.c_str(), f); fclose(f);
    std::string cmd = "curl -s -m " + std::to_string(timeoutS_) + " -X " + method + " -o - -w '\\n%{http_code}'";
    for (auto& h : headers_) cmd += " -H '" + h + "'";
    if (payload.length()) cmd += std::string(" --data-binary @") + bodyPath;
    cmd += " '" + url_ + "'";
    FILE* p = popen(cmd.c_str(), "r"); if (!p) return -1;
    std::string out; char b[512]; size_t n;
    while ((n = fread(b, 1, sizeof b, p)) > 0) out.append(b, n);
    pclose(p); remove(bodyPath);
    size_t nl = out.rfind('\n'); if (nl == std::string::npos) return -1;
    int code = atoi(out.c_str() + nl + 1);
    stream_.buf = out.substr(0, nl); stream_.pos = 0;
    lastCode = code;
    return code > 0 ? code : -1;
  }
  Stream& getStream() { return stream_; }
  void end() { headers_.clear(); }
  int lastCode = 0;
 private:
  std::string url_; std::vector<std::string> headers_; int timeoutS_ = 9; StringStream stream_;
};
