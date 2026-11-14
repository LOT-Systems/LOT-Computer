#!/usr/bin/env python3
"""
lotctl — host software for LOT TILE (LOT-HW-01).

  lotctl.py hello    --port /dev/ttyACM0                 identify device
  lotctl.py wifi     --port /dev/ttyACM0 SSID PASSWORD   store Wi-Fi credentials
  lotctl.py api      --port /dev/ttyACM0 URL             set API host (default https://lot-systems.com)
  lotctl.py status   --port /dev/ttyACM0
  lotctl.py forget   --port /dev/ttyACM0                 drop pairing token
  lotctl.py console  --port /dev/ttyACM0                 tail firmware log
  lotctl.py mock-server [--port 8787]                    reference /api/device/* server (in-memory)
  lotctl.py simulate --host http://127.0.0.1:8787        run the firmware's API flow without hardware

Serial commands need `pip install pyserial`. mock-server/simulate use only the stdlib.
Protocol: hardware/lot-tile/docs/05-FIRMWARE.md §8 and docs/06-LOT-API-CONNECTOR.md.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import secrets
import sys
import threading
import time
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

NOTIFY_MAX = 48
PAYLOAD_MAX = 512
PHOTO_MAX = 60 * 1024
CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


# --------------------------------------------------------------------------- serial
def serial_cmd(port: str, line: str, read_s: float = 2.0) -> str:
    try:
        import serial  # type: ignore
    except ImportError:
        sys.exit("pyserial missing: pip install pyserial")
    with serial.Serial(port, 115200, timeout=0.2) as s:
        s.reset_input_buffer()
        s.write((line + "\n").encode())
        out, t0 = b"", time.time()
        while time.time() - t0 < read_s:
            out += s.read(256)
            if b"\nOK" in b"\n" + out or b"ERR" in out:
                break
        reply = [l for l in out.decode(errors="replace").splitlines() if l.startswith(("OK", "ERR"))]
        return reply[-1] if reply else out.decode(errors="replace").strip()


def serial_console(port: str) -> None:
    import serial  # type: ignore

    with serial.Serial(port, 115200, timeout=0.5) as s:
        try:
            while True:
                chunk = s.readline()
                if chunk:
                    print(chunk.decode(errors="replace"), end="")
        except KeyboardInterrupt:
            pass


# ---------------------------------------------------------------------- mock server
def compress_line(text: str, limit: int = NOTIFY_MAX) -> str:
    """Server rule for pager lines: <=48 chars, cut on a word boundary, end with a period."""
    text = " ".join(text.split())
    if len(text) <= limit:
        return text
    cut = text[: limit - 1].rsplit(" ", 1)[0].rstrip(",;:-")
    return cut + "."


class Store:
    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.devices: dict[str, dict] = {}       # serial -> device
        self.tokens: dict[str, str] = {}         # sha256(token) -> serial
        self.notifications: list[dict] = []
        self.logs: list[dict] = []               # what would land in the Log tab
        self.seq = 0

    def push(self, serial: str, text: str, kind: str = "nudge") -> dict:
        with self.lock:
            self.seq += 1
            n = {"id": str(uuid.uuid4()), "seq": self.seq, "serial": serial,
                 "t": compress_line(text), "k": kind, "ts": int(time.time()), "delivered": False}
            self.notifications.append(n)
            return n


STORE = Store()


class Handler(BaseHTTPRequestHandler):
    server_version = "LOT-mock/0.1"

    def log_message(self, fmt, *args):  # quieter
        sys.stderr.write("[mock] " + fmt % args + "\n")

    # helpers
    def _json(self, code: int, obj: dict) -> None:
        body = json.dumps(obj, separators=(",", ":")).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self, limit: int = PAYLOAD_MAX) -> bytes | None:
        n = int(self.headers.get("Content-Length") or 0)
        if n > limit:
            self._json(413, {"error": "payload too large"})
            return None
        return self.rfile.read(n)

    def _device(self) -> dict | None:
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer ldt_"):
            self._json(401, {"error": "token required"})
            return None
        h = hashlib.sha256(auth[7:].encode()).hexdigest()
        serial = STORE.tokens.get(h)
        if not serial:
            self._json(401, {"error": "token revoked"})
            return None
        dev = STORE.devices[serial]
        dev["last_seen"] = int(time.time())
        return dev

    # routes
    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/api/device/sync":
            dev = self._device()
            if not dev:
                return
            since = int((parse_qs(u.query).get("since") or ["0"])[0] or 0)
            with STORE.lock:
                pending = [n for n in STORE.notifications
                           if n["serial"] == dev["serial"] and n["seq"] > since and not n["delivered"]]
                for n in pending:
                    n["delivered"] = True
                cur = max([since] + [n["seq"] for n in pending])
            return self._json(200, {"n": [{k: n[k] for k in ("id", "t", "k", "ts")} for n in pending],
                                    "cur": str(cur), "next_poll_s": 300})
        if u.path == "/mock/logs":  # inspect what the Log tab would show
            return self._json(200, {"logs": STORE.logs})
        self._json(404, {"error": "not found"})

    def do_POST(self):
        u = urlparse(self.path)
        if u.path == "/api/device/photo":
            dev = self._device()
            if not dev:
                return
            jpeg = self._body(PHOTO_MAX)
            if jpeg is None:
                return
            nid = self.headers.get("X-LOT-Notification", "")
            entry = {"id": str(uuid.uuid4()), "event": "device_photo", "text": f"[photo {len(jpeg)} B]",
                     "metadata": {"serial": dev["serial"], "notificationId": nid}}
            STORE.logs.append(entry)
            return self._json(200, {"log_id": entry["id"]})

        raw = self._body()
        if raw is None:
            return
        try:
            body = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            return self._json(400, {"error": "bad json"})

        if u.path == "/api/device/register":
            serial = str(body.get("serial", ""))[:32]
            if not serial:
                return self._json(400, {"error": "serial required"})
            code = "".join(secrets.choice(CROCKFORD) for _ in range(6))
            code = code[:3] + "-" + code[3:]
            with STORE.lock:
                dev = STORE.devices.setdefault(serial, {"serial": serial, "user": None})
                dev.update(hw_rev=body.get("hw_rev"), fw=body.get("fw"), pair_code=code,
                           pair_expires=time.time() + 600, pending_token=None)
            return self._json(200, {"pair_code": code, "expires_s": 600, "poll_s": 3})

        if u.path == "/api/devices/claim":  # browser side (cookie auth on the real site)
            code = str(body.get("pair_code", "")).upper()
            for dev in STORE.devices.values():
                if dev.get("pair_code") == code and time.time() < dev.get("pair_expires", 0):
                    token = "ldt_" + secrets.token_urlsafe(32)
                    STORE.tokens[hashlib.sha256(token.encode()).hexdigest()] = dev["serial"]
                    dev.update(user=body.get("user", "Vadik"), pending_token=token, pair_code=None)
                    return self._json(200, {"device": {"serial": dev["serial"]}})
            return self._json(404, {"error": "unknown or expired code"})

        if u.path == "/api/device/pair/poll":
            dev = STORE.devices.get(str(body.get("serial", "")))
            if not dev:
                return self._json(404, {"error": "unknown device"})
            token = dev.get("pending_token")
            if not token:
                return self._json(200, {"status": "pending"})
            dev["pending_token"] = None  # hand out once
            return self._json(200, {"token": token, "name": dev["user"]})

        if u.path == "/api/device/copy":
            dev = self._device()
            if not dev:
                return
            n = next((n for n in STORE.notifications if n["id"] == body.get("nid")
                      and n["serial"] == dev["serial"]), None)
            if not n:
                return self._json(404, {"error": "unknown notification"})
            entry = {"id": str(uuid.uuid4()), "event": "device_copy", "text": n["t"],
                     "metadata": {"serial": dev["serial"], "notificationId": n["id"], "kind": n["k"]},
                     "context": {"source": "lot-tile", "weather": dev.get("telemetry")}}
            STORE.logs.append(entry)
            return self._json(200, {"log_id": entry["id"]})

        if u.path == "/api/device/telemetry":
            dev = self._device()
            if not dev:
                return
            dev["telemetry"] = {k: body.get(k) for k in ("tc", "rh", "hpa", "iaq", "gc", "lux", "bat", "rssi")}
            return self._json(200, {"ok": True})

        if u.path == "/mock/push":  # stand-in for the device-nudge scheduled job
            n = STORE.push(str(body.get("serial")), str(body.get("text", "")), str(body.get("kind", "nudge")))
            return self._json(200, {"id": n["id"], "t": n["t"]})

        self._json(404, {"error": "not found"})


def run_mock(port: int) -> ThreadingHTTPServer:
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    return srv


# ------------------------------------------------------------------------ simulator
def http(host: str, method: str, path: str, body: dict | None = None, token: str | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(host + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def simulate(host: str, serial: str = "LTSIM-000001", auto_claim: bool = True) -> int:
    """Mirrors firmware/src/main.cpp: register -> pair -> sync -> copy -> telemetry."""
    st, reg = http(host, "POST", "/api/device/register", {"serial": serial, "hw_rev": "SIM", "fw": "0.1.0"})
    assert st == 200, reg
    print(f"[LCD] Pair: {reg['pair_code']} | lot-systems.com")
    if auto_claim:  # on the real site the user types the code in Settings -> Devices
        st, _ = http(host, "POST", "/api/devices/claim", {"pair_code": reg["pair_code"]})
        assert st == 200
    token = None
    for _ in range(40):
        st, p = http(host, "POST", "/api/device/pair/poll", {"serial": serial, "pair_code": reg["pair_code"]})
        if p.get("token"):
            token = p["token"]
            print(f"[LCD] Hello, {p['name']}.")
            break
        time.sleep(reg.get("poll_s", 3))
    assert token, "pairing timed out"

    http(host, "POST", "/mock/push", {"serial": serial, "text": "Coffee time!"})
    st, s = http(host, "GET", "/api/device/sync?since=0", token=token)
    assert st == 200 and s["n"], s
    latest = s["n"][-1]
    print("[HAPTIC] pager pulse")
    print(f"[LCD] {latest['t']} | next poll {s['next_poll_s']} s")

    st, c = http(host, "POST", "/api/device/copy", {"nid": latest["id"]}, token)
    assert st == 200, c
    print("[LCD] Copied.")
    st, _ = http(host, "POST", "/api/device/telemetry",
                 {"tc": 21.4, "rh": 41, "hpa": 1013.2, "iaq": 38, "gc": 2, "lux": 320, "bat": 81, "rssi": -58}, token)
    assert st == 200
    st, again = http(host, "GET", f"/api/device/sync?since={s['cur']}", token=token)
    assert st == 200 and not again["n"], "notification delivered twice"
    st, bad = http(host, "GET", "/api/device/sync", token="ldt_invalid")
    assert st == 401, "revoked token must be rejected"
    print("simulate: OK (register, pair, sync, copy->Log, telemetry, no re-delivery, 401 on bad token)")
    return 0


def selftest() -> int:
    srv = run_mock(0)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        assert compress_line("Coffee time!") == "Coffee time!"
        long = "It is a good moment to stand up, stretch and pour a warm cup of coffee now"
        c = compress_line(long)
        assert len(c) <= NOTIFY_MAX and c.endswith("."), c
        simulate(f"http://127.0.0.1:{port}")
        st, logs = http(f"http://127.0.0.1:{port}", "GET", "/mock/logs")
        assert logs["logs"][0]["event"] == "device_copy" and logs["logs"][0]["text"] == "Coffee time!"
        print("selftest: OK")
        return 0
    finally:
        srv.shutdown()


# ------------------------------------------------------------------------------ cli
def main() -> int:
    ap = argparse.ArgumentParser(prog="lotctl", description="LOT TILE host software")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("hello", "status", "forget", "console"):
        p = sub.add_parser(name)
        p.add_argument("--port", required=True)
    p = sub.add_parser("wifi"); p.add_argument("--port", required=True); p.add_argument("ssid"); p.add_argument("password")
    p = sub.add_parser("api"); p.add_argument("--port", required=True); p.add_argument("url")
    p = sub.add_parser("mock-server"); p.add_argument("--port", type=int, default=8787)
    p = sub.add_parser("simulate"); p.add_argument("--host", default="http://127.0.0.1:8787"); p.add_argument("--serial", default="LTSIM-000001")
    sub.add_parser("selftest")
    a = ap.parse_args()

    if a.cmd in ("hello", "status", "forget"):
        print(serial_cmd(a.port, a.cmd.upper()))
    elif a.cmd == "wifi":
        if " " in a.ssid:
            sys.exit("SSID with spaces not supported by the v0.1 line protocol")
        print(serial_cmd(a.port, f"WIFI {a.ssid} {a.password}"))
    elif a.cmd == "api":
        print(serial_cmd(a.port, f"API {a.url.rstrip('/')}"))
    elif a.cmd == "console":
        serial_console(a.port)
    elif a.cmd == "mock-server":
        srv = run_mock(a.port)
        print(f"LOT mock device API on http://127.0.0.1:{a.port}  (Ctrl-C to stop)")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass
    elif a.cmd == "simulate":
        return simulate(a.host, a.serial)
    elif a.cmd == "selftest":
        return selftest()
    return 0


if __name__ == "__main__":
    sys.exit(main())
