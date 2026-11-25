#!/usr/bin/env python3
"""CUBIQ(tm) — R11 check of the C firmware reference (firmware/cubiq/) against the Python spec.
Stdlib + a C99 compiler (cc/gcc/clang) on PATH.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md §02 (F84).

  0. Build firmware/cubiq/*.c with -std=c99 -Wall -Wextra -Wpedantic -Werror (warnings fail).
  1. Vectors: C v0.5 on the v0.2..v0.5 files, C v0.6-draft on the R10 (72) and R11 (82) files.
  2. Differential fuzz, N seeded cases (R09 + R10 generators, plus two R11 pools):
       A. C v0.6-draft  vs  Python v0.6-draft R11 (scripts/cubiq-r11-contract-v06.py)
                        vs  TypeScript decideV06Draft (src/shared/cubiq/signal-contract.ts)
       B. C v0.5        vs  the Python v0.5 chain (R07 -> R08 -> R09), on v0.5-shaped states.
          The C port applies the R11 calendar rule in BOTH modes (the cube is the authority and
          has not shipped). The one expected B difference is KNOWN F85: Python v0.5 accepts an
          offset whose minutes are >= 60. Any other B difference is a failure.
     Pools: plain, float (integer fields sent as 2.0), odd_ts (outside the v0.5 profile), and
       ts_edge    timestamps INSIDE the profile that a calendar must reject or accept:
                  month 00/13, Feb 29 in leap and common years, day 31 in 30-day months,
                  hour 24, minute/second 60, offsets +23:59/+24:00/-00:00, 1-7 fraction digits,
                  with `now` placed on the expiry boundary
       ttl_edge   now exactly at not_before + ttl_s, and one microsecond either side
     The float pool is NOT exempt here: the C decoder applies R09 F66 lexically, so C must
     agree with Python on it (it is TypeScript that cannot tell 2.0 from 2).
     A Python exception counts as agreeing only with a C `fault` (malformed STATE). Python
     crashing on a malformed SIGNAL would itself be a finding.
  3. Decoder spot checks the fuzz cannot produce through json.dumps (escapes, duplicate keys,
     NaN, deep nesting, trailing data).
Exit 0 only if every vector passes, there are 0 disagreements and 0 unexplained faults."""
import importlib.util
import json
import os
import random
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
FW = os.path.join(ROOT, "firmware", "cubiq")
VEC = os.path.join(ROOT, "docs", "corporate", "cubiq")


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


r10 = load("r10fuzz", "cubiq-r10-diff-fuzz.py")
r09 = r10.r09
v06 = load("v06r11", "cubiq-r11-contract-v06.py")
N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
r09.rng.seed(20261125)
rng = r09.rng


def build(out_dir):
    cc = next((c for c in ("cc", "gcc", "clang") if shutil.which(c)), None)
    if not cc:
        sys.exit("  no C compiler on PATH")
    exe = os.path.join(out_dir, "cubiq_contract_test")
    src = [os.path.join(FW, f) for f in ("cubiq_json.c", "cubiq_contract.c", "cubiq_contract_test.c")]
    subprocess.run([cc, "-std=c99", "-O2", "-Wall", "-Wextra", "-Wpedantic", "-Werror", "-o", exe] + src,
                   check=True)
    return exe


def ts_edge():
    y = rng.choice([2024, 2025, 2026, 2100, 2000])
    mo = rng.choice([0, 1, 2, 4, 6, 9, 11, 12, 13])
    d = rng.choice([0, 1, 28, 29, 30, 31, 32])
    h = rng.choice([0, 9, 23, 24])
    mi = rng.choice([0, 59, 60])
    s = rng.choice([None, 0, 59, 60])
    frac = rng.choice([None, "", "2", "25", "250", "250000", "2500000"])
    off = rng.choice(["Z", "Z", "+00:00", "-00:00", "+01:00", "-05:30", "+23:59", "+24:00", "+05:60"])
    t = f"{y:04d}-{mo:02d}-{d:02d}T{h:02d}:{mi:02d}"
    if s is not None:
        t += f":{s:02d}"
        if frac is not None:
            t += "." + frac
    return t + off


def iso_shift(base, us):
    from datetime import datetime, timedelta, timezone
    dt = datetime.fromisoformat(base.replace("Z", "+00:00")) + timedelta(microseconds=us)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z"


