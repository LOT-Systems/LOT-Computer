#!/usr/bin/env python3
"""CUBIQ(tm) signal contract v0.6-draft (R11 revision) — Python reference + vector runner.
Stdlib only. Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md §02 (F85).

R11 changes ONE thing in the R10 draft (scripts/cubiq-r10-contract-v06.py, loaded unchanged):
the timestamp rule. v0.5 fixed the SYNTAX (YYYY-MM-DDTHH:MM[:SS[.ffffff]](Z|+-HH:MM)) and left
the CALENDAR to each library. They disagree inside the profile (found by the R11 C fuzz):
  * Python fromisoformat accepts offset minutes >= 60 ("+05:60" is read as +06:00, "+05:99" as
    +06:39). JavaScript and the C port reject them.
  * V8 Date.parse accepts 2026-02-29, 2026-04-31 and T24:00 (it rolls them over), and keeps
    milliseconds only. Python and the C port reject the dates and compare in microseconds.
Calendar rule (v0.6-draft, all three implementations):
  year 0001-9999 · month 01-12 · day valid for the month, Gregorian leap years · hour 00-23 ·
  minute 00-59 · second 00-59 (no leap second) · fraction 1-6 digits, microseconds ·
  offset hours 00-23, offset minutes 00-59 · comparisons in integer microseconds.
Vectors: docs/corporate/cubiq/signal-contract-v0.6-draft-r11-vectors.json (82). Exit 0 iff all pass."""
import importlib.util
import json
import os
import sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("r10v06_for_r11", os.path.join(HERE, "cubiq-r10-contract-v06.py"))
base = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(base)


def ts(s):
    if not isinstance(s, str) or not base.TS_PROFILE.match(s):
        raise ValueError(s)
    if s[-1] != "Z":
        oh, om = int(s[-5:-3]), int(s[-2:])
        if oh > 23 or om > 59:                       # Python alone would accept +05:60
            raise ValueError(s)
    return datetime.fromisoformat(s.replace("Z", "+00:00"))   # month/day/hour/min/sec checked here


base.ts = ts                                         # validate() and decide() look ts up at call time
decide = base.decide
validate = base.validate


def main():
    path = os.path.join(HERE, "..", "docs", "corporate", "cubiq", "signal-contract-v0.6-draft-r11-vectors.json")
    vectors = json.load(open(path))["vectors"]
    fails = 0
    for v in vectors:
        got = decide(v["signal"], v["state"])
        want = (v["expect"]["event"], v["expect"]["performed"], v["expect"]["downgrade_reason"])
        if got != want:
            fails += 1
            print(f"  FAIL  {v['name']}  got {got}  want {want}")
    print(f"  contract v0.6-draft (R11): {len(vectors) - fails}/{len(vectors)} vectors pass (Python decide)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
