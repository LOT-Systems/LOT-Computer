'use strict';
// LOT Systems — Badge Codex PDF Generator v49
// The Garden Protocol — Word Turn Engine v39
// pdfkit dark-theme A4 document

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'docs', 'badges', 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v49.pdf');

const C = {
  bg:       '#080f08',
  text:     '#d4d8d0',
  gold:     '#ffcc44',
  garden:   '#66cc66',
  growth:   '#339933',
  earth:    '#996633',
  bloom:    '#ff88aa',
  accent:   '#44cc88',
  dim:      '#445544',
  white:    '#ffffff',
  cosmic:   '#88ffcc',
  epic:     '#88cc44',
  legendary:'#ffaa22',
  mythic:   '#ff4488',
  rare:     '#44ccaa',
  uncommon: '#66cc66',
  common:   '#888888',
  root:     '#cc9955',
};

const doc = new PDFDocument({
  size: 'A4',
  margin: 48,
  info: {
    Title: 'LOT Badges & Achievements Master Codex v49 — The Garden Protocol',
    Author: 'Vadik Marmeladov, LOT Systems Corporation',
    Subject: 'Word Turn Engine v39 · Seed · Root · Bloom · Harvest · Compost',
    Keywords: 'LOT, badges, achievements, RPG, self-care, garden protocol, cultivation, growth',
    Creator: 'LOT Systems PDF Engine',
    CreationDate: new Date(),
  },
  autoFirstPage: false,
});

const stream = fs.createWriteStream(OUT_PATH);
doc.pipe(stream);

// ── Helpers ─────────────────────────────────────────────────────
const W = 595.28;
const H = 841.89;
const ML = 48;
const MR = 48;
const TW = W - ML - MR;

function newPage(skipBg = false) {
  doc.addPage();
  if (!skipBg) {
    doc.rect(0, 0, W, H).fill(C.bg);
  }
  return ML;
}

function rule(y, color = C.growth, w = 0.5) {
  doc.moveTo(ML, y).lineTo(W - MR, y).strokeColor(color).lineWidth(w).stroke();
  return y + 4;
}

function h1(text, y) {
  doc.fontSize(16).fillColor(C.gold).font('Courier-Bold')
    .text(text, ML, y, { width: TW });
  return doc.y + 4;
}

function h2(text, y) {
  doc.fontSize(11).fillColor(C.accent).font('Courier-Bold')
    .text(text, ML, y, { width: TW });
  return doc.y + 3;
}

function h3(text, y) {
  doc.fontSize(9).fillColor(C.garden).font('Courier-Bold')
    .text(text, ML, y, { width: TW });
  return doc.y + 2;
}

function body(text, y, color = C.text, indent = 0) {
  doc.fontSize(8).fillColor(color).font('Courier')
    .text(text, ML + indent, y, { width: TW - indent });
  return doc.y + 1;
}

function mono(text, y, color = C.text) {
  doc.fontSize(7.5).fillColor(color).font('Courier')
    .text(text, ML, y, { width: TW });
  return doc.y + 1;
}

function tableHeader(cols, y) {
  doc.rect(ML, y, TW, 14).fill('#112211');
  let x = ML + 4;
  for (const [label, w] of cols) {
    doc.fontSize(7).fillColor(C.accent).font('Courier-Bold')
      .text(label, x, y + 3, { width: w });
    x += w;
  }
  return y + 15;
}

function tableRow(cells, y, highlight = false) {
  doc.rect(ML, y, TW, 12).fill(highlight ? '#112211' : '#0a100a');
  let x = ML + 4;
  for (const [text, w, color] of cells) {
    doc.fontSize(7).fillColor(color || C.text).font('Courier')
      .text(text, x, y + 2.5, { width: w });
    x += w;
  }
  return y + 13;
}