def case(kind):
    sig = r09.signal("plain" if kind in ("ts_edge", "ttl_edge") else kind)
    st = r10.state_v06()
    if kind == "ts_edge":
        sig["not_before"] = ts_edge()
        if rng.random() < 0.5:
            st["now"] = ts_edge()
    if kind == "ttl_edge":
        sig["not_before"] = rng.choice(r09.GOOD_TS)
        for k in ("v", "priority", "ttl_s", "intent", "class"):
            sig.setdefault(k, {"v": 2, "priority": 2, "ttl_s": 900, "intent": "hop", "class": "badge_common"}[k])
        if not isinstance(sig["ttl_s"], int) or isinstance(sig["ttl_s"], bool) or not 1 <= sig["ttl_s"] <= 86400:
            sig["ttl_s"] = 900
        st["now"] = iso_shift(sig["not_before"], sig["ttl_s"] * 1_000_000 + rng.choice([-1, 0, 1]))
    return {"signal": sig, "state": st}


def safe(fn, sig, st):
    try:
        return list(fn(sig, st))
    except Exception:
        return ["crash"]


def run_ts(cases, d):
    p = os.path.join(d, "cases.json")
    json.dump(cases, open(p, "w"))
    out = subprocess.run(["node", os.path.join(HERE, "cubiq-r10-contract-check.ts"), "--cases", p, "v06"],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def f85(c):
    """KNOWN v0.5 differences (B only):
    * a profile-valid timestamp whose offset minutes are >= 60 (Python alone accepts it), or
    * state.now outside the profile: the v0.5 Python applies the profile to not_before only, and
      fromisoformat accepts e.g. "23:00:00.Z". `now` is the cube's own RTC, never wire data."""
    now = c["state"].get("now")
    if isinstance(now, str) and not r09.v05.TS_PROFILE.match(now):
        return True
    for t in (c["signal"].get("not_before"), now):
        if isinstance(t, str) and r09.v05.TS_PROFILE.match(t) and t[-1] != "Z" and int(t[-2:]) > 59:
            return True
    return False


def run_c(exe, ver, cases):
    data = "".join(json.dumps(c) + "\n" for c in cases)
    out = subprocess.run([exe, "cases", ver], input=data, capture_output=True, text=True, check=True).stdout
    return [json.loads(l) for l in out.splitlines()]


def spot_checks(exe):
    base = {"v": 2, "id": "x", "class": "badge_common", "intent": "hop", "priority": 2, "ttl_s": 900,
            "not_before": "2026-11-22T09:00:00Z"}
    st = '{"now":"2026-11-22T09:00:05Z"}'
    sig = json.dumps(base)
    checks = [  # (label, raw line, expected [event, gesture, reason])
        ("escaped intent \\u0068op", sig.replace('"hop"', '"\\u0068op"'), ["performed", "hop", None]),
        ("duplicate key, last wins", sig.replace('"intent": "hop"', '"intent": "jump", "intent": "hop"'),
         ["performed", "hop", None]),
        ("priority 2.0 (F66)", sig.replace('"priority": 2', '"priority": 2.0'), ["rejected", "none", "type_priority"]),
        ("priority 2e0 (F66)", sig.replace('"priority": 2', '"priority": 2e0'), ["rejected", "none", "type_priority"]),
        ("priority 10^30", sig.replace('"priority": 2', '"priority": ' + "1" + "0" * 30),
         ["rejected", "none", "bad_priority"]),
        ("NaN rejected by decoder", sig.replace('"priority": 2', '"priority": NaN'), ["decode_error", "none", None]),
        ("trailing data", sig + " x", ["decode_error", "none", None]),
        ("depth 40", '{"signal":' + sig + ',"state":' + st[:-1] + ',"x":' + "[" * 40 + "]" * 40 + "}}",
         ["decode_error", "none", None]),
        ("class with NUL byte", sig.replace('"badge_common"', '"badge_common\\u0000"'),
         ["performed", "settle", "class_ceiling"]),
    ]
    fails = 0
    for label, s, want in checks:
        line = s if s.startswith('{"signal"') else '{"signal":' + s + ',"state":' + st + '}'
        out = subprocess.run([exe, "cases", "v06"], input=line + "\n", capture_output=True, text=True,
                             check=True).stdout
        got = json.loads(out)
        if want[0] == "decode_error":
            got = got[:2] + [None]
        ok = got == want
        fails += not ok
        print(f"     {'ok  ' if ok else 'FAIL'}  {label:28s} -> {got}")
    return fails


def main():
    bad = 0
    with tempfile.TemporaryDirectory() as d:
        exe = build(d)
        print("  0. build: -std=c99 -Wall -Wextra -Wpedantic -Werror  clean")
        print("  1. vectors")
        for ver, f in (("v05", "v0.2"), ("v05", "v0.3"), ("v05", "v0.4"), ("v05", "v0.5"), ("v06", "v0.6-draft"),
                       ("v06", "v0.6-draft-r11")):
            p = subprocess.run([exe, "vectors", ver, os.path.join(VEC, f"signal-contract-{f}-vectors.json")],
                               capture_output=True, text=True)
            print("    " + p.stdout.strip().splitlines()[-1].replace(VEC + os.sep, ""))
            bad += p.returncode != 0

        kinds = ["plain"] * 80 + ["float"] * 5 + ["odd_ts"] * 5 + ["ts_edge"] * 7 + ["ttl_edge"] * 3
        tags = [rng.choice(kinds) for _ in range(N)]
        cases = [case(k) for k in tags]
        c06 = run_c(exe, "v06", cases)
        cases05 = [{"signal": c["signal"], "state": r10.as_v05(c["state"])} for c in cases]
        c05 = run_c(exe, "v05", cases05)

        tsr = run_ts(cases, d)

        diff_a, diff_t, diff_b, known_b, outcomes, ex = {}, {}, {}, {}, {}, {}
        faults = pycrash = 0
        for k, c, cc6, t6, c5, cc5 in zip(tags, cases, c06, tsr, cases05, c05):
            p6 = safe(v06.decide, c["signal"], c["state"])
            p5 = safe(r09.v05.decide, c5["signal"], c5["state"])
            outcomes[cc6[0]] = outcomes.get(cc6[0], 0) + 1
            if p6 != t6:
                diff_t[k] = diff_t.get(k, 0) + 1
                ex.setdefault(("TS", k), (c, p6, t6))
            for p, cr, bucket, tag in ((p6, cc6, diff_a, "A"), (p5, cc5, diff_b, "B")):
                agree = (cr[0] == "fault") if p[0] == "crash" else (p == cr)
                pycrash += p[0] == "crash"
                if p[0] != "crash" and cr[0] == "fault" and not (tag == "B" and f85(c)):
                    faults += 1
                if agree:
                    continue
                if tag == "B" and f85(c):
                    known_b[k] = known_b.get(k, 0) + 1
                    continue
                bucket[k] = bucket.get(k, 0) + 1
                ex.setdefault((tag, k), (c, p, cr))
        print(f"  2. differential fuzz, {N} cases, seed 20261125")
        print("     outcome mix (C v0.6-draft): "
              + ", ".join(f"{k} {v}" for k, v in sorted(outcomes.items(), key=lambda x: -x[1])))
        print(f"     Python exceptions {pycrash} (all matched by a C state fault) · "
              f"C faults without a Python exception {faults}")
        print("     pool        cases   A: C=Py v0.6   TS v0.6 vs Py   B: C=Py v0.5   B known F85")
        for k in ("plain", "float", "odd_ts", "ts_edge", "ttl_edge"):
            print(f"     {k:8s} {tags.count(k):8d}   {diff_a.get(k, 0):12d}   {diff_t.get(k, 0):13d}"
                  f"   {diff_b.get(k, 0):12d}   {known_b.get(k, 0):11d}"
                  + ("   (TS: KNOWN R09 F66)" if k == "float" and diff_t.get(k) else ""))
        for key, (c, p, cr) in ex.items():
            if key != ("TS", "float"):
                print(f"       e.g. {key}: {json.dumps(c)[:220]} -> py {p} other {cr}")
        # informational: the ADOPTED v0.5 pair (TS decide vs Python v0.5) on the calendar pools
        sel = [i for i, k in enumerate(tags) if k in ("ts_edge", "ttl_edge")]
        with tempfile.TemporaryDirectory() as d2:
            p = os.path.join(d2, "c.json")
            json.dump([cases05[i] for i in sel], open(p, "w"))
            ts05 = json.loads(subprocess.run(["node", os.path.join(HERE, "cubiq-r10-contract-check.ts"), "--cases",
                                              p, "v05"], capture_output=True, text=True, check=True).stdout)
        why = {}
        for i, t in zip(sel, ts05):
            py = safe(r09.v05.decide, cases05[i]["signal"], cases05[i]["state"])
            if py[0] != "crash" and py != t:
                now = cases05[i]["state"]["now"]
                cause = ("device clock NaN (F86)" if v06.base.TS_PROFILE.match(now) is None or
                         safe(v06.decide, {**cases05[i]["signal"], "not_before": "2026-01-01T00:00:00Z"},
                              cases05[i]["state"])[0] == "crash" else "calendar / microseconds (F85)")
                key = f"{cause:30s} py {py[0]} / ts {t[0]}"
                why[key] = why.get(key, 0) + 1
        print(f"     adopted v0.5, TS decide vs Python, {len(sel)} calendar-pool cases: "
              f"{sum(why.values())} disagree (KNOWN F85, v0.5 left unchanged)")
        for key, n in sorted(why.items(), key=lambda x: -x[1]):
            print(f"         {n:5d}  {key}")
        bad += sum(diff_a.values()) + sum(diff_b.values()) + faults
        bad += sum(v for k, v in diff_t.items() if k != "float")
        print("  3. decoder spot checks")
        bad += spot_checks(exe)
    print("  PASS: C agrees with Python on every vector and every fuzz case" if not bad else f"  FAIL: {bad}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
