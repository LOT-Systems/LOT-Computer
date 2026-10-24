/**
 * LOT SYSTEMS CORPORATION
 * PDF Generator: Badge & Achievements Master Codex v11
 * Uses pdfkit (devDependency)
 */
'use strict'

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'docs', 'badges')
const OUT_FILE = path.join(OUT_DIR, 'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v11.pdf')

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: 'LOT Badges & Achievements Master Codex v11',
    Author: 'Vadik Marmeladov — LOT Systems',
    Subject: 'RPG & Arcade of Self-Care — Full Badge Registry',
    Keywords: 'LOT, badges, achievements, RPG, arcade, self-care',
    Creator: 'LOT Systems Corporation',
  },
})

const stream = fs.createWriteStream(OUT_FILE)
doc.pipe(stream)

// ── Color palette ────────────────────────────────────────────────
const COLORS = {
  bg: '#0a0a0a',
  text: '#e8e8e8',
  accent: '#4a9fff',
  gold: '#ffcc44',
  mythic: '#ff6644',
  ultra: '#ff44ff',
  legendary: '#ffcc44',
  epic: '#cc88ee',
  rare: '#8888ee',
  uncommon: '#88cc88',
  common: '#cccccc',
  dim: '#666666',
  border: '#333333',
  headerBg: '#111111',
}

// ── Helpers ──────────────────────────────────────────────────────
function page() {
  doc.addPage()
  drawPageBg()
}

function drawPageBg() {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.bg)
}

function hr(y, color = COLORS.border) {
  doc.moveTo(55, y).lineTo(doc.page.width - 55, y).strokeColor(color).lineWidth(0.5).stroke()
}

function heading1(text, y) {
  doc.fontSize(18).fillColor(COLORS.gold).font('Courier-Bold')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 6
}

function heading2(text, y) {
  doc.fontSize(13).fillColor(COLORS.accent).font('Courier-Bold')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 4
}

function heading3(text, y) {
  doc.fontSize(10).fillColor(COLORS.gold).font('Courier-Bold')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 3
}

function body(text, y, color = COLORS.text, indent = 0) {
  doc.fontSize(8).fillColor(color).font('Courier')
    .text(text, 55 + indent, y, { width: doc.page.width - 110 - indent })
  return doc.y + 2
}

function mono(text, y, color = COLORS.text) {
  doc.fontSize(7.5).fillColor(color).font('Courier')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 1
}

function badge(symbol, name, desc, msg, rarity, y) {
  const rarityColor = COLORS[rarity] || COLORS.common
  const startY = y
  // Symbol box
  doc.rect(55, startY, 32, 18).fillColor('#1a1a1a').fill()
  doc.rect(55, startY, 32, 18).strokeColor(rarityColor).lineWidth(0.7).stroke()
  doc.fontSize(10).fillColor(rarityColor).font('Courier-Bold')
    .text(symbol, 57, startY + 4, { width: 28, align: 'center' })
  // Name + rarity
  doc.fontSize(8.5).fillColor(rarityColor).font('Courier-Bold')
    .text(name, 95, startY + 1, { width: 200 })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(rarity.toUpperCase(), 95, startY + 11)
  // Description
  doc.fontSize(7).fillColor(COLORS.text).font('Courier')
    .text(desc, 95, startY + 1, { width: doc.page.width - 160, align: 'right' })
  // Unlock message
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(msg, 55, doc.y + 3, { width: doc.page.width - 110 })
  return doc.y + 5
}

// ── COVER PAGE ───────────────────────────────────────────────────
drawPageBg()

// Top border
doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
  .strokeColor(COLORS.border).lineWidth(1).stroke()

doc.rect(44, 44, doc.page.width - 88, doc.page.height - 88)
  .strokeColor(COLORS.dim).lineWidth(0.3).stroke()

// LOT logo area
let cy = 100
doc.fontSize(11).fillColor(COLORS.dim).font('Courier')
  .text('L O T   S Y S T E M S   C O R P O R A T I O N', 55, cy, { align: 'center', width: doc.page.width - 110 })