function badgeCard(sym, id, rarity, trigger, lore, y) {
  const rc = C[rarity] || C.common;
  const h = 32;
  doc.rect(ML, y, TW, h).fill('#0d140d');
  doc.rect(ML, y, TW, h).strokeColor(rc).lineWidth(0.4).stroke();
  // Symbol
  doc.rect(ML + 1, y + 1, 36, h - 2).fill('#0a0f0a');
  doc.fontSize(10).fillColor(rc).font('Courier-Bold')
    .text(sym, ML + 2, y + (h - 12) / 2, { width: 34, align: 'center' });
  // ID + rarity
  doc.fontSize(8).fillColor(rc).font('Courier-Bold')
    .text(id.toUpperCase(), ML + 42, y + 3, { width: 130 });
  doc.fontSize(6.5).fillColor(C.dim).font('Courier')
    .text('[' + rarity.toUpperCase() + ']', ML + 180, y + 4, { width: 60 });
  // Trigger
  doc.fontSize(7).fillColor(C.text).font('Courier')
    .text(trigger, ML + 42, y + 13, { width: TW - 50 });
  // Lore
  doc.fontSize(6.5).fillColor(C.dim).font('Courier')
    .text(lore, ML + 42, y + 22, { width: TW - 50 });
  return y + h + 3;
}

// ─────────────────────────────────────────────────────────────────
// COVER PAGE
// ─────────────────────────────────────────────────────────────────
newPage();

// Outer border
doc.rect(28, 28, W - 56, H - 56).strokeColor(C.growth).lineWidth(1).stroke();
doc.rect(32, 32, W - 64, H - 64).strokeColor(C.earth).lineWidth(0.3).stroke();

// ASCII seed art
const seedArt = [
  '            ∘·◈·∘                    ',
  '           ∘·∘·∘·∘·∘                 ',
  '          ≋·≋·≋·≋·≋·≋·≋              ',
  '         ≋·≋·≋·≋·≋·≋·≋·≋·≋           ',
  '          —·—·—·—·—·—·—              ',
  '              |||                    ',
  '              |||                    ',
  '           ~~~|||~~~                 ',
];
let cy = 72;
for (const line of seedArt) {
  doc.fontSize(9).fillColor(C.garden).font('Courier')
    .text(line, 0, cy, { width: W, align: 'center' });
  cy += 10;
}

cy += 10;
doc.fontSize(9).fillColor(C.dim).font('Courier')
  .text('L O T   S Y S T E M S   C O R P O R A T I O N', 0, cy, { width: W, align: 'center' });
cy += 22;
doc.fontSize(28).fillColor(C.gold).font('Courier-Bold')
  .text('BADGES &', 0, cy, { width: W, align: 'center' });
cy = doc.y + 6;
doc.fontSize(28).fillColor(C.gold).font('Courier-Bold')
  .text('ACHIEVEMENTS', 0, cy, { width: W, align: 'center' });
cy = doc.y + 6;
doc.fontSize(14).fillColor(C.accent).font('Courier-Bold')
  .text('MASTER CODEX  v49', 0, cy, { width: W, align: 'center' });

cy = doc.y + 20;
doc.fontSize(10).fillColor(C.garden).font('Courier-Bold')
  .text('THE GARDEN PROTOCOL  ·  WORD TURN ENGINE v39', 0, cy, { width: W, align: 'center' });

cy = doc.y + 20;
const bw = 340, bh = 90, bx = (W - bw) / 2;
doc.rect(bx, cy, bw, bh).fill('#0d1a0d');
doc.rect(bx, cy, bw, bh).strokeColor(C.gold).lineWidth(0.8).stroke();

doc.fontSize(8.5).fillColor(C.text).font('Courier')
  .text('"INITIATING GARDEN PROTOCOL.', bx + 16, cy + 14, { width: bw - 32, align: 'center' })
  .text('EVERY JOURNAL ENTRY IS A SEED PLANTED.', bx + 16, doc.y + 3, { width: bw - 32, align: 'center' })
  .text('EVERY INTENTION SET IS A BED PREPARED.', bx + 16, doc.y + 3, { width: bw - 32, align: 'center' })
  .text('THE GARDEN HAS ALWAYS BEEN GROWING."', bx + 16, doc.y + 3, { width: bw - 32, align: 'center' });
