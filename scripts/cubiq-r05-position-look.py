#!/usr/bin/env python3
"""CUBIQ(tm) v.0 R05: v.2 lateral position correction (Monte Carlo), piezo yaw-"look"
feasibility, static multizone-ToF edge look, thrust-line / CoM tolerance stack.
Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md. Stdlib only.
All inputs marked EST are placeholders for bench measurement, not datasheet values."""
import math
import random

G = 9.81
M = 0.120            # v.0 total mass, kg (R03/R04 budget)
A = 0.045            # cube edge, m
I_Z = M * A ** 2 / 6 # yaw inertia, kg m^2 (R04 F18)

# ---------------------------------------------------------------------------
print("== F23: 200 mm traverse with lateral position correction (N=20000) ==")
# Same per-hop noise as R04 F20: yaw sigma 3 deg, range sigma 10 %, slip sigma 1.5 mm.
# NEW: before every hop the cube ranges a reference parallel to the track (lateral ToF)
# with noise sigma_tof and re-aims toward the track line (proportional aim, gain k).
random.seed(5)

def traverse(hop_mm, sig_tof, gain=0.8, ref_ok=1.0, n=20000,
             sig_yaw=3.0, sig_range=0.10, sig_slip=1.5, max_aim_deg=20.0):
    final, worst = [], []
    n_hops = math.ceil(200 / hop_mm)
    for _ in range(n):
        y = 0.0; peak = 0.0
        for _ in range(n_hops):
            if sig_tof is not None and random.random() < ref_ok:
                y_meas = y + random.gauss(0, sig_tof)
                aim = math.atan2(-gain * y_meas, hop_mm)
                aim = max(-math.radians(max_aim_deg), min(math.radians(max_aim_deg), aim))
            else:
                aim = 0.0                                   # heading-hold only (R04)
            h = aim + math.radians(random.gauss(0, sig_yaw))
            r = hop_mm * (1 + random.gauss(0, sig_range))
            y += r * math.sin(h) + random.gauss(0, sig_slip)
            peak = max(peak, abs(y))
        final.append(abs(y)); worst.append(peak)
    final.sort(); worst.sort()
    k = int(0.98 * n)
    return final[k], worst[k]

print("  hop   correction                      p98 final   p98 worst-along-path   gate <15 mm")
for hop in (20, 40):
    f, w = traverse(hop, None)
    print(f"  {hop} mm heading-hold only (R04)          {f:5.1f} mm   {w:5.1f} mm            "
          f"{'PASS' if w < 15 else 'FAIL'}")
    for s in (2.0, 5.0, 10.0):
        f, w = traverse(hop, s)
        print(f"  {hop} mm + lateral ToF, sigma {s:4.1f} mm      {f:5.1f} mm   {w:5.1f} mm            "
              f"{'PASS' if w < 15 else 'FAIL'}")
    f, w = traverse(hop, 5.0, ref_ok=0.5)
    print(f"  {hop} mm + lateral ToF 5 mm, ref seen 50 %  {f:5.1f} mm   {w:5.1f} mm            "
          f"{'PASS' if w < 15 else 'FAIL'}")

# ---------------------------------------------------------------------------
print("== F24: piezo-only yaw 'look' — feasibility ==")
mu, r_feet = 0.5, 0.0177          # elastomer mu EST; feet 2.5 mm in from corners -> r = 17.7 mm
T_fric = mu * M * G * r_feet
print(f"  static friction torque on 4 feet: {T_fric*1e3:.1f} mN*m")
m_p, r_p, x_p = 0.002, 0.015, 75e-6  # bimorph moving mass, lever arm, tip stroke (EST)
dtheta = m_p * r_p * x_p / I_Z     # momentum-transfer upper bound per stroke, frictionless
need = math.radians(60)            # 4 face sensors x 30 deg sampling -> 60 deg of rotation
strokes = need / dtheta
print(f"  best-case yaw per stroke (feet fully unloaded): {math.degrees(dtheta)*1e3:.2f} mdeg")
print(f"  strokes for 60 deg: {strokes:,.0f}")
for f in (200, 1000, 5000, 25000):
    aud = "audible band" if 20 <= f <= 20000 else "ultrasonic"
    print(f"    drive {f:>5} Hz -> {strokes/f:7.1f} s  ({aud})")
acc = x_p * (2 * math.pi * 25000) ** 2
print(f"  but 75 um at 25 kHz means tip acceleration {acc/G:,.0f} g -> not physical. "
      f"Realistic ultrasonic stroke ~1 um -> {strokes*75:,.0f} strokes, {strokes*75/25000:.0f} s.")
print(f"  and with feet loaded, the bimorph's reaction torque must first beat {T_fric*1e3:.1f} mN*m "
      f"of friction on every fast stroke.")
print("  verdict: piezo-only yaw is slow, audible, or both. Drop it from G7.")

