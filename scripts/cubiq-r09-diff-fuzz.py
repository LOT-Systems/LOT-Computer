#!/usr/bin/env python3
"""CUBIQ(tm) — R09 differential check: Python reference decide() (contract v0.5,
scripts/cubiq-r09-contract-v05.py) against the TypeScript platform reference
(src/shared/cubiq/signal-contract.ts). Stdlib + `node` on PATH. Also counts how often the
v0.4 Python reference (R08) crashes on the same inputs.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md §02.

Draws N seeded random (signal, state) pairs from pools of valid and malformed values, runs both
implementations, and buckets every disagreement by cause. Two pools are deliberately included
because they stress the wire format (R09 F66):
  * integer fields written as floats (2.0): Python's json keeps a float, JavaScript cannot
    tell. KNOWN divergence; closed by the encoder rule, not by the decoder.
  * timestamps outside the v0.5 profile (no offset, space separator, date-only, week dates).
    v0.4 parsers disagreed (and Python crashed); v0.5 must agree on all of them.
Every disagreement outside the float pool is a bug. Exit 0 only if there are none."""
import importlib.util
import json
import os
import random
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("v05", os.path.join(HERE, "cubiq-r09-contract-v05.py"))
v05 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(v05)
r08 = v05.r08

N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
rng = random.Random(20261122)

CLASSES = ["memory_ready", "badge_common", "badge_rare", "assembly_phase", "cohort_ping"] * 4 + [
           "kiln_cooled", "constructor", "__proto__", "toString", ""]
INTENTS = ["settle", "nudge", "hop", "leap", "jump"] * 4 + ["none", "shake", "valueOf", "LEAP"]
GESTURES = ["settle", "nudge", "hop", "leap", "jump", "none", "cartwheel", "constructor", "hasOwnProperty"]
GOOD_TS = ["2026-11-22T09:00:00Z", "2026-11-22T09:00:00+00:00", "2026-11-22T10:00:00+01:00",
           "2026-11-22T09:00Z", "2026-11-22T09:00:00.250Z", "2026-11-22T08:30:00Z"]
ODD_TS = ["2026-11-22 09:00:00Z", "2026-11-22", "2026-11-22T09:00:00", "2026-W47-7T09:00:00Z", "20261122T090000Z"]
BAD_TS = ["yesterday", "", "2026-13-40T99:99:99Z", "09:00"]
NOWS = ["2026-11-22T09:00:05Z"] * 6 + ["2026-11-22T08:59:00Z", "2026-11-22T11:00:00Z", "2026-11-23T12:00:00Z"]


def signal(kind):
    s = {"v": rng.choice([2] * 8 + [1, 3]), "id": "sig_fuzz", "class": rng.choice(CLASSES),
         "intent": rng.choice(INTENTS), "priority": rng.choice([0, 1, 2, 3] * 4 + [-1, 4]),
         "ttl_s": rng.choice([60, 900, 3600, 21600, 86400] * 4 + [0, 90000]),
         "not_before": rng.choice(GOOD_TS)}
    if kind == "float":
        s[rng.choice(["v", "priority", "ttl_s"])] = float(s["priority"] if rng.random() < .5 else 2)
    if kind == "odd_ts":
        s["not_before"] = rng.choice(ODD_TS)
    if rng.random() < 0.05:
        s["not_before"] = rng.choice(BAD_TS)
    r = rng.random()
    if r < 0.15:
        s["ceiling_hint"] = rng.choice(["call_live", None, "party"])
    if rng.random() < 0.04:
        s.pop(rng.choice(list(s)))
    if rng.random() < 0.03:
        s["priority"] = rng.choice([True, "2"])
    if rng.random() < 0.05:
        s["extra_field"] = {"ignored": True}
    return s


def state():
    st = {"now": rng.choice(NOWS), "device": rng.choice(["v0", "v1"]),
          "surface": rng.choice(["damped", "damped", "resonant", "unknown"]),
          "free_ahead_mm": rng.choice([10, 30, 40, 60, 70, 84, 85, 100, 124, 125, 150, 200, 201, 300]),
          "level_deg": rng.choice([0.0, 0.5, 2.9, 3.0, 3.1, 5.0])}
    for k in ("hush", "quiet_hours", "fall_recent", "machine_vibration", "tof_window_dirty", "unplaced"):
        if rng.random() < 0.12:
            st[k] = rng.random() < 0.8
    if rng.random() < 0.1:
        st["cadence_ok"] = rng.random() < 0.5
    if rng.random() < 0.1:
        st["call_live_opt_in"] = rng.random() < 0.5
    if rng.random() < 0.3:
        st["operator_ceilings"] = {rng.choice(CLASSES): rng.choice(GESTURES) for _ in range(rng.randint(1, 3))}
    if rng.random() < 0.3:
        st["pad"] = {"model_ok": rng.random() < 0.7, "home_spot": rng.random() < 0.7}
    return st


def py_decide(sig, st, impl=None):
    try:
        return list((impl or v05.decide)(sig, st))
    except Exception as e:                       # the Python reference crashing is itself a finding
        return ["crash", type(e).__name__, str(e)[:40]]


def main():
    kinds = ["plain"] * 90 + ["float"] * 5 + ["odd_ts"] * 5
    cases, tags = [], []
    for _ in range(N):
        k = rng.choice(kinds)
        cases.append({"signal": signal(k), "state": state()})
        tags.append(k)
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "cases.json")
        json.dump(cases, open(p, "w"))
        out = subprocess.run(["node", os.path.join(HERE, "cubiq-r09-contract-check.ts"), "--cases", p],
                             capture_output=True, text=True, check=True).stdout
    ts_res = json.loads(out)
    buckets, outcomes, example = {}, {}, {}
    v04_crash = sum(py_decide(c["signal"], c["state"], r08.decide)[0] == "crash" for c in cases)
    for c, k, t in zip(cases, tags, ts_res):
        p = py_decide(c["signal"], c["state"])
        outcomes[p[0]] = outcomes.get(p[0], 0) + 1
        if p != t:
            buckets[k] = buckets.get(k, 0) + 1
            example.setdefault(k, (c, p, t))
    print(f"  {N} random cases · outcome mix (Python): "
          + ", ".join(f"{k} {v}" for k, v in sorted(outcomes.items(), key=lambda x: -x[1])))
    print(f"  v0.4 Python reference crashes on the same inputs: {v04_crash}   v0.5: {outcomes.get('crash', 0)}")
    for k in ("plain", "float", "odd_ts"):
        n = tags.count(k)
        print(f"  {k:7s} {n:6d} cases   disagreements {buckets.get(k, 0):5d}"
              + ("   (KNOWN, F66: encoder rule)" if k == "float" and buckets.get(k) else ""))
        if k in example:
            c, p, t = example[k]
            print(f"          e.g. not_before={c['signal'].get('not_before')!r} "
                  f"priority={c['signal'].get('priority')!r} v={c['signal'].get('v')!r} -> py {p} ts {t}")
    bad = buckets.get("plain", 0) + buckets.get("odd_ts", 0) + outcomes.get("crash", 0)
    print("  PASS: no disagreement outside the known divergences" if not bad else f"  FAIL: {bad} unexplained")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