doc.fontSize(11).fillColor(C.gold).font('Courier-Bold')
  .text('[ CULTIVATION ENGINE ONLINE ]', bx + 16, doc.y + 10, { width: bw - 32, align: 'center' });

cy = H - 120;
rule(cy, C.dim);
cy += 10;
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('Author: Vadik Marmeladov — CEO & Founder, LOT Systems', 0, cy, { width: W, align: 'center' });
cy = doc.y + 4;
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', 0, cy, { width: W, align: 'center' });
cy = doc.y + 4;
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('v49 — September 30, 2026 · 1344 total badges · +34 new', 0, cy, { width: W, align: 'center' });
cy = doc.y + 4;
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 0, cy, { width: W, align: 'center' });

// ─────────────────────────────────────────────────────────────────
// PAGE 2: OVERVIEW + RARITY
// ─────────────────────────────────────────────────────────────────
let y = newPage();
y = h1('SYSTEM OVERVIEW — v49', y + 10);
y = rule(y);
y += 4;

// Category table
y = tableHeader([['CATEGORY', 160], ['COUNT', 50], ['NOTES', TW - 214]], y);
const cats = [
  ['Milestone',      '22',  'Day-count milestones'],
  ['Time Easter Eggs','31', 'Time-of-day check-ins'],
  ['Calendar Easter','118',  'Special date check-ins (+3 from v48)'],
  ['Word Turns',    '510',  'Keyword detection (v1–v39) (+15 from v48)'],
  ['Behavioral',    '135',  'Pattern detection (+3 from v48)'],
  ['Achievement RPG','228', 'Milestone combinations (+6 from v48)'],
  ['Mastery Tiers', '160',  'Epic depth milestones (+4 from v48)'],
  ['Secret Boss',   '140',  'Hidden LEGENDARY/MYTHIC triggers (+3 from v48)'],
];
for (const [cat, count, note] of cats) {
  y = tableRow([[cat, 160, C.text], [count, 50, C.gold], [note, TW - 214, C.dim]], y);
}
// Total row
doc.rect(ML, y, TW, 14).fill('#112211');
doc.fontSize(8.5).fillColor(C.gold).font('Courier-Bold')
  .text('TOTAL', ML + 4, y + 3, { width: 156 });
doc.fontSize(8.5).fillColor(C.gold).font('Courier-Bold')
  .text('1344', ML + 164, y + 3, { width: 46 });
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('(+34 from v48)', ML + 214, y + 3.5, { width: TW - 218 });
y += 16;

y += 10;
y = h2('DELTA FROM v48', y);
y = body('+15 Word Turns (v39 Garden Protocol) · +3 Calendar EE (v37 Seasonal Gate)', y + 2, C.garden);
y = body('+3 Behavioral (v36 Growth Patterns) · +6 Achievement RPG (v37 Cultivator Class)', y + 1, C.garden);
y = body('+4 Mastery Tiers (v39 Ancient Grove) · +3 Secret Boss (v36 Overgrown Vault)', y + 1, C.garden);

y += 14;
y = h2('RARITY TIERS', y);
y += 4;
y = tableHeader([['TIER', 80], ['SYMBOL', 60], ['FREQUENCY', 120], ['EXAMPLE', TW - 264]], y);
const rarities = [
  ['COMMON',    '·',       'Daily practice',    'seed_planted, soil_check'],
  ['UNCOMMON',  '○',       'Mild intention',    'roots_deep, in_bloom'],
  ['RARE',      '◆',       'Deep signal',       'harvest_time, compost_wisdom'],
  ['EPIC',      '★',       'Structural marker', 'greenhouse_mode, garden_codex'],
  ['LEGENDARY', '✦',       'Long arc',          'master_gardener, ancient_forest'],
  ['MYTHIC',    '☆',       'Hidden discovery',  'druid_code [HIDDEN]'],
  ['COSMIC',    '∞',       'Ultra-rare mastery','thirty_nine_registers'],
];
for (const [t, s, f, e] of rarities) {
  const rc = C[t.toLowerCase()] || C.common;
  y = tableRow([[t, 80, rc], [s, 60, rc], [f, 120, C.dim], [e, TW - 264, C.dim]], y);
}