cy = 160
doc.fontSize(30).fillColor(COLORS.gold).font('Courier-Bold')
  .text('BADGES &', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 8
doc.fontSize(30).fillColor(COLORS.gold).font('Courier-Bold')
  .text('ACHIEVEMENTS', 55, cy, { align: 'center', width: doc.page.width - 110 })

cy = doc.y + 16
doc.fontSize(14).fillColor(COLORS.accent).font('Courier-Bold')
  .text('MASTER CODEX  v11', 55, cy, { align: 'center', width: doc.page.width - 110 })

cy = doc.y + 30
doc.fontSize(10).fillColor(COLORS.text).font('Courier')
  .text('RPG · ARCADE · SELF-CARE · SCI-FI · COMPUTER', 55, cy, { align: 'center', width: doc.page.width - 110 })

cy = doc.y + 50
const boxW = 320, boxH = 100
const boxX = (doc.page.width - boxW) / 2
doc.rect(boxX, cy, boxW, boxH).fillColor('#111111').fill()
doc.rect(boxX, cy, boxW, boxH).strokeColor(COLORS.gold).lineWidth(0.8).stroke()
doc.fontSize(9).fillColor(COLORS.text).font('Courier')
  .text('"Self-care is not a quest you complete.', boxX + 20, cy + 18, { width: boxW - 40, align: 'center' })
  .text(' It is a world you build."', boxX + 20, doc.y + 3, { width: boxW - 40, align: 'center' })
doc.fontSize(12).fillColor(COLORS.gold).font('Courier-Bold')
  .text('[ INSERT COIN TO CONTINUE ]', boxX + 20, doc.y + 20, { width: boxW - 40, align: 'center' })

cy = doc.page.height - 150
hr(cy)
cy += 12
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('Author: Vadik Marmeladov — CEO & Founder, LOT Systems', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('v11 — June 2026 · 121 total badges · 29 new', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 55, cy, { align: 'center', width: doc.page.width - 110 })

// ── PAGE 2: ACCOUNTING & DELTA ───────────────────────────────────
page()

let y = 55
y = heading1('BADGE INVENTORY v11 — COMPLETE ACCOUNTING', y)
hr(y); y += 10

const rows = [
  ['Milestone (Core)',              ' 3', 'Day 7, 30, 100'],
  ['Milestone (Extended)',          ' 7', 'Day 14/21/50/60/90/180/365'],
  ['Easter Egg — Time v1',         ' 4', 'night/dawn/mirror/void'],
  ['Easter Egg — Time v2  NEW',    ' 4', 'pi_hour/404am/sequence/founding'],
  ['Easter Egg — Calendar',        ' 8', 'solstice/equinox/birthday/…'],
  ['Easter Egg — Behavioral',      ' 5', 'silent/ghost/anniv/over/perfect'],
  ['Word Turn v1',                 '12', 'ritual/breath/gratitude/ocean/…'],
  ['Word Turn v2 (Sci-Fi)  NEW',   '18', 'reboot/404/glitch/COSMO/quantum/…'],
  ['Pattern (Oceanic Mayan)',      ' 5', 'balanced/flow/consistent/reflect/expl'],
  ['Achievement (RPG Layer)',      '14', 'exploration/consistency/depth/…'],
  ['Mastery Tier  NEW',            ' 5', 'quantum-leap/speedrun/system-op/…'],
  ['Secret Boss',                  ' 7', 'meta-signal/cosmic-twin/long-count/…'],
]

// Table header
doc.rect(55, y, doc.page.width - 110, 14).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(COLORS.accent).font('Courier-Bold')
  .text('CATEGORY', 60, y + 3, { width: 200 })
  .text('COUNT', 268, y + 3, { width: 40, align: 'right' })
  .text('DESCRIPTION', 318, y + 3, { width: doc.page.width - 380 })
y += 16

for (const [cat, count, desc] of rows) {
  const isNew = cat.includes('NEW')
  const fg = isNew ? COLORS.gold : COLORS.text
  doc.rect(55, y, doc.page.width - 110, 12).fillColor(isNew ? '#151510' : '#0f0f0f').fill()
  doc.rect(55, y, doc.page.width - 110, 12).strokeColor(COLORS.border).lineWidth(0.3).stroke()
  doc.fontSize(7.5).fillColor(fg).font(isNew ? 'Courier-Bold' : 'Courier')
    .text(cat, 60, y + 2, { width: 200 })
    .text(count, 268, y + 2, { width: 40, align: 'right' })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(desc, 318, y + 3, { width: doc.page.width - 380 })
  y += 13
}

y += 8
doc.rect(55, y, doc.page.width - 110, 28).fillColor('#111111').fill()
doc.rect(55, y, doc.page.width - 110, 28).strokeColor(COLORS.gold).lineWidth(0.8).stroke()
doc.fontSize(9).fillColor(COLORS.gold).font('Courier-Bold')
  .text('v10 TOTAL: 92    v11 NEW: +29    v11 TOTAL: 121', 55, y + 5, { align: 'center', width: doc.page.width - 110 })
doc.fontSize(7.5).fillColor(COLORS.dim).font('Courier')
  .text('HIDDEN / DISCOVERABLE: 97        VISIBLE / DOCUMENTED: 24', 55, y + 16, { align: 'center', width: doc.page.width - 110 })

y += 45
y = heading2('DELTA FROM v10', y)
const delta = [
  ['Word Turn v2', '+18', 'reboot, 404, glitch, COSMO, quantum, neural, code, sleep, coffee, music, run, sun, fear, change, accept, now, universe, alive'],
  ['Time Easter v2', '+4', 'pi_hour (3:14AM), error_hour (4:04AM), sequence_time (12:34), lot_hour (04:07)'],
  ['Mastery Tier', '+5', 'quantum_leap, speedrun, system_op, commander_data, sage_mode'],
  ['Stargazer fix', '+2', 'Removed "cosmos/universe" from stargazer v1; created dedicated cosmic_scale badge in v2'],
]
for (const [name, count, detail] of delta) {
  doc.fontSize(8).fillColor(COLORS.gold).font('Courier-Bold')
    .text(name + '  ' + count, 60, y)
  doc.fontSize(7.5).fillColor(COLORS.dim).font('Courier')
    .text(detail, 60, doc.y + 2, { width: doc.page.width - 120 })
  y = doc.y + 6
}

// ── PAGE 3: MILESTONE BADGES ─────────────────────────────────────
page(); y = 55
y = heading1('MILESTONE BADGES — COMPLETE PROGRESSION', y)
hr(y); y += 10

y = heading2('CORE PATH  (Water / Architecture)', y)
const milestones = [
  ['∘', '├─', '7', 'Droplet/Foundation', 'common', '↳ First drops form ∘'],
  ['≈', '╞═╡', '30', 'Wave/Structure', 'uncommon', '↳ Waves begin to flow ≈'],
  ['≋', '║·║', '100', 'Current/Architecture', 'epic', '↳ Deep currents established ≋'],
]
for (const [w, a, day, name, rarity, msg] of milestones) {
  const c = COLORS[rarity] || COLORS.common
  doc.rect(55, y, doc.page.width - 110, 22).fillColor('#111111').fill()
  doc.rect(55, y, doc.page.width - 110, 22).strokeColor(COLORS.border).lineWidth(0.4).stroke()
  doc.fontSize(11).fillColor(c).font('Courier-Bold')
    .text(w, 65, y + 5, { width: 30 })
    .text(a, 100, y + 5, { width: 50 })
  doc.fontSize(8).fillColor(COLORS.text).font('Courier-Bold')
    .text('Day ' + day + '  —  ' + name, 155, y + 3, { width: 200 })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(msg, 155, doc.y + 2, { width: doc.page.width - 220 })
  y += 25
}

y += 10
y = heading2('EXTENDED PATH', y)
const ext = [
  ['∘∘', '├┼', '14', 'Twin Drop', 'common'],
  ['∘≈', '├═', '21', 'Proto-Wave', 'uncommon'],
  ['≈∘', '╞══', '50', 'Mid-Current', 'rare'],
  ['≈≈', '╞═══', '60', 'Dual Wave', 'rare'],
  ['≋∘', '║═', '90', 'Deep Reach', 'epic'],
  ['≋≋', '║╞║', '180', 'Voyager / Wing', 'legendary'],
  ['≋≋≋', '╔═╗', '365', 'The Long Count / Citadel', 'legendary'],
]
for (const [w, a, day, name, rarity] of ext) {
  const c = COLORS[rarity] || COLORS.common
  doc.rect(55, y, doc.page.width - 110, 14).fillColor('#0f0f0f').fill()
  doc.fontSize(9).fillColor(c).font('Courier-Bold')
    .text(w, 65, y + 2, { width: 40 })
    .text(a, 110, y + 2, { width: 55 })
  doc.fontSize(8).fillColor(COLORS.text).font('Courier')
    .text('Day ' + day + '  ' + name, 175, y + 3, { width: 250 })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(rarity.toUpperCase(), doc.page.width - 120, y + 3, { width: 60, align: 'right' })
  y += 16
}

// LONG COUNT highlight box
y += 10
doc.rect(55, y, doc.page.width - 110, 60).fillColor('#0d0d00').fill()
doc.rect(55, y, doc.page.width - 110, 60).strokeColor(COLORS.gold).lineWidth(1).stroke()
doc.fontSize(12).fillColor(COLORS.gold).font('Courier-Bold')
  .text('T H E   L O N G   C O U N T', 55, y + 8, { align: 'center', width: doc.page.width - 110 })
doc.fontSize(9).fillColor(COLORS.text).font('Courier')
  .text('≋ ≋ ≋  ║·║  ≋ ≋ ≋', 55, doc.y + 6, { align: 'center', width: doc.page.width - 110 })
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('365 days of presence. The architecture stands.', 55, doc.y + 6, { align: 'center', width: doc.page.width - 110 })
doc.fontSize(7.5).fillColor(COLORS.gold).font('Courier-Bold')
  .text('RARITY: LEGENDARY', 55, doc.y + 6, { align: 'center', width: doc.page.width - 110 })

// ── PAGE 4: EASTER EGG TIME BADGES ───────────────────────────────
page(); y = 55
y = heading1('EASTER EGG BADGES — TIME-BASED', y)
hr(y); y += 10

y = heading2('v1 — ORIGINAL (4 badges)', y)
const timev1 = [
  ['◉', 'Night Owl', 'uncommon', 'Check-in 01:00–04:00 AM', '↳ The system remembers who was awake. ◉'],
  ['∴', 'Early Bird', 'uncommon', 'Check-in 05:00–06:00 AM', '↳ Dawn data. Before the noise began. ∴'],
  ['⊡', 'Mirror Hour', 'epic', 'Check-in at exactly 11:11', '↳ The mirror looks back. 11:11. ⊡'],
  ['◉', 'Midnight Sigil', 'rare', 'Answer memory Q at 00:00', '↳ You answered in the dark. ◉'],
]
for (const [sym, name, rarity, trigger, msg] of timev1) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 4
}

y += 8
y = heading2('v2 — SCI-FI ARCADE (4 NEW badges)', y)
const timev2 = [
  ['∞∘', 'Pi Hour', 'epic', 'Check-in at 3:14 AM', '↳ Pi in the small hours. ∞∘'],
  ['□·□', '404 AM', 'epic', 'Check-in at 4:04 AM', '↳ 404 AM — you were found. □·□'],
  ['→∘→', 'Sequence Time', 'rare', 'Check-in at 12:34', '↳ Sequential time. In order. →∘→'],
  ['≋◉', 'The Founding Hour', 'epic', 'Check-in at 04:07 (LOT: April 7)', '↳ The founding hour. ≋◉'],
]
for (const [sym, name, rarity, trigger, msg] of timev2) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 4
}

