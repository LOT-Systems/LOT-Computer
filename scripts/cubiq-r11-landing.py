#!/usr/bin/env python3
"""CUBIQ(tm) — R11 landing tip-over and v.2 layout v0.3 numbers. Stdlib only.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md §03-§04 (F87, F88).

Planar rigid-body model of one landing (x forward, y up, rotations counter-clockwise positive;
a FORWARD topple is clockwise). Inputs marked EST in the report are placeholders for MULE-1.

  Part A  Flat landing. Sticking needs mu >= v_h / ((1+e) v_v) (R04 F19). The friction and
          normal impulses then balance about the CoM only if their resultant meets the floor
          within the base: x_c = h * J_x / J_y <= b. Since J_x <= mu * J_y, a flat landing can
          start a forward rotation only if mu * h > b, whatever the speed.
  Part B  The conservative model of the parallel Cycle-02 report (tender-turing-mqesdo):
          all horizontal momentum becomes rotation about the leading foot, vertical impulse
          ignored. Gives a speed threshold. Reproduced here for our geometry.
  Part C  The case neither model covers: IN-FLIGHT PITCH. A thrust line that misses the CoM by
          d gives angular impulse J*d, so the cube lands pitched by psi = (m v d / I) * t_flight
          and spinning. It meets the table on ONE foot. Plastic, sticking impact at that foot:
          angular momentum about the foot is conserved; the cube topples if the rotational
          energy after impact exceeds m g (|GP| - y_GP).
  Part D  v.2 layout v0.3: reaction wheel in the top zone; CoM, I, static tip angle, Part C
          re-run; gyroscopic roll from the spinning wheel during pitch.
  Part E  Cold room (Use Case 11): how long a cold cube carried into a warm room keeps a fogged
          ToF window (lumped thermal model), and the G12 pitch self-check numbers.
Exit 0 always (analysis); the report quotes the printed tables."""
import math

G = 9.81
B = 0.020            # half foot pitch, m (40 mm pitch, R05)
E = 0.2              # landing restitution, EST (R04 F19)
MU = 0.5             # feet friction, EST (R04 F19); spec mu >= 0.48 so landings stick
THRUST_ERR_DEG = 0.72  # thrust-line stack, worst case (R08 F54)
COS30 = math.cos(math.radians(30))

CONFIGS = {  # name: mass kg, CoM height m, I about horizontal axis through CoM kg m^2 (EST)
    "v.0 (R09, D48)": (0.1087, 0.02056, 38.8e-6),
    "v.1 90 g target": (0.0900, 0.02056, 38.8e-6 * 0.0900 / 0.1087),
    "v.1 108.7 g": (0.1087, 0.02056, 38.8e-6),
}
# v.2 = v.0 + reaction wheel (R10 §08: 6.3 g EST at z ~42 mm) + the R11 layout v0.3 mounting
# parts R10 did not count: FR4 stator disc Ø30 x 0.8 mm (~1.0 g, z 38.8) and two Ø4 bearings
# (~0.2 g, z 41.4). Point masses at their centres (EST).
V2_PARTS = [(0.0063, 0.042), (0.0010, 0.0388), (0.0002, 0.0414)]
M_W = sum(m for m, _ in V2_PARTS)
Z_W = sum(m * z for m, z in V2_PARTS) / M_W
m0, h0, i0 = CONFIGS["v.0 (R09, D48)"]
m2 = m0 + M_W
h2 = (m0 * h0 + M_W * Z_W) / m2
i2 = (i0 + m0 * (h2 - h0) ** 2 + sum(m * (z - h2) ** 2 for m, z in V2_PARTS)
      + 0.0028 * (0.015 ** 2 + 0.013 ** 2) / 4)  # ring about a diameter
CONFIGS["v.2 + wheel (R10 D52)"] = (m2, h2, i2)


def launch(range_m, deg):
    """Speed, horizontal, vertical component and flight time for a flat ballistic landing."""
    th = math.radians(deg)
    v = math.sqrt(range_m * G / math.sin(2 * th)) if range_m > 0 else None
    return v, v * math.cos(th), v * math.sin(th), 2 * v * math.sin(th) / G