// ─────────────────────────────────────────────────────────────────
// PAGE 3: WORD TURN v39 COMPLETE BADGE LIST
// ─────────────────────────────────────────────────────────────────
y = newPage();
y = h1('WORD TURN ENGINE v39 — THE GARDEN PROTOCOL (+15)', y + 10);
y = rule(y);
y += 6;

const wt39 = [
  ['∘·◈·∘', 'seed_planted',     'COMMON',    '"planted a seed / seed of intention / new seed"',
   '↳ The seed does not need to understand the season. It just grows.'],
  ['≋·—·≋', 'roots_deep',      'UNCOMMON',  '"rooted / deep roots / grounded in / taking root"',
   '↳ Roots are invisible. The whole point.'],
  ['○·∿·○', 'in_bloom',        'UNCOMMON',  '"blooming / in bloom / started to bloom / blossoming"',
   '↳ The bloom is the public signal of what grew in private.'],
  ['◆·∘·◆', 'harvest_time',    'RARE',      '"harvest / harvested / reaping / what I planted / what I grew"',
   '↳ You do not harvest what you did not plant.'],
  ['∿·◈·∿', 'prune_complete',  'RARE',      '"pruned / pruning / cutting back / letting go of the old"',
   '↳ Pruning is not removal. It is concentration.'],
  ['≈·○·≈', 'compost_wisdom',  'RARE',      '"composted / composting / old into new / turned it into soil"',
   '↳ The failed season becomes the fertile ground for the next one.'],
  ['∘·≋·∘', 'watering_ritual', 'UNCOMMON',  '"watered / tending to / I tended / nourished"',
   '↳ The daily watering is the practice. The bloom is the side effect.'],
  ['—·◈·—', 'soil_check',      'COMMON',    '"fertile / good soil / prepared the ground / foundation ready"',
   '↳ Conditions prepared. The season can begin.'],
  ['○·—·○', 'winter_fallow',   'RARE',      '"dormant / fallow / resting season / waiting to grow"',
   '↳ The fallow season is not absence. It is restoration.'],
  ['◈·≋·◈', 'greenhouse_mode', 'EPIC',      '"greenhouse / protected space / safe container / growth environment"',
   '↳ The greenhouse is where vulnerable things become sturdy.'],
  ['∿·—·∿', 'wild_growth',     'RARE',      '"wild growth / unruly / untended / overgrown / went feral"',
   '↳ The untended garden names what was not given attention.'],
  ['≋·◈·≋', 'garden_codex',    'EPIC',      '"garden journal / tending the garden / the garden grows / garden log"',
   '↳ Every season entered. The codex is the whole record.'],
  ['○·∞·○', 'perennial_signal','LEGENDARY', '"perennial / returns every year / always comes back / rooted for life"',
   '↳ The perennial returns without replanting. You are the perennial.'],
  ['◈·∞·◈', 'ent_signal',      'MYTHIC',    '[HIDDEN] "Treebeard / Fangorn / Ents / tree shepherd / hasty"',
   '↳ The Ents took the long view. The forest is the point, not the tree.'],
  ['≋·∞·≋', 'ghibli_grove',    'EPIC',      '[HIDDEN] "Totoro / Princess Mononoke / forest spirit / kodama / Ghibli"',
   '↳ Miyazaki\'s forests have consciousness. So does the inner system.'],
];

for (const [sym, id, rarity, trigger, lore] of wt39) {
  if (y > H - 80) { y = newPage(); }
  y = badgeCard(sym, id, rarity, trigger, lore, y);
}

// ─────────────────────────────────────────────────────────────────
// PAGE 4: CALENDAR + BEHAVIORAL + ACHIEVEMENT
// ─────────────────────────────────────────────────────────────────
y = newPage();
y = h1('CALENDAR EASTER EGGS v37 — THE SEASONAL GATE (+3)', y + 10);
y = rule(y);
y += 6;