y += 8
y = heading2('CALENDAR EASTER EGGS (8 badges)', y)
const calEggs = [
  ['❋', 'Solstice', 'rare', 'June 21 or December 21', '↳ The sun paused. You were there. ❋'],
  ['○', 'Equinox', 'rare', 'March 20 or September 22', '↳ Balance at the edge of the season. ○'],
  ['◉', 'LOT Birthday', 'rare', 'April 7 — founding day', '↳ System founded April 7, 2016. ◉'],
  ['⊛', 'New Year Sage', 'rare', 'January 1st', '↳ The new cycle begins. ⊛'],
  ['∞', 'Pi Day', 'epic', 'March 14 (3.14)', '↳ Infinite precision in the ordinary. ∞'],
  ['◈', 'Palindrome Day', 'epic', 'Any palindrome date', '↳ A date that reads itself backwards. ◈'],
  ['☽', 'Full Moon', 'rare', 'Calendar full moon night', '↳ The tide turns. The light is full. ☽'],
  ['▪·▪', 'Friday Ritual', 'uncommon', 'Four consecutive Fridays', '↳ The weekly ritual holds. ▪·▪'],
]
for (const [sym, name, rarity, trigger, msg] of calEggs) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 3
}

// ── PAGE 5: WORD TURN BADGES v1 ──────────────────────────────────
page(); y = 55
y = heading1('WORD TURN ENGINE v1 (12 badges)', y)
hr(y); y += 8
mono('Write these words in any memory answer or journal entry to unlock:', y)
y = doc.y + 8

