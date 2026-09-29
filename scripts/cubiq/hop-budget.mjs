// CUBIQ(TM) v.0 — ballistic + actuator energy budget (design-time calculator)
// Usage: node scripts/cubiq/hop-budget.mjs
// Pure physics, no dependencies. Numbers feed docs/corporate/LOT-CUBIQ-CYCLE-02-REPORT.md.

const g = 9.81
const M = 0.120 // kg, v.0 mass target (spec 02)

// Ballistic: launch speed v at angle from vertical -> apex rise, range
const ballistic = (v, fromVerticalDeg) => {
  const th = (fromVerticalDeg * Math.PI) / 180
  const vy = v * Math.cos(th)
  const vx = v * Math.sin(th)
  const t = (2 * vy) / g
  return { rise_mm: (vy * vy) / (2 * g) * 1000, range_mm: vx * t * 1000, flight_ms: t * 1000 }
}
// Launch speed needed for a target range at a given angle from vertical
const vForRange = (range_m, fromVerticalDeg) => {
  const th = (fromVerticalDeg * Math.PI) / 180
  return Math.sqrt((range_m * g) / (2 * Math.sin(th) * Math.cos(th)))
}

// Reaction-mass launcher: reaction mass mr accelerates over stroke s, then
// strikes the shell. e = restitution of that strike (0 = plastic, 1 = elastic).
// Shell+everything leaves the ground with v = mr*vr*(1+e)/M  (mr strikes a body of mass M-mr, ground reaction ignored during impact)
const launcher = ({ mr, s, vLaunch, e }) => {
  const vr = (vLaunch * M) / (mr * (1 + e))
  const a = (vr * vr) / (2 * s)
  const F = mr * a
  const Ekin = 0.5 * mr * vr * vr
  return { vr, a_g: a / g, F_N: F, E_mJ: Ekin * 1000 }
}

const gestures = [
  { name: 'THE HOP  (<10mm rise, in place)', rise_mm: 8, fromVert: 0 },
  { name: 'THE LEAP (~40mm displacement, 15deg bias)', range_mm: 40, fromVert: 15 },
  { name: 'v.1 LONG JUMP (150mm, 35deg from vertical)', range_mm: 150, fromVert: 35 },
]

console.log('CUBIQ v.0 hop budget — M = %d g', M * 1000)
for (const gst of gestures) {
  const v = gst.rise_mm !== undefined ? Math.sqrt(2 * g * gst.rise_mm / 1000) : vForRange(gst.range_mm / 1000, gst.fromVert)
  const b = ballistic(v, gst.fromVert)
  const Eload = 0.5 * M * v * v * 1000
  console.log('\n' + gst.name)
  console.log('  launch speed %s m/s | rise %s mm | range %s mm | flight %s ms', v.toFixed(3), b.rise_mm.toFixed(1), b.range_mm.toFixed(1), b.flight_ms.toFixed(0))
  console.log('  kinetic energy delivered to cube: %s mJ', Eload.toFixed(1))
  for (const arch of [
    { label: 'voice-coil direct drive  (mr=40g, s=8mm, e=0.5)', mr: 0.040, s: 0.008, e: 0.5 },
    { label: 'spring + latch (release only) (mr=40g, s=15mm, e=0.5)', mr: 0.040, s: 0.015, e: 0.5 },
  ]) {
    const L = launcher({ ...arch, vLaunch: v })
    console.log('  %s\n    reaction mass %s m/s, %s g accel, %s N peak force, %s mJ stored', arch.label, L.vr.toFixed(2), L.a_g.toFixed(0), L.F_N.toFixed(1), L.E_mJ.toFixed(0))
  }
}

// Battery sanity: 300 mAh @ 3.7 V, 5% conversion efficiency into a Leap (spring wind-up + friction losses)
const packJ = 0.3 * 3.7 * 3600
console.log('\nBattery 300mAh@3.7V = %s J; Leaps per charge at 5%% chain efficiency, 0.2 J stored each: ~%s', packJ.toFixed(0), Math.floor((packJ * 0.05) / 0.2))

// Levitation force budget
const W = M * g
const faceArea = 0.045 * 0.045
const pReq = W / faceArea
const dB = 20 * Math.log10(pReq / 2e-5)
console.log('\nLevitation: weight = %s N; acoustic pressure over one 45x45mm face to support it = %s Pa rms ≈ %s dB SPL (unsafe / non-viable)', W.toFixed(2), pReq.toFixed(0), dB.toFixed(0))
// Electromagnet lift: F = B^2 A / (2 mu0) at the gap-face of a magnet pair
const mu0 = 4e-7 * Math.PI
const Bneed = Math.sqrt((2 * mu0 * W) / faceArea)
console.log('Magnetic: field at the cube face needed for %s N over 45x45mm = %s mT (cube-side permanent magnet + coil bias; feasible with active control)', W.toFixed(2), (Bneed * 1000).toFixed(0))
