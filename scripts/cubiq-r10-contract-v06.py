#!/usr/bin/env python3
"""CUBIQ(tm) signal contract v0.6-DRAFT — Python reference + vector runner. Stdlib only.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md §02.

A standalone reference: the full decision order is written out here (no import of the v0.3-v0.5
scripts), so that the R10 differential fuzz compares two independent implementations of v0.6
and can also check this file against the v0.5 chain for regressions.

v0.6-draft over v0.5 (R09):
  * state.pad.edge_seen (R09 F75, R10 F78). Pad credit needs model_ok AND home_spot AND
    edge_seen, each the JSON literal `true`. A missing or non-boolean edge_seen gives NO credit:
    a credit without its evidence is no credit. The cube then uses its own probe and runway.
  * state.surface_motion (R10 F80): 'still' | 'gentle' | anything else.
      absent or 'still'  unchanged behaviour
      'gentle'           the surface moves as a rigid body with the cube on it (a moored boat):
                         G11 caps JUMP at LEAP. HOP and LEAP are unaffected (R10 §05 numbers).
      anything else      treated as 'rough': deferred, reason G11_moving_surface, retried
                         within the TTL like G9. Fail safe: unknown means rough.
    Order: expiry/hold -> G8 fall -> G9 machine vibration -> G11 rough -> caps... and the G11
    gentle cap sits right after G7 in the cap chain.
Vectors: docs/corporate/cubiq/signal-contract-v0.6-draft-vectors.json (72). Exit 0 iff all pass."""
import json
import os
import re
import sys
from datetime import datetime, timedelta

RANK = {"none": 0, "settle": 1, "nudge": 2, "hop": 3, "leap": 4, "jump": 5}
NAME = {v: k for k, v in RANK.items()}
CLASS_CEILING = {"memory_ready": "nudge", "badge_common": "hop", "badge_rare": "leap",
                 "assembly_phase": "settle", "cohort_ping": "settle"}
OPERATOR_MAX = "leap"
DEVICE_CAP = {"v0": "leap", "v1": "jump"}
REQUIRED = (("v", int), ("id", str), ("class", str), ("intent", str), ("priority", int),
            ("ttl_s", int), ("not_before", str))
FREE_AHEAD_MM = {"leap": 125, "hop": 85, "jump": 201}
PAD_FREE_AHEAD_MM = {"leap": 60, "hop": 20}           # deck-certified runway (R08 §04)
TS_PROFILE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$")


def ts(s):
    if not isinstance(s, str) or not TS_PROFILE.match(s):
        raise ValueError(s)
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def is_int(x):
    return isinstance(x, int) and not isinstance(x, bool)


def validate(sig):
    for k, t in REQUIRED:
        if k not in sig:
            return f"missing_{k}"
        if not (is_int(sig[k]) if t is int else isinstance(sig[k], str)):
            return f"type_{k}"
    if sig["v"] not in (1, 2):
        return "bad_version"
    if sig["intent"] not in RANK or sig["intent"] == "none":
        return "bad_intent"
    if not 0 <= sig["priority"] <= 3:
        return "bad_priority"
    if not 1 <= sig["ttl_s"] <= 86400:
        return "bad_ttl"
    if sig.get("ceiling_hint", None) not in (None, "call_live"):
        return "bad_ceiling_hint"
    if sig["v"] == 1 and "ceiling_hint" in sig:
        return "hint_requires_v2"
    try:
        ts(sig["not_before"])
    except ValueError:
        return "bad_not_before"
    return None


def class_ceiling(cls, op):
    default = CLASS_CEILING.get(cls, "settle") if isinstance(cls, str) else "settle"
    want = op.get(cls) if isinstance(op, dict) else None
    if not isinstance(want, str) or want not in RANK or want == "none":
        return default, "class_ceiling"
    if RANK[want] < RANK[default]:
        return want, "operator_ceiling"
    allowed = min(RANK[default] + 1, RANK[OPERATOR_MAX], RANK[want])
    return NAME[max(allowed, RANK[default])], "class_ceiling"


def pad_credit(st):
    pad = st.get("pad")
    return (isinstance(pad, dict) and pad.get("model_ok") is True and pad.get("home_spot") is True
            and pad.get("edge_seen") is True)


def decide(sig, st):
    err = validate(sig)
    if err:
        return "rejected", "none", err
    now, nb = ts(st["now"]), ts(sig["not_before"])
    if now > nb + timedelta(seconds=sig["ttl_s"]):
        return "expired", "none", None
    if now < nb:
        return "held", "none", None
    if st.get("fall_recent"):
        return "safe_hold", "none", "G8_fall_recent"
    if st.get("machine_vibration"):
        return "deferred", "none", "G9_machine_vibration"
    motion = st.get("surface_motion", "still")
    if motion not in ("still", "gentle"):
        return "deferred", "none", "G11_moving_surface"

    credit = pad_credit(st)
    surface = st.get("surface", "damped")
    if credit and not st.get("tof_window_dirty"):
        surface = "damped"                              # the pad certifies the SURFACE ...
    runway = dict(FREE_AHEAD_MM, **(PAD_FREE_AHEAD_MM if credit else {}))  # ... and the deck runway

    reason = None
    r = RANK[sig["intent"]]

    def cap(limit, why):
        nonlocal r, reason
        if RANK[limit] < r:
            r = RANK[limit]
            reason = reason or why

    device = st.get("device", "v0")
    if device not in DEVICE_CAP:
        return "rejected", "none", "bad_device"
    cap(DEVICE_CAP[device], "device_capability")
    cap(*class_ceiling(sig["class"], st.get("operator_ceilings")))
    if sig.get("ceiling_hint") == "call_live" and st.get("call_live_opt_in", True):
        cap("settle", "call_live")
    if st.get("quiet_hours"):
        cap("nudge", "quiet_hours")
    if st.get("hush"):
        cap("nudge", "G10_hush")
    if st.get("unplaced") or st.get("tof_window_dirty"):
        cap("settle", "G7_unknown_surface")
    if motion == "gentle":
        cap("leap", "G11_moving_surface")
    if not st.get("cadence_ok", True) and r >= RANK["hop"]:
        cap("nudge", "G4b_cadence")
    free = st.get("free_ahead_mm", 1000)
    for g in ("jump", "leap", "hop"):
        if r == RANK[g] and (free < runway[g] or (g != "hop" and st.get("level_deg", 0) > 3)):
            cap(NAME[RANK[g] - 1], "G1_edge_or_level")
    if surface != "damped" and r >= RANK["hop"]:
        cap("nudge", "G6_resonant_surface")
    if surface != "damped" and r == RANK["nudge"]:
        cap("settle", "G6_resonant_surface")
    return "performed", NAME[r], reason


def main():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "corporate",
                        "cubiq", "signal-contract-v0.6-draft-vectors.json")
    vectors = json.load(open(path))["vectors"]
    fails = 0
    for v in vectors:
        got = decide(v["signal"], v["state"])
        want = (v["expect"]["event"], v["expect"]["performed"], v["expect"]["downgrade_reason"])
        if got != want:
            fails += 1
            print(f"  FAIL  {v['name']}  got {got}  want {want}")
    print(f"  contract v0.6-draft: {len(vectors) - fails}/{len(vectors)} vectors pass (Python decide)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