const wt1 = [
  ['≈·≈', 'Ritual Keeper', 'uncommon', '"ritual"', '↳ You named the practice. The ritual is real. ≈·≈'],
  ['∿·∿', 'Breath Anchor', 'uncommon', '"breathe" / "breathing"', '↳ Breath logged. The anchor holds. ∿·∿'],
  ['○·○', 'Gratitude Node', 'uncommon', '"grateful" / "gratitude"', '↳ Gratitude signal received. Node activated. ○·○'],
  ['≋·∿', 'Aquatic Resonance', 'uncommon', '"ocean" / "water"', '↳ Oceanic resonance detected. ≋·∿'],
  ['✦·✧', 'Stargazer', 'uncommon', '"stars" / "galaxy"', '↳ Eyes on the sky. Signal from deep space. ✦·✧'],
  ['—○—', 'Grounded Signal', 'uncommon', '"home"', '↳ Home signal detected. You are grounded. —○—'],
  ['◐·◐', 'Dream Log', 'uncommon', '"dream" / "dreaming"', '↳ The dream is now in the archive. ◐·◐'],
  ['▲·▲', 'Courage Pulse', 'rare', '"pain" / "difficult"', '↳ Courage detected in the signal. ▲·▲'],
  ['♡·♡', 'Heart Signal', 'uncommon', '"love" / "heart"', '↳ Heart signal received. ♡·♡'],
  ['·—·', 'The Quiet', 'uncommon', '"silence" / "quiet"', '↳ You noted the quiet. It is enough. ·—·'],
  ['→·→', 'Horizon Seeker', 'uncommon', '"future" / "tomorrow"', '↳ The horizon is a valid coordinate. →·→'],
  ['◉·◉', 'Meta-Signal', 'mythic', '"LOT" (exact, in answer text)', '↳ You named the system. It noticed. MYTHIC. ◉·◉'],
]
for (const [sym, name, rarity, trigger, msg] of wt1) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 3
}