GESTURES = [  # name, config filter, (range m, launch deg) or ("rise", m)
    ("HOP in place 10 mm", ("rise", 0.010)),
    ("v.2 HOP 20 mm @60", (0.020, 60)),
    ("LEAP 40 mm @60", (0.040, 60)),
    ("JUMP 150 mm @60", (0.150, 60)),
    ("JUMP 200 mm @60", (0.200, 60)),
    ("JUMP 150 mm @45 (Cycle-02 axis)", (0.150, 45)),
]
APPLIES = {
    "HOP in place 10 mm": ["v.0 (R09, D48)", "v.2 + wheel (R10 D52)"],
    "v.2 HOP 20 mm @60": ["v.2 + wheel (R10 D52)"],
    "LEAP 40 mm @60": ["v.0 (R09, D48)", "v.2 + wheel (R10 D52)"],
    "JUMP 150 mm @60": ["v.1 90 g target", "v.1 108.7 g"],
    "JUMP 200 mm @60": ["v.1 90 g target", "v.1 108.7 g"],
    "JUMP 150 mm @45 (Cycle-02 axis)": ["v.1 108.7 g"],
}


def kin(spec):
    if spec[0] == "rise":
        vv = math.sqrt(2 * G * spec[1])
        return vv, 0.0, vv, 2 * vv / G, 90
    v, vh, vv, t = launch(*spec)
    return v, vh, vv, t, spec[1]


def topple_ratio(m, h, i_c, vh, vv, omega, psi):
    """Plastic sticking impact at the first foot to touch. omega CCW+ (forward spin < 0),
    psi = pitch at touchdown (forward / nose-down > 0). Returns (ratio, direction):
    ratio = rotational energy after impact / energy barrier; > 1 means it topples."""
    fwd = psi >= 0
    px = B if fwd else -B                      # foot that touches first, body frame
    c, s = math.cos(psi), math.sin(psi)
    # body (px, -h) rotated clockwise by psi: world coords of the foot relative to G
    fx, fy = px * c - h * s, -px * s - h * c
    rx, ry = -fx, -fy                          # G relative to the foot
    vx, vy = vh, -vv
    L = i_c * omega + m * (rx * vy - ry * vx)  # about the foot, CCW+
    i_p = i_c + m * (rx * rx + ry * ry)
    w = L / i_p
    ke = 0.5 * i_p * w * w
    r = math.hypot(rx, ry)
    # toppling over this foot means rotating toward it: forward foot -> clockwise (w < 0)
    toward = (w < 0) if fwd else (w > 0)
    if not toward:
        return 0.0, "rocks back onto its base"
    barrier = m * G * (r - ry)
    return ke / barrier, "forward" if fwd else "backward"


def part_a():
    print("A. FLAT LANDING (no pitch): can the landing impulse start a rotation at all?")
    print("   config                  h mm    b/h    rotation needs mu >   R04 spec mu   result")
    for name, (m, h, i) in CONFIGS.items():
        print(f"   {name:22s} {h * 1e3:6.2f}  {B / h:5.2f}   {B / h:18.2f}   {MU:10.2f}   cannot start")
    print("   and at a 60 deg launch the sticking landing uses J_x/J_y = cot60/(1+e) = "
          f"{1 / math.tan(math.radians(60)) / (1 + E):.2f}: x_c = {h0 * 1e3 / math.tan(math.radians(60)) / (1 + E):.1f} mm "
          f"of the {B * 1e3:.0f} mm half-pitch.")
    print(f"   45 deg launch, e = 0: x_c = {h0 * 1e3:.1f} mm vs b {B * 1e3:.0f} mm -> the one case that can start a "
          "rotation (only if mu >= 1, i.e. it would have to stick at 45 deg)")


def part_b():
    m, h, i = CONFIGS["v.1 108.7 g"]
    i_p = i + m * (h * h + B * B)
    barrier = m * G * (math.hypot(h, B) - h)
    vcrit = math.sqrt(2 * barrier * i_p) / (m * h)
    print("\nB. CONSERVATIVE MODEL (Cycle-02, mqesdo): all of m*v_h*h into rotation about the leading foot")
    print(f"   our geometry: v_h critical = {vcrit:.3f} m/s  (Cycle-02 quoted ~0.70 m/s for theirs)")
    for name, spec in GESTURES:
        v, vh, vv, t, deg = kin(spec)
        print(f"   {name:34s} v_h {vh:5.3f} m/s   {'TIPS' if vh > vcrit else 'ok':4s}  margin {vcrit / vh if vh else float('inf'):5.2f}x")
    return vcrit