# ---------------------------------------------------------------------------
print("== F25: static look — 4 face-mounted multizone ToF, no rotation ==")
def static_cover(fov_deg):
    gap = 90 - fov_deg
    return 4 * fov_deg, 1 / math.cos(math.radians(gap / 2)) if gap > 0 else 1.0
for fov in (27, 45, 60, 90):
    cov, k = static_cover(fov)
    print(f"  horizontal FoV {fov:>2} deg: azimuth covered {min(cov,360):3d} deg; straight edge in a gap "
          f"direction read long by x{k:.3f} -> derate by {1-1/k:4.1%}")

def round_table_check(fov_deg, n=20000):
    """Round table radius R, cube at random offset. Compare true nearest-boundary distance with
    the conservative estimate min_ray(range) * cos(gap/2). Ratio < 1 means estimate is SAFE."""
    random.seed(25)
    gap = 90 - fov_deg
    derate = math.cos(math.radians(max(gap, 0) / 2))
    worst = 0.0
    for _ in range(n):
        R = random.uniform(250, 600)                      # mm
        s = random.uniform(0, R - 60)                     # cube centre offset from table centre
        yaw = random.uniform(0, 360)
        true_min = R - s
        best = 1e9
        for face in range(4):
            c = yaw + 90 * face
            for d in range(-int(fov_deg // 2), int(fov_deg // 2) + 1):
                t = math.radians(c + d)
                # ray from (s,0) in direction t to circle x^2+y^2=R^2
                b = s * math.cos(t)
                rng = -b + math.sqrt(b * b - (s * s - R * R))
                best = min(best, rng)
        worst = max(worst, (best * derate) / true_min)
    return worst
for fov in (45, 60):
    print(f"  round tables R 250-600 mm, FoV {fov}: worst estimate/true = {round_table_check(fov):.3f} "
          f"({'SAFE' if round_table_check(fov) <= 1.0 else 'UNSAFE'} if <= 1)")

# ---------------------------------------------------------------------------
print("== F26: thrust-line / CoM lateral tolerance stack (RSS) ==")
# (name, mass g, lateral placement tolerance mm, varies unit-to-unit only (S) or in use (U))
parts = [
    ("shell (wall-thickness asym.)", 23, 0.10, "S"),
    ("frame + fasteners",             8, 0.10, "S"),
    ("stator",                       14, 0.05, "S"),
    ("reaction mass radial play",    40, 0.05, "U"),
    ("cell in former (if moving)",    7, 0.10, "U"),
    ("foot plunger module",           9, 0.10, "S"),
    ("PCB + parts",                   5, 0.20, "S"),
    ("supercap",                      3, 0.30, "S"),
    ("Qi coil + ferrite",             4, 0.20, "S"),
    ("ToF x4 + IMU + piezo",          4, 0.20, "S"),
]
Mt = sum(p[1] for p in parts)
def rss(sel):
    return math.sqrt(sum((m * t) ** 2 for _, m, t, k in parts if k in sel)) / Mt
boss = 0.10
static = math.sqrt(rss("S") ** 2 + boss ** 2)
inuse = rss("U")
print(f"  total modelled mass {Mt} g; plunger boss tolerance +/-{boss} mm")
print(f"  unit-to-unit (static) CoM-to-thrust-line error, RSS: {static:.3f} mm "
      f"-> calibratable at end-of-line by plunger timing (R04 F18b)")
print(f"  in-use (moving parts) error, RSS: {inuse:.3f} mm -> NOT calibratable; "
      f"must sit inside 0.3 mm budget: {'OK' if inuse <= 0.3 else 'OVER'}")
print(f"  uncalibrated total (static+in-use): {math.hypot(static, inuse):.3f} mm vs 0.3 mm budget: "
      f"{'OK' if math.hypot(static, inuse) <= 0.3 else 'needs EOL calibration'}")
for e in (static, inuse):
    v = math.sqrt(G * 0.02 / math.sin(math.radians(120)))  # 20 mm hop @ 60 deg (R04)
    t_f = 2 * v * math.sin(math.radians(60)) / G
    print(f"    {e:.3f} mm offset -> yaw {math.degrees(M*v*e/1000/I_Z*t_f):.2f} deg per 20 mm/60 deg hop")

L_thrust = 30.0           # plunger foot to CoM along the thrust line, mm (EST, layout §05)
for budget in (0.3, 0.1):
    print(f"  angular tolerance of plunger axis for {budget} mm at CoM: "
          f"{math.degrees(math.atan(budget / L_thrust)):.2f} deg")

# ---------------------------------------------------------------------------
print("== F27: mass budget v0.3 ==")
r04 = 118.5
delta_mz = 1.0            # 4 multizone ToF instead of 4 single-zone, EST
print(f"  R04 118.5 g + multizone ToF {delta_mz:+.1f} g = {r04+delta_mz:.1f} g, margin {120-r04-delta_mz:.1f} g")
print(f"  with battery-as-reaction-mass (-7 g): {r04+delta_mz-7:.1f} g, margin {120-r04-delta_mz+7:.1f} g")