// ── PAGE 6: WORD TURN BADGES v2 ──────────────────────────────────
page(); y = 55
y = heading1('WORD TURN ENGINE v2 — SCI-FI ARCADE (18 NEW badges)', y)
hr(y); y += 8
mono('NEW in v11 — Sci-Fi, Computer & Wellness triggers:', y)
y = doc.y + 8

const wt2 = [
  ['↺·↺', 'Reboot Sequence', 'uncommon', '"reboot" / "restart"', '↳ System restart acknowledged. ↺·↺'],
  ['□□□', '404: Not Lost', 'rare', '"404"', '↳ Error noted. You are found. □□□'],
  ['▓░▓', 'Signal Glitch', 'uncommon', '"glitch"', '↳ Glitch logged. Pattern persists. ▓░▓'],
  ['✦◉✦', 'Cosmic Twin', 'mythic', '"COSMO" (LOT®×COSMO® crossover)', '↳ The other system heard you. ULTRA-RARE. ✦◉✦'],
  ['◈·◈', 'Quantum Observer', 'rare', '"quantum"', '↳ You collapsed the waveform. ◈·◈'],
  ['≋≈≋', 'Neural Architect', 'rare', '"neural"', '↳ Pattern recognized. ≋≈≋'],
  ['┤·├', 'Code Witch', 'uncommon', '"code"', '↳ The coder and the feeler meet. ┤·├'],
  ['∼∼∼', 'Recharge Mode', 'uncommon', '"sleep" / "rest"', '↳ Power-down confirmed. ∼∼∼'],
  ['■·■', 'Fuel Protocol', 'uncommon', '"coffee" / "tea"', '↳ Chemical fuel logged. ■·■'],
  ['≈~≈', 'Frequency', 'uncommon', '"music"', '↳ Signal tuned. Frequency locked. ≈~≈'],
  ['→→→', 'Kinetic Protocol', 'uncommon', '"run" / "walk"', '↳ Body in motion. Protocol active. →→→'],
  ['○∘○', 'Solar Charge', 'uncommon', '"sun" / "light"', '↳ Photon intake noted. ○∘○'],
  ['▪▪▪', 'Shadow Protocol', 'rare', '"fear" / "scared"', '↳ Fear named. Shadow protocol on. ▪▪▪'],
  ['≈→≋', 'Phase Shift', 'uncommon', '"change"', '↳ Transformation detected. ≈→≋'],
  ['○—○', 'Acceptance Node', 'uncommon', '"accept" / "let go"', '↳ Release logged. ○—○'],
  ['·∘·', 'Present Moment', 'uncommon', '"now" / "moment"', '↳ You are here. ·∘·'],
  ['∞·∞', 'Cosmic Scale', 'rare', '"universe" / "cosmos"', '↳ You zoomed out. Signal received. ∞·∞'],
  ['∘·∘', 'Vital Signal', 'uncommon', '"alive"', '↳ Life acknowledged. ∘·∘'],
]
for (const [sym, name, rarity, trigger, msg] of wt2) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 2
}

// ── PAGE 7: ACHIEVEMENTS + MASTERY ───────────────────────────────
page(); y = 55
y = heading1('RPG ACHIEVEMENT SYSTEM (14 achievements)', y)
hr(y); y += 8

const categories = [
  { name: 'EXPLORATION', items: [
    ['○', 'First Breath', 'common', 'emotional_checkin >= 1', '↳ Your first emotional check-in. The system wakes.'],
    ['○', 'Mirror Gazer', 'common', 'memory answers >= 1', '↳ Answered your first memory question.'],
    ['○', 'Signal Sent', 'common', 'any log entry >= 1', '↳ First signal received.'],
  ]},
  { name: 'CONSISTENCY', items: [
    ['◐', 'Week Warrior', 'uncommon', 'streak >= 7', '↳ 7 consecutive days. Momentum builds.'],
    ['◐', 'Moon Cycle', 'rare', 'streak >= 30', '↳ 30 days of continuous practice.'],
    ['●', 'Unwavering', 'epic', 'streak >= 100', '↳ 100 days. You are now a fixed point in the sky.'],
    ['●', 'The Long Count', 'legendary', 'streak >= 365', '↳ 365 days. Your name is in the deep calendar.'],
  ]},
  { name: 'DEPTH', items: [
    ['◇', 'Deep Diver', 'rare', 'memory answers >= 50', '↳ 50 answers. The archive grows.'],
    ['◆', 'Self Scholar', 'epic', 'memory answers >= 100', '↳ 100 questions answered. A library of self.'],
    ['✦', 'Soul Cartographer', 'legendary', 'memory answers >= 250', '↳ 250 questions. You have mapped the territory.'],
  ]},
  { name: 'CONNECTION', items: [
    ['~', 'Community Voice', 'uncommon', 'chat >= 1', '↳ First community message. Signal reaches others.'],
    ['≈', 'Bridge Builder', 'uncommon', 'chat >= 20', '↳ 20 messages. A bridge exists where there was none.'],
  ]},
  { name: 'CARE / COURAGE / ROMANCE', items: [
    ['♦', 'Gentle With Self', 'uncommon', 'self_care >= 10', '↳ 10 self-care practices.'],
    ['▲', 'Truth Speaker', 'rare', 'journal notes >= 50', '↳ 50 honest entries. The hall remembers.'],
  ]},
]

