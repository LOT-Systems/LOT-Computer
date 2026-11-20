#!/usr/bin/env python3
"""CUBIQ(tm) v.0 ballistic + energy budget calculator (point-mass, no drag, rigid landing).
Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md. Stdlib only."""
import math
G = 9.81

def launch(mass_kg, rise_m=None, range_m=None, angle_from_horizontal_deg=90.0):
    """Return dict for a launch. Specify rise (vertical hop) OR range at a launch angle."""
    th = math.radians(angle_from_horizontal_deg)
    if rise_m is not None:                      # v from apex height
        v = math.sqrt(2 * G * rise_m) / math.sin(th)
    else:                                       # v from range (level ground)
        v = math.sqrt(range_m * G / math.sin(2 * th))
    rise = (v * math.sin(th)) ** 2 / (2 * G)
    rng = v * v * math.sin(2 * th) / G
    t = 2 * v * math.sin(th) / G
    return dict(v=v, E_mJ=0.5 * mass_kg * v * v * 1e3, rise_mm=rise * 1e3,
                range_mm=rng * 1e3, flight_ms=t * 1e3, impulse_Ns=mass_kg * v)

def row(name, mass_g, **kw):
    r = launch(mass_g / 1000, **kw)
    print(f"{name:<34} m={mass_g:>3}g  v={r['v']:.2f} m/s  E={r['E_mJ']:>6.1f} mJ  "
          f"rise={r['rise_mm']:>5.1f} mm  range={r['range_mm']:>6.1f} mm  "
          f"flight={r['flight_ms']:>4.0f} ms  p={r['impulse_Ns']:.3f} N*s")

print("== v.0 gestures (shell 120 g) ==")
row("HOP   (10 mm rise, vertical)", 120, rise_m=0.010)
row("LEAP  (40 mm range, 80 deg launch)", 120, range_m=0.040, angle_from_horizontal_deg=80)
row("LEAP  (40 mm range, 75 deg launch)", 120, range_m=0.040, angle_from_horizontal_deg=75)
row("LEAP  (40 mm range, 45 deg launch)", 120, range_m=0.040, angle_from_horizontal_deg=45)
print("== v.1 long jump (shell 90 g) ==")
for a in (45, 55, 65):
    row(f"JUMP  (150 mm range, {a} deg launch)", 90, range_m=0.150, angle_from_horizontal_deg=a)
row("JUMP  (200 mm range, 45 deg launch)", 90, range_m=0.200, angle_from_horizontal_deg=45)

print("== actuator force check (voice coil, v.0 candidate) ==")
for stroke_mm in (3, 5, 8):
    for name, E in (("HOP", 11.8e-3), ("LEAP80", 68.8e-3)):
        print(f"  {name:<7} stroke {stroke_mm} mm -> mean force {E/(stroke_mm/1e3):.1f} N "
              f"({E/(stroke_mm/1e3)/(0.12*G):.1f} x shell weight)")

print("== battery / charge budget ==")
cell_J = 0.300 * 3.7 * 3600            # 300 mAh @ 3.7 V
for eff in (0.05, 0.10, 0.20):
    per_leap_J = 0.0688 / eff
    print(f"  wall-plug-to-kinetic eff {eff:.0%}: {per_leap_J:.2f} J/leap -> "
          f"{cell_J/per_leap_J:,.0f} leaps per full 300 mAh cell")

print("== landing ==")
r = launch(0.12, range_m=0.040, angle_from_horizontal_deg=80)
vy = r['v'] * math.sin(math.radians(80))
print(f"  LEAP80 touchdown vertical speed {vy:.2f} m/s = drop height equiv {vy*vy/(2*G)*1e3:.0f} mm")

print("== levitation (v.3) static load ==")
for m in (0.120, 0.090):
    print(f"  {m*1e3:.0f} g cube -> weight {m*G:.2f} N (magnetic lift needed at operating gap)")
