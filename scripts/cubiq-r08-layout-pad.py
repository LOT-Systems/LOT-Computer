#!/usr/bin/env python3
"""CUBIQ(tm) Quantum Cube v.0 — R08 numbers: layout fit check + home pad as a known surface.
Stdlib only. Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md §02-§04.
Every input marked EST is a placeholder for bench measurement.

Part A  Does the R07 floating-sleeve plunger fit under the stator on the 30 deg thrust line?
Part B  Box-level interference check of layout v0.2 inside the 45 mm envelope.
Part C  Home pad: isolation of the landing knock vs. launch energy lost into a sprung pad.
"""
import math

G = 9.81
TAN30, SIN30, COS30 = math.tan(math.radians(30)), 0.5, math.cos(math.radians(30))

# ---------------------------------------------------------------- envelope (mm, z = 0 at table)
FEET = 1.0
WALL = 1.0
Z_FLOOR = FEET + WALL            # inner floor
Z_CEIL = FEET + 45.0 - WALL      # inner ceiling
HALF_IN = 45.0 / 2 - WALL        # inner half width, 21.5

# ---------------------------------------------------------------- masses (g), R07 budget v0.5
M_TOTAL = 113.6
M_STATOR_RM = 14.0 + 40.0        # stator + battery-as-reaction-mass (R05 D15)
M_SHELL = 30.0                   # shell + feet, centroid at cube centre (EST)
M_BASE = M_TOTAL - M_STATOR_RM - M_SHELL   # Qi, PCB, ToF tabs, cam drive, supercap (EST)
Z_SHELL = FEET + 45.0 / 2
Z_BASE = 7.0                     # EST centroid of base-zone parts
STATOR_H, STATOR_R = 24.0, 13.0  # EST, incl. 8 mm stroke
FOOT_HALF_PITCH = 20.0
QI_X = 8.5                       # Qi RX coil centre, offset forward of the cube axis (R08 L9)           # 40 mm foot pitch (R07 §04)

# ---------------------------------------------------------------- v.0 LEAP plunger (R07 §03)
E_SPRING, STROKE = 0.043, 0.006  # J, m
G_SHEAR = 79e3                   # N/mm^2, music wire
D_WIRE, D_MEAN = 0.7, 5.3        # mm (EST)
TIP, CAP, CLEAR = 2.0, 1.0, 0.5  # tip head, sleeve cap, clearance to stator (mm, EST)


def spring():
    k = 2 * E_SPRING / STROKE ** 2 / 1000          # N/mm
    n = G_SHEAR * D_WIRE ** 4 / (8 * D_MEAN ** 3 * k)
    solid = (n + 2) * D_WIRE
    free = solid + STROKE * 1000 + 1.0              # 1 mm coil-clash margin
    return k, n, solid, free


def com(z_s):
    return (M_STATOR_RM * (z_s + STATOR_H / 2) + M_SHELL * Z_SHELL + M_BASE * Z_BASE) / M_TOTAL


def axial_room(z_s):
    """Self-consistent CoM; axial length from tip contact to where the thrust line meets z_s."""
    h = com(z_s)
    x_tip = -h * TAN30
    return h, x_tip, z_s / COS30