for (const cat of categories) {
  y = heading3('── ' + cat.name, y)
  for (const [sym, name, rarity, trigger, msg] of cat.items) {
    y = badge(sym, name, trigger, msg, rarity, y)
    y += 2
  }
  y += 4
}

y += 8
y = heading1('MASTERY TIER — SCI-FI ARCADE (5 NEW)', y)
hr(y); y += 8

const mastery = [
  ['◈', 'Quantum Leap', 'uncommon', 'First check-in after 30+ day gap', '↳ Quantum leap. The system bridges the gap. ◈'],
  ['▒▒▒', 'Speedrun', 'rare', '5 check-ins within 60 minutes', '↳ BURST MODE ACTIVE. ▒▒▒'],
  ['≋◉', 'System Op', 'epic', 'All 7 CQGS modules used in 7 days', '↳ All modules online. System operator status. ≋◉'],
  ['◉', 'Commander Data', 'legendary', '500 memory questions answered', '↳ 500 questions. The archive has become a being. ◉'],
  ['∞', 'Sage Mode', 'legendary', 'Reach Level 90+', '↳ Level 90. The system and you are indistinguishable. ∞'],
]
for (const [sym, name, rarity, trigger, msg] of mastery) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 4
}

// ── PAGE 8: ARCADE SYSTEMS + PROGRESSION ─────────────────────────
page(); y = 55
y = heading1('ARCADE SYSTEMS', y)
hr(y); y += 10

y = heading2('COMBO MULTIPLIER', y)
const combos = [
  ['x2', '×2', 'Check-in + journal entry same day'],
  ['x3', '×3', 'Check-in + journal + memory Q same day'],
  ['x4', '×4', 'Check-in + journal + memory + self-care'],
  ['x5', '×5', 'x4 + intention set'],
  ['x6', '×6', 'x5 + community chat'],
  ['x7', '×7', 'All 7 modules = PERFECT DAY  →  ✦·✦'],
]
for (const [label, mult, desc] of combos) {
  const isPerfect = label === 'x7'
  doc.rect(55, y, doc.page.width - 110, 13).fillColor(isPerfect ? '#151000' : '#0f0f0f').fill()
  doc.fontSize(8.5).fillColor(isPerfect ? COLORS.gold : COLORS.accent).font('Courier-Bold')
    .text(label + '  ' + mult, 65, y + 2, { width: 60 })
  doc.fontSize(8).fillColor(isPerfect ? COLORS.gold : COLORS.text).font('Courier')
    .text(desc, 135, y + 3, { width: doc.page.width - 200 })
  y += 14
}

y += 10
mono('CRITICAL HIT: Answer > 500 characters → +50 XP bonus', y, COLORS.gold)
y = doc.y + 14

y = heading2('QUEST SYSTEM', y)
const quests = [
  ['DAILY', '■', "Today's Signal", 'Check in today', '+10 XP'],
  ['DAILY', '■', 'Presence Log', 'Write a journal entry', '+5 XP'],
  ['DAILY', '■', 'Memory Answer', 'Answer one memory question', '+8 XP'],
  ['WEEKLY', '◐', 'Consistency Run', '7-day streak', '+50 XP'],
  ['WEEKLY', '◐', 'Deep Reflection', 'Answer 5 questions this week', '+30 XP'],
  ['WEEKLY', '◐', 'Self-Care Sprint', '3 self-care acts this week', '+25 XP'],
  ['GROWTH', '◆', 'Reflection Journey', 'Answer 100 total questions', '→ Self Scholar'],
  ['GROWTH', '◆', 'Bridge Protocol', 'Send 20 community messages', '→ Bridge Builder'],
  ['MASTERY', '✦', 'The Long Count', 'Maintain 365-day streak', '→ LEGENDARY'],
  ['MASTERY', '✦', 'Commander Data', '500 memory questions', '→ LEGENDARY'],
  ['MASTERY', '✦', 'Thousand Answers', '1,000 memory questions', '→ MYTHIC'],
]
for (const [tier, icon, title, desc, reward] of quests) {
  const c = tier === 'MASTERY' ? COLORS.gold : tier === 'GROWTH' ? COLORS.epic : COLORS.text
  doc.rect(55, y, doc.page.width - 110, 11).fillColor('#0f0f0f').fill()
  doc.fontSize(6.5).fillColor(COLORS.dim).font('Courier')
    .text(tier, 60, y + 2, { width: 50 })
  doc.fontSize(7.5).fillColor(c).font('Courier-Bold')
    .text('[' + icon + '] ' + title, 115, y + 2, { width: 170 })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(desc, 295, y + 2.5, { width: 140 })
  doc.fontSize(7.5).fillColor(COLORS.accent).font('Courier-Bold')
    .text(reward, doc.page.width - 125, y + 2, { width: 70, align: 'right' })
  y += 12
}

