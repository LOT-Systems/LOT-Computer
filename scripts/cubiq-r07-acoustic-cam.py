#!/usr/bin/env python3
"""CUBIQ(tm) v.0 R07: landing-knock acoustic budget, reversible snail-cam cocking drive,
floating-sleeve reset geometry, v.2 cross-track re-run with sticking landings, ToF window
recess geometry. Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md.
Stdlib only. Inputs marked EST are placeholders for bench measurement, not datasheet values."""
import math
import random

G = 9.81
M = 0.1133                       # R06 mass budget v0.4, kg

# ---------------------------------------------------------------------------
print("== F41: landing knock — energy, contact, L200 (hemispherical free field) ==")
# Metric: L200 = radiated energy spread over the ear's ~200 ms integration window. For impulses
# shorter than 200 ms, loudness follows energy, not peak power. Ring-down times are kept for the
# record but do not enter L200.
# Gestures: (name, rise mm). LEAP 40 mm @60 deg -> rise = R*tan(60)/4; JUMP 150/200 @60.
gest = [("HOP 10 mm rise", 10.0),
        ("LEAP 40 mm @60", 40 * math.tan(math.radians(60)) / 4),
        ("JUMP 150 mm @60", 150 * math.tan(math.radians(60)) / 4),
        ("JUMP 200 mm @60", 200 * math.tan(math.radians(60)) / 4)]
# Surface classes: radiated fraction of vertical impact energy (EST, hard contact), ring-down.
surf = {"damped": (3e-5, 0.010), "normal": (1e-4, 0.030), "resonant": (1e-3, 0.100)}
SOFT_FOOT_CREDIT_DB = 8.0        # EST: 2 mm elastomer dome vs. hard foot (B24 measures 6-12 dB)
K_DOME_TRAVEL = 0.002            # dome sized so the 150 mm JUMP uses its full 2 mm (R06 F34)

T_INT = 0.200                    # ear integration window, s

def spl(e_rad, tau, r):
    i = (e_rad / max(tau, T_INT)) / (2 * math.pi * r * r)
    return 10 * math.log10(i / 1e-12)

v_jump = math.sqrt(2 * G * gest[2][1] / 1000)
k_dome = M * v_jump ** 2 / K_DOME_TRAVEL ** 2
t_c = math.pi * math.sqrt(M / k_dome)
print(f"  foot dome k = {k_dome/1e3:.1f} kN/m (all feet), contact half-period {t_c*1e3:.1f} ms "
      f"-> force spectrum rolls off above ~{1/t_c:.0f} Hz")
print("  gesture            rise   v_td    E_imp   travel   L200@1.2 m (soft foot)  damped / normal / resonant")
table = {}
for name, h in gest:
    v = math.sqrt(2 * G * h / 1000)
    e = 0.5 * M * v * v
    trav = v * math.sqrt(M / k_dome)
    row = []
    for s, (eta, tau) in surf.items():
        L = spl(eta * e, tau, 1.2) - SOFT_FOOT_CREDIT_DB
        row.append(L)
        table[(name.split()[0] + name.split()[1], s)] = L
    print(f"  {name:17s} {h:5.1f}  {v:4.2f}  {e*1e3:5.1f} mJ  {trav*1e3:4.2f} mm   "
          f"{row[0]:5.1f} / {row[1]:5.1f} / {row[2]:5.1f} dB")
print("  relative (independent of the eta anchor): every x2 in rise = +3.0 dB")
for name, h in gest[1:]:
    print(f"    {name:17s} vs HOP: {10*math.log10(h/10):+.1f} dB")

print("  -- venue check: knock L200 at the neighbour vs. room ambient (A-weighting ignored, EST) --")
venues = [("library reading room", 35, 1.2), ("home study, night", 30, 3.0),
          ("open office", 48, 1.5), ("kitchen", 45, 2.0)]
for vname, amb, r in venues:
    out = []
    for name, h in gest[:3]:
        v = math.sqrt(2 * G * h / 1000); e = 0.5 * M * v * v
        Ld = spl(surf["damped"][0] * e, surf["damped"][1], r) - SOFT_FOOT_CREDIT_DB
        Ln = spl(surf["normal"][0] * e, surf["normal"][1], r) - SOFT_FOOT_CREDIT_DB
        out.append(f"{name.split()[0]} {Ld-amb:+5.1f}/{Ln-amb:+5.1f}")
    print(f"  {vname:22s} amb {amb} dB @ {r} m :  " + "   ".join(out) + "   (damped/normal, dB over ambient)")

# Gear whirr (cocking) and coil (NUDGE), EST source levels at 10 cm
for src, l10 in (("cocking gearmotor", 42.0), ("NUDGE coil beat", 30.0)):
    print(f"  {src:18s} EST {l10:.0f} dB @ 0.1 m -> {l10-20*math.log10(1.2/0.1):.1f} dB @ 1.2 m")

# ---------------------------------------------------------------------------
print("== F42: reversible snail-cam cocking drive (cam = latch) ==")
ETA_GEAR, ETA_MOTOR, P_IN = 0.35, 0.45, 0.25      # self-locking worm stage EST; motor EST; W
RISE_DEG = 300.0
cases = [("v.0 LEAP", 0.043, 0.006, 4.0), ("v.1 JUMP 150", 0.137, 0.010, 5.0),
         ("v.1 JUMP 200", 0.182, 0.010, 5.0)]