def part_a():
    k, n, solid, free = spring()
    fixed_top = TIP + (solid + 1.0) + CAP            # fixed sleeve: seat at compressed length
    float_top = TIP + free + CAP                     # floating sleeve: seat at free length at REST
    print("PART A — plunger stack on the 30 deg thrust line")
    print(f"  spring  k {k:.2f} N/mm  active coils {n:.1f}  solid {solid:.1f} mm  free {free:.1f} mm")
    print(f"  axial stack from tip contact: fixed sleeve {fixed_top:.1f} mm   floating sleeve {float_top:.1f} mm"
          f"   (+{float_top - fixed_top:.1f})")
    z_r05 = FEET + 45.0 / 2 - STATOR_H / 2         # R05: stator centred at mid-height
    h, x_tip, room = axial_room(z_r05)
    print(f"  R05 stator bottom z {z_r05:.1f} mm  CoM h {h:.2f} mm  tip x {x_tip:.1f} mm  room {room:.1f} mm")
    for name, need in (("fixed", fixed_top), ("floating", float_top)):
        ok = need + CLEAR <= room
        print(f"    {name:9s} need {need + CLEAR:5.1f}  room {room:5.1f}  {'FITS' if ok else 'CLASH by %.1f mm' % (need + CLEAR - room)}")
    # minimum stator lift for the floating sleeve
    z = z_r05
    while axial_room(z)[2] < float_top + CLEAR:
        z += 0.05
    h2, x2, room2 = axial_room(z)
    top = z + STATOR_H
    print(f"  floating sleeve needs stator bottom z >= {z:.1f} mm (lift +{z - z_r05:.1f} mm)")
    print(f"    CoM {h:.2f} -> {h2:.2f} mm (+{h2 - h:.2f})  tip x {x_tip:.1f} -> {x2:.1f} mm  stator top {top:.1f}"
          f" / ceiling {Z_CEIL:.1f} ({'ok' if top <= Z_CEIL - 2 else 'NO'})")
    for hh, tag in ((h, "R05/R07"), (h2, "R08")):
        print(f"    {tag:8s} static tip-over {math.degrees(math.atan(FOOT_HALF_PITCH / hh)):.1f} deg   "
              f"tip->CoM along axis {hh / COS30:.1f} mm   axis error for 0.3 mm miss "
              f"{math.degrees(math.atan(0.3 / (hh / COS30))):.2f} deg")
    print(f"    R05 L6 said ~30 mm tip->CoM; at the R05 45 deg axis it was {h / math.cos(math.radians(45)):.1f} mm")
    return z, h2, x2


def part_b(z_s, x_tip):
    """Axis-aligned boxes (x fwd, y left, z up), mm. Cylinders approximated by their boxes."""
    sx = x_tip
    parts = {
        "stator+RM":     ((-STATOR_R, STATOR_R), (-STATOR_R, STATOR_R), (z_s, z_s + STATOR_H)),
        "Qi coil 24mm":  ((QI_X - 12, QI_X + 12), (-12, 12), (Z_FLOOR, Z_FLOOR + 1.4)),
        "PCB":           ((-4.0, 20.5), (-12.5, 12.5), (Z_FLOOR + 1.6, Z_FLOOR + 3.6)),
        "cam disc+wheel": ((-18.0, 2.0), (13.6, 19.6), (3.0, 23.0)),
        "gearmotor+worm": ((3.0, 20.5), (14.0, 20.5), (4.0, 11.0)),
        "supercap":      ((-15.0, 5.0), (-20.5, -14.0), (Z_FLOOR + 0.5, Z_FLOOR + 10.5)),
        "ToF tab +x":    ((20.5, 21.5), (-6, 6), (20, 24)),
        "ToF tab -x":    ((-21.5, -20.5), (-6, 6), (20, 24)),
        "ToF tab +y":    ((-6, 6), (20.5, 21.5), (20, 24)),
        "ToF tab -y":    ((-6, 6), (-21.5, -20.5), (20, 24)),
        "IMU":           ((14.0, 17.0), (-3, 0), (Z_FLOOR + 3.6, Z_FLOOR + 4.6)),
    }
    # the tilted sleeve (OD 8 mm EST) as 1 mm z-slices: x-extent of the slanted cylinder per slice
    r_s = 4.0 / COS30
    for i, z0 in enumerate(range(int(Z_FLOOR), int(z_s))):
        z1 = min(z0 + 1.0, z_s - 0.3)
        parts[f"sleeve z{z0}"] = ((sx + z0 * TAN30 - r_s, sx + z1 * TAN30 + r_s), (-4.0, 4.0), (z0, z1))
    # intended contacts: sleeve passes through a PCB cut-out
    allowed = {frozenset((n, "PCB")) for n in parts if n.startswith("sleeve")}
    print("\nPART B — layout v0.2 interference check (boxes, mm)")
    env_bad = []
    for n, b in parts.items():
        (x0, x1), (y0, y1), (z0, z1) = b
        if min(x0, y0) < -HALF_IN - 1e-9 or max(x1, y1) > HALF_IN + 1e-9 or z0 < Z_FLOOR - 1e-9 or z1 > Z_CEIL:
            env_bad.append(n)
    names = list(parts)
    clashes = []
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            A, B = parts[a], parts[b]
            if all(A[d][0] < B[d][1] and B[d][0] < A[d][1] for d in range(3)):
                if frozenset((a, b)) not in allowed:
                    clashes.append((a, b))
    print(f"  {len(parts)} boxes   outside envelope: {env_bad or 'none'}   clashes: {clashes or 'none'}")
    print("  allowed by design: plunger sleeve through a PCB cut-out (PCB starts at x = -4 mm)")
    z_qi = Z_FLOOR + 1.4
    print(f"  Qi coil 24 mm at x +{QI_X:.1f}: spans x {QI_X - 12:.1f}..{QI_X + 12:.1f}; sleeve edge at z {z_qi:.1f} "
          f"is x {sx + z_qi * TAN30 + r_s:.1f} -> gap {(QI_X - 12) - (sx + z_qi * TAN30 + r_s):.1f} mm")
    s26 = 7.5 - 13
    print(f"  (a centred-offset 26 mm coil at x +7.5 would start at x {s26:.1f}: "
          f"clash {(sx + z_qi * TAN30 + r_s) - s26:.1f} mm)")
    return not env_bad and not clashes