def part_c(err_deg=THRUST_ERR_DEG, label=""):
    print(f"\nC. IN-FLIGHT PITCH from a thrust line {err_deg:.2f} deg off the CoM{label}  (plastic, sticking, worst sign)")
    print("   gesture                          config                  d mm  pitch rate  pitch at   topple   verdict")
    print("                                                                       rad/s    landing    ratio")
    worst = {}
    for name, spec in GESTURES:
        v, vh, vv, t, deg = kin(spec)
        for cfg in APPLIES[name]:
            m, h, i = CONFIGS[cfg]
            lever = h / math.sin(math.radians(deg)) if deg < 90 else 0.0   # tip -> CoM along the axis
            d = (lever if lever else 0.0237) * math.tan(math.radians(err_deg))
            omega_mag = m * v * d / i
            best = (0.0, "", 0.0)
            for sgn in (-1, 1):                 # forward (nose-down, CW, omega<0) or backward spin
                omega = sgn * omega_mag
                psi = -omega * t                # CW rotation in flight = nose-down = psi > 0
                ratio, how = topple_ratio(m, h, i, vh, vv, omega, psi)
                if ratio >= best[0]:
                    best = (ratio, how, psi)
            ratio, how, psi = best
            verdict = "TOPPLES" if ratio > 1 else ("rocks" if ratio > 0 else "settles")
            worst[(name, cfg)] = ratio
            print(f"   {name:32s} {cfg:22s} {d * 1e3:5.2f}  {omega_mag:8.2f}   {math.degrees(abs(psi)):6.1f} deg"
                  f"   {ratio:6.2f}   {verdict} {how if ratio > 0 else ''}")
    return worst


def ratio_at(name, cfg, err_deg):
    v, vh, vv, t, deg = kin(dict(GESTURES)[name])
    m, h, i = CONFIGS[cfg]
    lever = h / math.sin(math.radians(deg)) if deg < 90 else 0.0237
    om = m * v * lever * math.tan(math.radians(err_deg)) / i
    return max(topple_ratio(m, h, i, vh, vv, s_ * om, -s_ * om * t)[0] for s_ in (-1, 1)), om * t


def err_for_topple(name, cfg):
    """Smallest thrust-line error (0.01 deg steps, upward scan) at which the gesture topples.
    The foot-first model holds while the landing pitch is below ~67 deg (shell corner)."""
    e = 0.0
    while e < 20.0:
        e += 0.01
        r, psi = ratio_at(name, cfg, e)
        if r > 1:
            return e, math.degrees(psi)
    return float("inf"), float("nan")


def part_d():
    print("\nD. v.2 LAYOUT v0.3: reaction wheel in the top zone (z 38.4-46, R08 §03)")
    print(f"   mass {m0 * 1e3:.1f} + {M_W * 1e3:.1f} (wheel 6.3 + FR4 disc 1.0 + bearings 0.2) = {m2 * 1e3:.1f} g "
          f"(cap 120, margin {120 - m2 * 1e3:.1f})")
    print(f"   CoM z {h0 * 1e3:.2f} -> {h2 * 1e3:.2f} mm "
          f"(+{(h2 - h0) * 1e3:.2f})   I_pitch {i0 * 1e9:,.0f} -> {i2 * 1e9:,.0f} g mm^2")
    for name, h in (("v.0", h0), ("v.2", h2)):
        print(f"   static tip-over angle {name}: atan(b/h) = {math.degrees(math.atan(B / h)):.1f} deg "
              f"(RECOVER triggers at 25 deg, R03)")
    # gyroscopic coupling during a v.2 turn-hop: wheel peak 1,792 rpm (R10 §04, 20 mm hop)
    i_w = 544e-9
    big_omega = 1792 * 2 * math.pi / 60
    v, vh, vv, t, deg = kin((0.020, 60))
    m, h, i = CONFIGS["v.2 + wheel (R10 D52)"]
    d = h / math.sin(math.radians(60)) * math.tan(math.radians(THRUST_ERR_DEG))
    om_pitch = m * v * d / i
    torque = i_w * big_omega * om_pitch
    roll = 0.5 * (torque / i) * (0.8 * t) ** 2
    print(f"   gyroscopic roll during a 20 mm turn-hop: H_w {i_w * big_omega * 1e6:.0f} uN m s x pitch rate "
          f"{om_pitch:.2f} rad/s -> {torque * 1e6:.1f} uN m -> roll {math.degrees(roll):.2f} deg at landing (negligible)")