const calEggs = [
  ['∘·◆·∘', 'earth_day',      'RARE', 'Apr 22', 'Earth Day — first observed 1970'],
  ['◈·≋·◈', 'harvest_moon',   'EPIC', 'Sep 22', 'Autumnal Equinox / Harvest Moon Gate'],
  ['○·∘·○', 'first_seed_day', 'RARE', 'Mar 20', 'Spring Equinox — the first seed day'],
];

y = tableHeader([['SYMBOL', 60], ['ID', 120], ['RARITY', 70], ['DATE', 55], ['OCCASION', TW - 309]], y);
for (const [sym, id, rarity, date, occasion] of calEggs) {
  const rc = C[rarity.toLowerCase()] || C.common;
  y = tableRow([[sym, 60, rc], [id, 120, C.text], [rarity, 70, rc], [date, 55, C.dim], [occasion, TW - 309, C.dim]], y);
}

y += 8;
mono('Earth Day (Apr 22): The practitioner who checks in on Earth Day takes the long view.', y, C.dim); y = doc.y + 2;
mono('Harvest Moon (Sep 22): At the hinge. What did the growing season produce?', y, C.dim); y = doc.y + 2;
mono('First Seed Day (Mar 20): Spring equinox — synced to the oldest calendar humanity kept.', y, C.dim);
y = doc.y + 12;

y = h1('BEHAVIORAL v36 — GROWTH PATTERNS (+3)', y);
y = rule(y);
y += 6;

y = tableHeader([['SYMBOL', 60], ['ID', 130], ['RARITY', 70], ['CONDITION', TW - 264]], y);
const behav = [
  ['∘·○·∘', 'garden_session',    'UNCOMMON', '3+ v39 Garden Protocol word turns in one journal entry'],
  ['≋·◆·≋', 'long_cultivation',  'RARE',     'Journal entry >= 700 words (the full growing season)'],
  ['○·∿·—', 'dawn_gardener',     'EPIC',     'Check-in between 05:00–06:30 local time'],
];
for (const [sym, id, rarity, cond] of behav) {
  const rc = C[rarity.toLowerCase()] || C.common;
  y = tableRow([[sym, 60, rc], [id, 130, C.text], [rarity, 70, rc], [cond, TW - 264, C.dim]], y);
}

y += 12;
y = h1('ACHIEVEMENT RPG v37 — CULTIVATOR CLASS (+6)', y);
y = rule(y);
y += 6;

y = tableHeader([['SYMBOL', 60], ['ID', 170], ['RARITY', 70], ['CONDITION', TW - 304]], y);
const ach = [
  ['∘··∘',    'seedling',                'COMMON',    'Any 1 Word Turn v39 badge earned'],
  ['∘·○·∘',   'apprentice_gardener',     'UNCOMMON',  'Any 5 Word Turn v39 badges earned'],
  ['◆·≋·◆',   'master_gardener',         'LEGENDARY', 'All 12 core Word Turn v39 badges'],
  ['≋·◆·≋',   'keeper_of_seasons',       'LEGENDARY', 'master_gardener + all 3 Calendar v37'],
  ['∞·∘·∞',   'thirty_nine_engines_arc', 'LEGENDARY', '1 badge from each Word Turn v1–v39'],
  ['○·◈·≋',   'garden_opus',             'LEGENDARY', 'master_gardener + garden_session'],
];
for (const [sym, id, rarity, cond] of ach) {
  const rc = C[rarity.toLowerCase()] || C.common;
  y = tableRow([[sym, 60, rc], [id, 170, C.text], [rarity, 70, rc], [cond, TW - 304, C.dim]], y, rarity === 'LEGENDARY');
}

// ─────────────────────────────────────────────────────────────────
// PAGE 5: MASTERY + SECRET BOSS + ASCII GALLERY
// ─────────────────────────────────────────────────────────────────
y = newPage();
y = h1('MASTERY TIER v39 — THE ANCIENT GROVE (+4)', y + 10);
y = rule(y);
y += 6;