for name, E, s, rb in cases:
    F = 2 * E / s
    rate = s * 1000 / math.radians(RISE_DEG)          # mm/rad
    T = F * rate / 1000                                # N*m at cam
    alpha = math.degrees(math.atan(rate / rb))
    dia = 2 * (rb + s * 1000)
    p_cam = P_IN * ETA_MOTOR * ETA_GEAR
    t = E / p_cam
    e_el = E / (ETA_MOTOR * ETA_GEAR)
    print(f"  {name:13s} E {E*1e3:4.0f} mJ  stroke {s*1e3:2.0f} mm  F_pk {F:4.1f} N  cam torque {T*1e3:5.1f} mN*m  "
          f"press.angle {alpha:4.1f} deg  cam dia {dia:4.1f} mm  cock {t:4.1f} s  {e_el*1e3:4.0f} mJ elec")
for lever in (2.0,):
    E, s = 0.182, 0.010
    s_c = s / lever; F_c = 2 * E / s * lever
    rate = s_c * 1000 / math.radians(RISE_DEG)
    print(f"  v.1 with {lever:.0f}:1 follower lever: cam lift {s_c*1e3:.0f} mm, cam dia {2*(5+s_c*1e3):.0f} mm, "
          f"torque {F_c*rate:.1f} mN*m (unchanged), follower load {F_c:.0f} N")
# Shock in ARMED: follower on the dwell (constant radius) -> load is radial -> zero cam torque.
m_f, a_drop = 0.001, 1500 * G
print(f"  ARMED on the dwell: follower 1 g at 1,500 g adds {m_f*a_drop:.1f} N, radial -> 0 mN*m on the cam")
stop_deg, rpm = 20.0, 60.0
print(f"  ARMED stop {stop_deg:.0f} deg before the drop: fire latency at {rpm:.0f} rpm = "
      f"{stop_deg/(rpm*6)*1e3:.0f} ms after command")
cell_wh = 0.150 * 3.7
print(f"  cocking cost vs. 150 mAh cell: v.0 LEAP {0.043/(ETA_MOTOR*ETA_GEAR)/(cell_wh*3600)*1e6:.0f} ppm/cocking; "
      f"12 LEAP/day = {12*0.043/(ETA_MOTOR*ETA_GEAR)/(cell_wh*3600)*100:.2f} %/day")

# ---------------------------------------------------------------------------
print("== F43: floating-sleeve reset — why a push plunger can't rest flush and uncocked ==")
print("  push plunger: tip flush with the feet  <=>  spring compressed by the full stroke.")
for name, E, s, _ in cases:
    print(f"    {name:13s} resting uncocked with a fixed sleeve -> tip sticks out {s*1e3:.0f} mm "
          f"-> cube tilts {math.degrees(math.atan(s/0.040)):.1f} deg on a 40 mm foot pitch")
w = M * G
print(f"  floating sleeve: after landing the cube's own weight ({w:.2f} N) pushes the spent tip+sleeve up flush;")
print(f"  sleeve retaining spring must be < {w/2:.2f} N (half the weight, lands on 2 feet + tip) "
      f"and > tip+sleeve weight 2 g x 2 g-shock = {0.002*G*2:.3f} N (stays out in flight)")

# ---------------------------------------------------------------------------
print("== F44: v.2 200 mm traverse re-run with sticking landings (60 deg launch, R06 F32) ==")
random.seed(5)

def traverse(hop_mm, sig_tof, sig_slip, gain=0.8, n=20000, sig_yaw=3.0, sig_range=0.10, max_aim=20.0):
    final, worst = [], []
    for _ in range(n):
        y = 0.0; peak = 0.0
        for _ in range(math.ceil(200 / hop_mm)):
            aim = 0.0
            if sig_tof is not None:
                aim = math.atan2(-gain * (y + random.gauss(0, sig_tof)), hop_mm)
                aim = max(-math.radians(max_aim), min(math.radians(max_aim), aim))
            h = aim + math.radians(random.gauss(0, sig_yaw))
            y += hop_mm * (1 + random.gauss(0, sig_range)) * math.sin(h) + random.gauss(0, sig_slip)
            peak = max(peak, abs(y))
        final.append(abs(y)); worst.append(peak)
    final.sort(); worst.sort(); k = int(0.98 * n)
    return final[k], worst[k]

print("  hop    ToF sigma   slip sigma    p98 final   p98 worst   gate <15 mm")
for hop in (20, 40):
    for tof in (5.0, 10.0):
        for slip in (1.5, 0.5, 0.0):
            f, wv = traverse(hop, tof, slip)
            print(f"  {hop} mm   {tof:4.1f} mm     {slip:3.1f} mm       {f:5.1f} mm    {wv:5.1f} mm    "
                  f"{'PASS' if wv < 15 else 'FAIL'}")

# ---------------------------------------------------------------------------
print("== F45: ToF window — recess vs. aperture, 45 deg horizontal FoV (R05) ==")
a = 2.0                                            # sensor optical aperture span, mm EST
for d in (0.0, 0.5, 1.0, 2.0):
    w_ = a + 2 * d * math.tan(math.radians(22.5))
    print(f"  recess {d:.1f} mm -> window >= {w_:.2f} mm wide (no vignetting)")