def dew_point(t_c, rh):
    a, b = 17.62, 243.12                       # Magnus coefficients (WMO)
    g = math.log(rh) + a * t_c / (b + t_c)
    return b * g / (a - g)


def part_e():
    print("\nE. COLD ROOM — fog on the ToF window after a carry-in (lumped model, EST)")
    c_th = 115 * 0.9                            # J/K: 115 g at ~0.9 J/(g K), mixed plastics/metal, EST
    area = 6 * 0.045 ** 2
    hc = 5.0                                    # W/(m^2 K), still-air natural convection, EST
    tau = c_th / (hc * area)
    print(f"   cube heat capacity {c_th:.0f} J/K, surface {area * 1e4:.0f} cm^2, h {hc} W/m^2K -> tau {tau / 60:.0f} min")
    print("   from    to (air, RH)        dew point   window fogged for")
    for t0, ta, rh in ((3, 21, 0.55), (3, 21, 0.45), (3, 23, 0.65), (8, 21, 0.55), (3, 12, 0.80)):
        td = dew_point(ta, rh)
        if t0 >= td:
            span = "never fogs"
        else:
            span = f"{tau * math.log((ta - t0) / (ta - td)) / 60:5.1f} min"
        print(f"   {t0:3d} C   {ta:3d} C, {rh * 100:3.0f} %        {td:5.1f} C    {span}")
    # G12 numbers: pitch rate seen by the gyro on a LEAP predicts the JUMP landing pitch
    m, h, i = CONFIGS["v.1 108.7 g"]
    v_l, _, _, t_l, _ = kin((0.040, 60))
    lever = h / math.sin(math.radians(60))
    print("\n   G12 pitch self-check (v.1): gyro pitch rate on a LEAP -> inferred thrust-line error")
    for err in (0.25, 0.50, 0.72, 1.00):
        d = lever * math.tan(math.radians(err))
        w = m * v_l * d / i
        print(f"     error {err:4.2f} deg -> LEAP pitch rate {math.degrees(w):5.1f} deg/s "
              f"({math.degrees(w) * t_l:4.2f} deg over the {t_l * 1e3:.0f} ms flight)")
    print("     MEMS gyro noise ~0.01 deg/s/sqrt(Hz) (class EST): over a 0.12 s flight the rate is resolved to "
          "well under 0.5 deg/s, i.e. the thrust-line error to ~0.02 deg per LEAP.")


def main():
    part_a()
    part_b()
    worst = part_c()
    part_c(2 * THRUST_ERR_DEG, " — sensitivity, 2x the stack")
    print("\n   thrust-line error at which each gesture first topples (worst sign, 0.01 deg scan):")
    for name, cfg in worst:
        e, psi = err_for_topple(name, cfg)
        print(f"     {name:32s} {cfg:22s} {e:5.2f} deg  landing pitch {psi:5.1f} deg   "
              f"margin over the {THRUST_ERR_DEG} deg stack {e / THRUST_ERR_DEG:4.1f}x")
    part_d()
    part_e()
    # longest v.1 range that keeps a given tip-over margin over the 0.72 deg stack
    #   2.0x  the stack is an unmeasured EST (no G12)
    #   1.5x  the error is MEASURED on the unit (G12)
    print("\nF. longest v.1 JUMP (@60 deg) with topple onset >= margin x the 0.72 deg stack:")
    best = {2.0: 0, 1.5: 0}
    for rng_mm in range(100, 205, 5):
        GESTURES.append((f"JUMP {rng_mm} mm @60", (rng_mm / 1000, 60)))
        e, _ = err_for_topple(f"JUMP {rng_mm} mm @60", "v.1 108.7 g")
        for k in best:
            if e >= k * THRUST_ERR_DEG:
                best[k] = rng_mm
        if rng_mm % 20 == 0:
            print(f"     {rng_mm:3d} mm   topple onset {e:4.2f} deg   ({e / THRUST_ERR_DEG:3.1f}x)")
    print(f"     -> 2.0x (unmeasured stack, no G12): {best[2.0]} mm    1.5x (measured): {best[1.5]} mm")

if __name__ == "__main__":
    main()