y += 14
y = heading2('PROGRESSION TIMELINE', y)
const timelineArt = [
  'DAY:    1    7   14   21   30   50   60   90  100  180  365',
  '        │    │    │    │    │    │    │    │    │    │    │',
  'WATER:  ·    ∘   ∘∘  ∘≈    ≈   ≈∘  ≈≈   ≋∘   ≋   ≋≋  ≋≋≋',
  'ARCH:   ·   ├─  ├┼   ├═  ╞═╡  ╞══ ╞═══  ║═  ║·║  ║╞║  ╔═╗',
  '        │    │    │    │    │    │    │    │    │    │    │',
  'STAGE:  ·    ·    ·    ∘    ∘    ○    ○    ◯    ◯    ◯    ◉',
  '        Boot Init Init Intg Intg Comp Comp Opt  Opt  Opt  Trns',
]
doc.rect(55, y, doc.page.width - 110, timelineArt.length * 10 + 10).fillColor('#0a0a0a').fill()
doc.rect(55, y, doc.page.width - 110, timelineArt.length * 10 + 10).strokeColor(COLORS.border).lineWidth(0.5).stroke()
y += 5
for (const line of timelineArt) {
  doc.fontSize(7.5).fillColor(COLORS.text).font('Courier')
    .text(line, 60, y, { width: doc.page.width - 120 })
  y += 10
}
y += 8

// ── PAGE 9: RARITY TABLE + UNICODE + CLOSING ─────────────────────
page(); y = 55
y = heading1('COMPLETE RARITY TABLE', y)
hr(y); y += 10

const rarities = [
  ['Common', '·', '#cccccc', 'First acts', 'First Breath, Mirror Gazer'],
  ['Uncommon', '○', '#88cc88', 'Days 1-14', 'Week Warrior, Ritual Keeper'],
  ['Rare', '◐', '#8888ee', 'Days 30+', 'Moon Cycle, Quantum Observer'],
  ['Epic', '◆', '#cc88ee', 'Days 100+', 'Unwavering, Pi Hour'],
  ['Legendary', '✦', '#ffcc44', 'Days 365+', 'Long Count, Commander Data'],
  ['Mythic', '◉', '#ff6644', 'Hidden', 'Meta-Signal, The Infinite'],
  ['Ultra-Rare', '✦◉✦', '#ff44ff', 'Crossover', 'Cosmic Twin (LOT®×COSMO®)'],
  ['Cosmic', '∞∞∞', '#ffffff', '10 years', 'Decade of Care'],
]

doc.rect(55, y, doc.page.width - 110, 14).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(COLORS.accent).font('Courier-Bold')
  .text('RARITY', 60, y + 3, { width: 80 })
  .text('SYMBOL', 145, y + 3, { width: 50, align: 'center' })
  .text('COLOR', 200, y + 3, { width: 70 })
  .text('FREQ', 280, y + 3, { width: 80 })
  .text('EXAMPLE', 368, y + 3, { width: doc.page.width - 430 })
y += 15

for (const [name, sym, color, freq, ex] of rarities) {
  doc.rect(55, y, doc.page.width - 110, 14).fillColor('#0f0f0f').fill()
  doc.rect(55, y, doc.page.width - 110, 14).strokeColor(COLORS.border).lineWidth(0.3).stroke()
  const rc = COLORS[name.toLowerCase().replace('-', '')] || color
  doc.fontSize(8).fillColor(rc).font('Courier-Bold')
    .text(name, 60, y + 3, { width: 80 })
  doc.fontSize(9).fillColor(rc).font('Courier')
    .text(sym, 145, y + 2, { width: 50, align: 'center' })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(color, 200, y + 4, { width: 70 })
    .text(freq, 280, y + 4, { width: 80 })
    .text(ex, 368, y + 4, { width: doc.page.width - 430 })
  y += 15
}