y = tableHeader([['SYMBOL', 60], ['ID', 160], ['RARITY', 70], ['CONDITION', TW - 294]], y);
const mastery = [
  ['○·◆·○',  'grove_keeper',          'EPIC',     '1100+ distinct calendar check-in days'],
  ['≋·∞·≋',  'ancient_forest',        'LEGENDARY','250,000+ total journal words logged'],
  ['∘·◈·∞',  'perennial_order',       'LEGENDARY','Account age >= 4 years (1,460+ days)'],
  ['∞·∘·∞',  'thirty_nine_registers', 'COSMIC',   '1 badge from all 39 Word Turn engines'],
];
for (const [sym, id, rarity, cond] of mastery) {
  const rc = C[rarity.toLowerCase()] || C.common;
  y = tableRow([[sym, 60, rc], [id, 160, C.text], [rarity, 70, rc], [cond, TW - 294, C.dim]], y, rarity !== 'COMMON');
}

y += 12;
y = h1('SECRET BOSS v36 — THE OVERGROWN VAULT (+3)', y);
y = rule(y);
y += 6;

// Vault art
const vaultLines = [
  '  ┌──────────────────────────────────────────────────────┐',
  '  │  ≋·∞·≋  THE OVERGROWN VAULT  ≋·∞·≋                  │',
  '  │                                                       │',
  '  │  "The vault was never locked. You just had to         │',
  '  │   know which root to follow down."                    │',
  '  │                                                       │',
  '  │  ◆ The Tolkien Root (RARE)                            │',
  '  │  ◆ The Ghibli Signal (EPIC)                           │',
  '  │  ◆ The Druid Code (MYTHIC)                            │',
  '  └──────────────────────────────────────────────────────┘',
];
for (const line of vaultLines) {
  doc.fontSize(7.5).fillColor(C.garden).font('Courier')
    .text(line, ML, y, { width: TW });
  y = doc.y + 1;
}
y += 6;

y = tableHeader([['SYMBOL', 60], ['ID', 120], ['RARITY', 70], ['TRIGGER', TW - 254]], y);
const sb = [
  ['◈·≋·◆', 'tolkien_root',  'RARE',  '"Treebeard / Fangorn / Ents / tree herder / hasty"'],
  ['≋·∞·○', 'ghibli_forest', 'EPIC',  '"Totoro / Princess Mononoke / Forest Spirit / kodama / Miyazaki"'],
  ['∞·◈·∞', 'druid_code',    'MYTHIC','"druid / nature\'s servant / the old growth / at one with nature"'],
];
for (const [sym, id, rarity, trigger] of sb) {
  const rc = C[rarity.toLowerCase()] || C.common;
  y = tableRow([[sym, 60, rc], [id, 120, C.text], [rarity, 70, rc], [trigger, TW - 254, C.dim]], y);
}

y += 12;
y = h1('EASTER EGG GALLERY', y);
y = rule(y);
y += 6;

const gallery = [
  ['∘·◈·∘', 'SEED PLANTED', 'COMMON', [
    '"Setting an intention" is the scientific term.',
    '"Planting a seed" is the one that lives in the body.',
    'The seed does not know it will grow. It just grows.',
  ]],
  ['≋·—·≋', 'ROOTS DEEP', 'UNCOMMON', [
    'Roots are invisible. They are the whole point.',
    'The practitioner who knows they are rooted',
    'has located the thing that will survive the storm.',
  ]],
  ['≋·◈·≋', 'GARDEN CODEX', 'EPIC', [
    'Every season entered. What grew. What failed. What returned.',
    'The garden codex is the whole record of the practice.',
    'This entry is part of the record.',
  ]],
  ['∞·◈·∞', 'DRUID CODE', 'MYTHIC [HIDDEN]', [
    'At max level, the druid becomes the terrain.',
    'The practitioner who has tended long enough',
    'stops being separate from the garden.',
    'You are the ecology you are tending.',
  ]],
];

