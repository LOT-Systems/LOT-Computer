#!/usr/bin/env python3
"""CUBIQ(tm) signal contract v0.5 — Python reference + vector runner. Stdlib only.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md §02.
v0.5 = v0.4 (scripts/cubiq-r08-fsm-sim.py decide(), imported unchanged) + one input rule:
  * not_before must match the strict profile YYYY-MM-DDTHH:MM[:SS[.ffffff]](Z|+-HH:MM).
    v0.4 accepted whatever datetime.fromisoformat() accepted, and crashed (TypeError) when the
    string carried no offset, because it was then compared with an offset-aware `now` (F66).
Vectors: docs/corporate/cubiq/signal-contract-v0.5-vectors.json (59). Exit 0 only if all pass."""
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("r08", os.path.join(HERE, "cubiq-r08-fsm-sim.py"))
r08 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(r08)

TS_PROFILE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$")


def decide(sig, st):
    nb = sig.get("not_before")
    if isinstance(nb, str) and not TS_PROFILE.match(nb):
        err = r08.c03.validate({**sig, "not_before": "2000-01-01T00:00:00Z"})
        return "rejected", "none", err or "bad_not_before"   # earlier field errors still win
    return r08.decide(sig, st)


def main():
    path = os.path.join(HERE, "..", "docs", "corporate", "cubiq", "signal-contract-v0.5-vectors.json")
    vectors = json.load(open(path))["vectors"]
    fails = 0
    for v in vectors:
        got = decide(v["signal"], v["state"])
        want = (v["expect"]["event"], v["expect"]["performed"], v["expect"]["downgrade_reason"])
        fails += got != want
        if got != want:
            print(f"  FAIL  {v['name']}  got {got}  want {want}")
    print(f"  contract v0.5: {len(vectors) - fails}/{len(vectors)} vectors pass (Python decide)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