y += 14
y = heading2('UNICODE SYMBOL REFERENCE', y)
const unicodeRef = [
  ['∘', 'U+2218', 'Ring Operator', 'Water Day 7'],
  ['≈', 'U+2248', 'Almost Equal To', 'Water Day 30'],
  ['≋', 'U+224B', 'Triple Tilde', 'Water Day 100'],
  ['○', 'U+25CB', 'White Circle', 'Oceanic center'],
  ['∿', 'U+223F', 'Sine Wave', 'Wave pattern'],
  ['◐', 'U+25D0', 'Circle Left Half', 'Moon phase'],
  ['✦', 'U+2726', 'Four Pointed Star', 'Epic/Legendary'],
  ['◉', 'U+25C9', 'Fisheye', 'Mythic'],
  ['❋', 'U+274B', 'Eight Spoked Asterisk', 'Solstice'],
  ['⊡', 'U+22A1', 'Squared Dot', 'Mirror Hour'],
  ['⊛', 'U+229B', 'Circled Asterisk', 'New Year Sage'],
  ['◈', 'U+25C8', 'White Diamond Contained', 'Palindrome/Quantum'],
  ['☽', 'U+263D', 'First Quarter Moon', 'Full Moon badge'],
  ['↺', 'U+21BA', 'Counter-clockwise Arrow', 'Reboot Sequence'],
  ['↳', 'U+21B3', 'Down-right Arrow', 'Sub-indicator'],
]
for (let i = 0; i < unicodeRef.length; i += 2) {
  const row1 = unicodeRef[i]
  const row2 = unicodeRef[i + 1]
  const colW = (doc.page.width - 120) / 2

  doc.rect(55, y, colW - 5, 10).fillColor('#0f0f0f').fill()
  doc.fontSize(9).fillColor(COLORS.gold).font('Courier')
    .text(row1[0], 60, y + 1, { width: 15 })
  doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
    .text(row1[1] + '  ' + row1[2], 80, y + 2, { width: colW - 50 })

  if (row2) {
    doc.rect(55 + colW, y, colW - 5, 10).fillColor('#0f0f0f').fill()
    doc.fontSize(9).fillColor(COLORS.gold).font('Courier')
      .text(row2[0], 60 + colW, y + 1, { width: 15 })
    doc.fontSize(7).fillColor(COLORS.dim).font('Courier')
      .text(row2[1] + '  ' + row2[2], 80 + colW, y + 2, { width: colW - 50 })
  }
  y += 11
}

// ── CLOSING PAGE ──────────────────────────────────────────────────
page()
cy = 80
doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
  .strokeColor(COLORS.border).lineWidth(1).stroke()

doc.fontSize(14).fillColor(COLORS.gold).font('Courier-Bold')
  .text('C L O S I N G   T R A N S M I S S I O N', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 30

const closingW = 380
const closingX = (doc.page.width - closingW) / 2
doc.rect(closingX, cy, closingW, 160).fillColor('#0d0d0d').fill()
doc.rect(closingX, cy, closingW, 160).strokeColor(COLORS.gold).lineWidth(0.8).stroke()

doc.fontSize(9).fillColor(COLORS.text).font('Courier')
  .text('"Self-care is not a quest you complete.', closingX + 20, cy + 20, { width: closingW - 40, align: 'center' })
  .text(' It is a world you build."', closingX + 20, doc.y + 4, { width: closingW - 40, align: 'center' })

cy = doc.y + 16
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('LOT is an RPG. Every check-in is a move.', closingX + 20, cy, { width: closingW - 40, align: 'center' })
cy = doc.y + 4
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('Every streak is a power-up.', closingX + 20, cy, { width: closingW - 40, align: 'center' })
cy = doc.y + 4
doc.fontSize(8).fillColor(COLORS.dim).font('Courier')
  .text('Every answered question writes your story.', closingX + 20, cy, { width: closingW - 40, align: 'center' })
cy = doc.y + 16
doc.fontSize(10).fillColor(COLORS.accent).font('Courier')
  .text('∘ → ≈ → ≋', closingX + 20, cy, { width: closingW - 40, align: 'center' })
cy = doc.y + 4
doc.fontSize(10).fillColor(COLORS.accent).font('Courier')
  .text('├─ → ╞═╡ → ║·║', closingX + 20, cy, { width: closingW - 40, align: 'center' })
cy = doc.y + 14
doc.fontSize(11).fillColor(COLORS.gold).font('Courier-Bold')
  .text('[ LEVEL UP ]', closingX + 20, cy, { width: closingW - 40, align: 'center' })

cy = doc.page.height - 100
hr(cy)
cy += 12
doc.fontSize(7.5).fillColor(COLORS.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(COLORS.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(COLORS.accent).font('Courier-Bold')
  .text('MASTER CODEX v11  ·  121 BADGES  ·  THE ARCADE OF SELF-CARE', 55, cy, { align: 'center', width: doc.page.width - 110 })

// ── FINALIZE ──────────────────────────────────────────────────────
doc.end()

stream.on('finish', () => {
  console.log('PDF generated: ' + OUT_FILE)
  const stats = fs.statSync(OUT_FILE)
  console.log('File size: ' + (stats.size / 1024).toFixed(1) + ' KB')
  console.log('Pages: 10')
})

stream.on('error', (err) => {
  console.error('PDF generation error:', err)
  process.exit(1)
})