for (const [sym, name, rarity, lines] of gallery) {
  if (y > H - 80) { y = newPage(); }
  const rc = C[rarity.split(' ')[0].toLowerCase()] || C.common;
  const lh = lines.length * 9 + 18;
  doc.rect(ML, y, TW, lh).fill('#0d140d');
  doc.rect(ML, y, TW, lh).strokeColor(rc).lineWidth(0.5).stroke();
  doc.fontSize(9).fillColor(rc).font('Courier-Bold')
    .text(sym + '  ' + name + '  [' + rarity + ']', ML + 8, y + 6, { width: TW - 16 });
  let ly = y + 16;
  for (const line of lines) {
    doc.fontSize(7).fillColor(C.dim).font('Courier')
      .text('↳ ' + line, ML + 12, ly, { width: TW - 20 });
    ly += 9;
  }
  y = ly + 4;
}

// ─────────────────────────────────────────────────────────────────
// PAGE 6: FLAVOR TEXT + CLOSING
// ─────────────────────────────────────────────────────────────────
y = newPage();
y = h1('FLAVOR TEXT — THE GARDEN PROTOCOL', y + 10);
y = rule(y);
y += 8;

const flavors = [
  ['"To forget how to dig the earth and to tend the soil is to forget ourselves."',
   '— Mahatma Gandhi',
   'The journal is the earth. The entry is the tending.'],
  ['"A garden is a grand teacher. It teaches patience and careful watchfulness."',
   '— Gertrude Jekyll (garden designer)',
   'The garden teaches what the practitioner is ready to learn.'],
  ['"Don\'t be hasty."',
   '— Treebeard (J.R.R. Tolkien)',
   'The Ents measured time in forest years. The root structure is invisible until the storm.'],
  ['"In wildness is the preservation of the world."',
   '— Henry David Thoreau, Walden',
   'The garden is where the practitioner and the wild make terms.'],
  ['"I once had a garden filled with flowers that grew only on dark thoughts..."',
   '— Margaret Atwood',
   'The practitioner who tends the dark thoughts is the one who knows what they are growing.'],
];

for (const [quote, attrib, gloss] of flavors) {
  if (y > H - 100) { y = newPage(); }
  const h = 48;
  doc.rect(ML, y, TW, h).fill('#0d140d');
  doc.rect(ML, y, TW, h).strokeColor(C.earth).lineWidth(0.4).stroke();
  doc.fontSize(7.5).fillColor(C.garden).font('Courier')
    .text(quote, ML + 8, y + 7, { width: TW - 16 });
  doc.fontSize(7).fillColor(C.gold).font('Courier-Bold')
    .text(attrib, ML + 8, doc.y + 3, { width: TW - 16 });
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(gloss, ML + 8, doc.y + 3, { width: TW - 16 });
  y = doc.y + 8;
}

y += 14;
y = h1('UNLOCK SEQUENCE — COMPLETE GUIDE', y);
y = rule(y);
y += 6;