def launch_fraction(m_pad, f_n, zeta=0.10, M=M_TOTAL / 1000):
    """2-DOF along the thrust axis: cube on plunger spring (contact only), pad on isolator."""
    k = 2 * E_SPRING / STROKE ** 2
    k_i = m_pad * (2 * math.pi * f_n) ** 2
    c_i = 2 * zeta * math.sqrt(k_i * m_pad)
    xc, vc, xp, vp = 0.0, 0.0, 0.0, 0.0          # cube and pad displacement from release
    comp = STROKE
    dt = 2e-6
    t = 0.0
    while comp > 0 and t < 0.2:
        f = k * comp
        ac = f / M
        ap = (-f - k_i * xp - c_i * vp) / m_pad
        vc += ac * dt
        vp += ap * dt
        xc += vc * dt
        xp += vp * dt
        comp = STROKE - (xc - xp)
        t += dt
    return 0.5 * M * vc ** 2 / E_SPRING, t


def transmissibility(f, f_n, zeta=0.10):
    r = f / f_n
    return math.sqrt((1 + (2 * zeta * r) ** 2) / ((1 - r * r) ** 2 + (2 * zeta * r) ** 2))


def part_c():
    print("\nPART C — home pad: isolate the knock, keep the launch")
    rigid, t_r = launch_fraction(1e3, 2000)
    print(f"  rigid table: cube gets {rigid * 100:.1f} % of spring energy, push lasts {t_r * 1e3:.1f} ms")
    print("  pad mass   f_n    launch share   needed spring E   T @100 Hz   T @180 Hz   static sag")
    rows = []
    for m in (0.25, 0.40, 0.60, 0.90):
        for fn in (12, 20, 35):
            share, _ = launch_fraction(m, fn)
            t100, t180 = transmissibility(100, fn), transmissibility(180, fn)
            sag = G / (2 * math.pi * fn) ** 2 * 1000
            rows.append((m, fn, share))
            print(f"  {m * 1000:5.0f} g  {fn:3d} Hz   {share * 100:6.1f} %      {E_SPRING / share * 1000:5.1f} mJ"
                  f"      {20 * math.log10(t100):6.1f} dB   {20 * math.log10(t180):6.1f} dB   {sag:4.2f} mm")
    print(f"  free-mass limit m_p/(M+m_p): 400 g -> {400 / (400 + M_TOTAL) * 100:.1f} %, "
          f"600 g -> {600 / (600 + M_TOTAL) * 100:.1f} %")
    # deck geometry: one LEAP from the home spot must land on the deck
    home_rear, cube, leap, sig = 5.0, 45.0, 40.0, 0.10
    worst = home_rear + cube + leap * (1 + 2.05 * sig) + 2.05 * 3.0     # p98 range + 3 mm landing slip
    print(f"  deck: cube front after one LEAP from the home spot, p98 {worst:.0f} mm from the rear edge"
          f" -> 160 mm deck leaves {160 - worst:.0f} mm")
    print(f"  pad recoil on LEAP landing (600 g, 20 Hz): {0.1136 * 0.58 / (0.6 + 0.1136) / (2 * math.pi * 20) * 1000:.2f} mm")


if __name__ == "__main__":
    z_s, h, x_tip = part_a()
    ok = part_b(z_s, x_tip)
    part_c()
    print(f"\nlayout v0.2 interference check: {'PASS' if ok else 'FAIL'}")