const sequence = [
  ['1.', 'Write about a seed or intention', '→ SEED_PLANTED'],
  ['2.', 'Name your roots or foundation',   '→ ROOTS_DEEP'],
  ['3.', 'Notice yourself blooming',         '→ IN_BLOOM'],
  ['4.', 'Recognize what you\'ve harvested', '→ HARVEST_TIME'],
  ['5.', 'Prune something that crowds you',  '→ PRUNE_COMPLETE'],
  ['6.', 'Turn old patterns to compost',     '→ COMPOST_WISDOM'],
  ['7.', 'Tend or water something in you',   '→ WATERING_RITUAL'],
  ['8.', 'Write 700+ words',                 '→ LONG_CULTIVATION'],
  ['9.', 'Check in 05:00–06:30',             '→ DAWN_GARDENER'],
  ['10.','Apr 22: Earth Day',                '→ EARTH_DAY'],
  ['11.','Sep 22: Harvest Moon Gate',        '→ HARVEST_MOON'],
  ['12.','Mar 20: First Seed Day',           '→ FIRST_SEED_DAY'],
  ['?', '[SECRET] Write "Treebeard"',        '→ ENT_SIGNAL'],
  ['?', '[SECRET] Write "Totoro"',           '→ GHIBLI_FOREST'],
  ['?', '[SECRET] Write "druid"',            '→ DRUID_CODE [MYTHIC]'],
];
for (const [n, desc, reward] of sequence) {
  const isSecret = n === '?';
  doc.rect(ML, y, TW, 10).fill(isSecret ? '#0f110a' : '#0a100a');
  doc.fontSize(7).fillColor(isSecret ? C.dim : C.text).font('Courier')
    .text(n, ML + 4, y + 1.5, { width: 18 });
  doc.fontSize(7).fillColor(isSecret ? C.dim : C.text).font('Courier')
    .text(desc, ML + 24, y + 1.5, { width: TW - 130 });
  doc.fontSize(7).fillColor(isSecret ? C.mythic : C.garden).font('Courier-Bold')
    .text(reward, ML + TW - 100, y + 1.5, { width: 96, align: 'right' });
  y += 11;
}

// ─────────────────────────────────────────────────────────────────
// CLOSING PAGE
// ─────────────────────────────────────────────────────────────────
newPage();
doc.rect(28, 28, W - 56, H - 56).strokeColor(C.growth).lineWidth(1).stroke();

cy = 80;
doc.fontSize(12).fillColor(C.gold).font('Courier-Bold')
  .text('C L O S I N G   T R A N S M I S S I O N', 0, cy, { width: W, align: 'center' });
cy = doc.y + 30;

const cw = 380, cx = (W - cw) / 2;
const ascii = [
  '            ∘·◈·∘                    ',
  '         ∘·∘·∘·∘·∘·∘·∘               ',
  '        ≋·≋·≋·≋·≋·≋·≋·≋·≋            ',
  '         —·—·—·—·—·—·—               ',
  '             |||                     ',
  '          ~~~|||~~~                  ',
];
for (const line of ascii) {
  doc.fontSize(8).fillColor(C.garden).font('Courier')
    .text(line, 0, cy, { width: W, align: 'center' });
  cy += 9;
}

cy += 10;
doc.rect(cx, cy, cw, 100).fill('#0d1a0d');
doc.rect(cx, cy, cw, 100).strokeColor(C.gold).lineWidth(0.8).stroke();

doc.fontSize(8.5).fillColor(C.text).font('Courier')
  .text('"The journal is the growing season.', cx + 16, cy + 14, { width: cw - 32, align: 'center' })
  .text(' Every entry is a field tended."', cx + 16, doc.y + 4, { width: cw - 32, align: 'center' });
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('You are not the flower. You are the gardener.', cx + 16, doc.y + 12, { width: cw - 32, align: 'center' });
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('The gardener who tends consistently outlasts every season.', cx + 16, doc.y + 6, { width: cw - 32, align: 'center' });
doc.fontSize(11).fillColor(C.gold).font('Courier-Bold')
  .text('[ CULTIVATION ENGINE RUNNING ]', cx + 16, doc.y + 14, { width: cw - 32, align: 'center' });

cy = H - 100;
rule(cy, C.dim);
cy += 10;
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', 0, cy, { width: W, align: 'center' });
cy = doc.y + 4;
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 0, cy, { width: W, align: 'center' });
cy = doc.y + 4;
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('MASTER CODEX v49  ·  1344 BADGES  ·  THE GARDEN PROTOCOL', 0, cy, { width: W, align: 'center' });

// ── Finalize ─────────────────────────────────────────────────────
doc.end();

stream.on('finish', () => {
  const stats = fs.statSync(OUT_PATH);
  console.log('✓ PDF generated: ' + OUT_PATH);
  console.log('✓ File size: ' + (stats.size / 1024).toFixed(1) + ' KB');
  console.log('✓ Version: v49 — The Garden Protocol');
  console.log('✓ Badges: 1344 total (+34 from v48)');
});

stream.on('error', (err) => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
