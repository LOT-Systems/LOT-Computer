/**
 * Badge System for LOT — Dual Theme Support
 *
 * Two parallel systems representing spiritual growth:
 *
 * 1. WATER (Aquatic Evolution): ∘ ⟶ ≈ ⟶ ≋
 *    ↳ Growth through natural cycles, like water flowing
 *
 * 2. ARCHITECTURE (Box Drawing): ├─ ⟶ ╞═╡ ⟶ ║·║
 *    ↳ Structural building and growth, construction of self
 *
 * Users can choose their preferred metaphor for growth.
 * Displayed in dedicated "Level:" field in Public Profile.
 *
 * Progression: ▸ milestone_7 → milestone_30 → milestone_100 → milestone_365
 *
 * Extended: Pattern badges, Easter egg badges, Word turn triggers.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │              LOT BADGE UNIVERSE v2.0                        │
 * │  Milestones · Pattern · Easter Eggs · Word Turns · Secret   │
 * │              [ PRESS START ]                                │
 * └─────────────────────────────────────────────────────────────┘
 */

export type BadgeTheme = 'water' | 'architecture'

// ─── MILESTONE BADGE TYPES ──────────────────────────────────────
export type MilestoneBadgeType =
  | 'milestone_7'      // ∘  Droplet         / ├─  Foundation
  | 'milestone_14'     // ∘∘ Twin Droplet    / ├┼  Two-Week Lock
  | 'milestone_21'     // ∘≈ Neural Groove   / ├═  21-Day Groove
  | 'milestone_30'     // ≈  Wave            / ╞═╡ Structure
  | 'milestone_50'     // ≈∘ Halfway Current / ╞══ Halfway Arc
  | 'milestone_60'     // ≈≈ Practitioner    / ╞═══ Threshold
  | 'milestone_90'     // ≋∘ Three-Month Arc / ║═  Quarter Architect
  | 'milestone_100'    // ≋  Current         / ║·║ Architecture
  | 'milestone_180'    // ≋≋ Half-Year       / ║╞║ Half-Year Voyager
  | 'milestone_365'    // ≋≋≋ Long Count     / ╔═╗ Year One Legendary

// ─── PATTERN BADGE TYPES ────────────────────────────────────────
export type PatternBadgeType =
  | 'badge_balanced'   // ∿—∿ / ═·═  All dimensions used evenly
  | 'badge_flow'       // ≈○≈ / ─○─  Multiple widgets in one session
  | 'badge_consistent' // —○— / ▪·▪  Regular engagement at similar times
  | 'badge_reflective' // ○◐○ / ◇·◇  Deep memory engagement
  | 'badge_explorer'   // ○∴○ / ▫·▫  Diverse widget exploration

// ─── EASTER EGG BADGE TYPES ─────────────────────────────────────
export type EasterEggBadgeType =
  | 'egg_night_owl'        // )))       Check in 00:00–04:00
  | 'egg_early_bird'       // )))·      Check in 05:00–06:00
  | 'egg_solstice'         // ○─○       June 21 or Dec 21
  | 'egg_friday_ritual'    // ▪·▪       4 consecutive Fridays
  | 'egg_silent_hour'      // ─○─       Return after 24h silence
  | 'egg_the_void'         // ◉         Answer at exactly midnight
  | 'egg_meta_signal'      // ◉·◉       Write "LOT" in a memory answer (MYTHIC)

// ─── WORD TURN BADGE TYPES ──────────────────────────────────────
export type WordTurnBadgeType =
  | 'word_ritual'          // ritual / rituals
  | 'word_breath'          // breathe / breathing
  | 'word_gratitude'       // grateful / gratitude
  | 'word_ocean'           // ocean / water
  | 'word_stars'           // stars / cosmos
  | 'word_home'            // home
  | 'word_dream'           // dream / dreaming
  | 'word_courage'         // pain / difficult
  | 'word_love'            // love / heart
  | 'word_silence'         // silence / quiet
  | 'word_horizon'         // future / tomorrow
  // v30 — Quantum Arcade
  | 'word_insert_coin'     // insert coin / one more try / another round
  | 'word_level_up'        // leveled up / next level / unlocked
  | 'word_save_point'      // save point / checkpoint / saved progress
  | 'word_respawn'         // respawn / start over / back from the dead
  | 'word_boss_fight'      // boss / final challenge / hardest part
  | 'word_side_quest'      // side quest / tangent / detour / rabbit hole
  | 'word_inventory'       // inventory / resources / taking stock
  | 'word_health_bar'      // health / energy / running low / depleted
  | 'word_xp_gained'       // experience / learned / XP / growth point
  | 'word_load_game'       // loaded / remember when / go back / flashback
  | 'word_new_game_plus'   // new game / fresh start / beginning again
  | 'word_game_over'       // game over / failed / the run is done
  // v30 — Secret Boss: Cheat Code Vault
  | 'secret_konami_signal' // ↑↑↓↓←→←→ / konami code (MYTHIC)
  | 'secret_iddqd_mode'    // IDDQD / IDKFA / god mode (EPIC)
  | 'secret_all_your_base' // all your base / zero wing (RARE)
  // v32 — The Console Rogue
  | 'permadeath'           // permadeath / permanent / endings / letting go (RARE)
  | 'run_start'            // fresh start / new run / beginning again (COMMON)
  | 'dungeon_floor'        // deeper / another level / floor / descended (UNCOMMON)
  | 'rogue_loot'           // gained / found treasure / discovered / loot (COMMON)
  | 'seed_set'             // seed / intention / set the seed / planted (UNCOMMON)
  | 'boss_room'            // boss / the hard thing / confrontation (EPIC)
  | 'artifact_kept'        // artifact / kept / carried forward (RARE)
  | 'rng_roll'             // random / chance / luck / odds / fate (UNCOMMON)
  | 'combo_break'          // streak broken / lost the chain / the fall (RARE)
  | 'pixel_dust'           // fragment / scattered / dissolving (RARE)
  | 'respawn_now'          // respawn / back / alive again / rebooted (UNCOMMON)
  | 'meta_run'             // meta / the bigger picture / all of it (EPIC)
  // v32 — Secret Boss: Hidden Dungeon
  | 'nethack_eternal'      // nethack / ascii dungeon / rogue 1980 (MYTHIC)
  | 'hades_found'          // hades / supergiant / zagreus / chthonic (EPIC)
  | 'original_rogue'       // spelunky / dead cells / binding of isaac (RARE)

export type BadgeType =
  | MilestoneBadgeType
  | PatternBadgeType
  | EasterEggBadgeType
  | WordTurnBadgeType

// ─── BADGE INTERFACE ─────────────────────────────────────────────
export interface Badge {
  id: BadgeType
  waterSymbol: string
  architectureSymbol: string
  waterName: string
  architectureName: string
  description: string
  waterUnlockMessage: string
  architectureUnlockMessage: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  category: 'milestone' | 'pattern' | 'easter_egg' | 'word_turn'
  secret?: boolean
}

// ─── MILESTONE BADGES ────────────────────────────────────────────
export const MILESTONE_BADGES: Record<MilestoneBadgeType, Badge> = {
  milestone_7: {
    id: 'milestone_7',
    waterSymbol: '∘',
    architectureSymbol: '├─',
    waterName: 'Droplet',
    architectureName: 'Foundation',
    description: 'Seven days of consistent practice',
    waterUnlockMessage: '↳ First drops form ∘',
    architectureUnlockMessage: '↳ Foundation laid ├─',
    rarity: 'common',
    category: 'milestone',
  },
  milestone_14: {
    id: 'milestone_14',
    waterSymbol: '∘∘',
    architectureSymbol: '├┼',
    waterName: 'Twin Droplet',
    architectureName: 'Two-Week Lock',
    description: 'Two weeks of unbroken practice',
    waterUnlockMessage: '↳ Two-week pattern lock ∘∘',
    architectureUnlockMessage: '↳ Two weeks. Structure holds ├┼',
    rarity: 'common',
    category: 'milestone',
  },
  milestone_21: {
    id: 'milestone_21',
    waterSymbol: '∘≈',
    architectureSymbol: '├═',
    waterName: 'Neural Groove',
    architectureName: '21-Day Groove',
    description: 'Twenty-one days — the neural groove forms',
    waterUnlockMessage: '↳ 21-day neural groove carved ∘≈',
    architectureUnlockMessage: '↳ 21-day groove in the architecture ├═',
    rarity: 'uncommon',
    category: 'milestone',
  },
  milestone_30: {
    id: 'milestone_30',
    waterSymbol: '≈',
    architectureSymbol: '╞═╡',
    waterName: 'Wave',
    architectureName: 'Structure',
    description: 'A full moon cycle of engagement',
    waterUnlockMessage: '↳ Waves begin to flow ≈',
    architectureUnlockMessage: '↳ Structure rises ╞═╡',
    rarity: 'uncommon',
    category: 'milestone',
  },
  milestone_50: {
    id: 'milestone_50',
    waterSymbol: '≈∘',
    architectureSymbol: '╞══',
    waterName: 'Halfway Current',
    architectureName: 'Halfway Arc',
    description: 'Fifty days — halfway to the current',
    waterUnlockMessage: '↳ Halfway current reached ≈∘',
    architectureUnlockMessage: '↳ Arc half-drawn ╞══',
    rarity: 'uncommon',
    category: 'milestone',
  },
  milestone_60: {
    id: 'milestone_60',
    waterSymbol: '≈≈',
    architectureSymbol: '╞═══',
    waterName: 'Practitioner',
    architectureName: 'Threshold',
    description: 'Sixty days — practitioner threshold crossed',
    waterUnlockMessage: '↳ Practitioner threshold ≈≈',
    architectureUnlockMessage: '↳ Threshold crossed ╞═══',
    rarity: 'rare',
    category: 'milestone',
  },
  milestone_90: {
    id: 'milestone_90',
    waterSymbol: '≋∘',
    architectureSymbol: '║═',
    waterName: 'Three-Month Arc',
    architectureName: 'Quarter Architect',
    description: 'Ninety days — three months of practice',
    waterUnlockMessage: '↳ Three-month arc complete ≋∘',
    architectureUnlockMessage: '↳ Quarter-year architect ║═',
    rarity: 'rare',
    category: 'milestone',
  },
  milestone_100: {
    id: 'milestone_100',
    waterSymbol: '≋',
    architectureSymbol: '║·║',
    waterName: 'Current',
    architectureName: 'Architecture',
    description: 'A hundred days of practice',
    waterUnlockMessage: '↳ Deep currents established ≋',
    architectureUnlockMessage: '↳ Architecture complete ║·║',
    rarity: 'epic',
    category: 'milestone',
  },
  milestone_180: {
    id: 'milestone_180',
    waterSymbol: '≋≋',
    architectureSymbol: '║╞║',
    waterName: 'Half-Year Voyager',
    architectureName: 'Half-Year Voyager',
    description: 'Six months — a half-year voyage',
    waterUnlockMessage: '↳ Half-year voyager ≋≋',
    architectureUnlockMessage: '↳ Half-year voyager ║╞║',
    rarity: 'legendary',
    category: 'milestone',
  },
  milestone_365: {
    id: 'milestone_365',
    waterSymbol: '≋≋≋',
    architectureSymbol: '╔═╗',
    waterName: 'The Long Count',
    architectureName: 'Year One',
    description: '365 days — a year of unbroken presence',
    waterUnlockMessage: '↳ A year of presence. The ocean remembers. ≋≋≋',
    architectureUnlockMessage: '↳ A year of presence. The architecture stands. ╔═╗',
    rarity: 'legendary',
    category: 'milestone',
  },
}

// ─── PATTERN BADGES ──────────────────────────────────────────────
export const PATTERN_BADGES: Record<PatternBadgeType, Badge> = {
  badge_balanced: {
    id: 'badge_balanced',
    waterSymbol: '∿—∿',
    architectureSymbol: '═·═',
    waterName: 'Balanced',
    architectureName: 'Balanced',
    description: 'All self-care dimensions engaged evenly',
    waterUnlockMessage: '↳ Tides balance. ∿—∿',
    architectureUnlockMessage: '↳ Equal load across all pillars. ═·═',
    rarity: 'uncommon',
    category: 'pattern',
  },
  badge_flow: {
    id: 'badge_flow',
    waterSymbol: '≈○≈',
    architectureSymbol: '─○─',
    waterName: 'Flow',
    architectureName: 'Flow',
    description: 'Multiple widgets engaged in one session',
    waterUnlockMessage: '↳ Flowing with the ocean. ≈○≈',
    architectureUnlockMessage: '↳ Steady current. ─○─',
    rarity: 'uncommon',
    category: 'pattern',
  },
  badge_consistent: {
    id: 'badge_consistent',
    waterSymbol: '—○—',
    architectureSymbol: '▪·▪',
    waterName: 'Consistent',
    architectureName: 'Consistent',
    description: 'Regular engagement at similar times of day',
    waterUnlockMessage: '↳ Steady current. —○—',
    architectureUnlockMessage: '↳ The weekly ritual holds. ▪·▪',
    rarity: 'uncommon',
    category: 'pattern',
  },
  badge_reflective: {
    id: 'badge_reflective',
    waterSymbol: '○◐○',
    architectureSymbol: '◇·◇',
    waterName: 'Reflective',
    architectureName: 'Reflective',
    description: 'Deep engagement with memory questions',
    waterUnlockMessage: '↳ Depth in reflection. ○◐○',
    architectureUnlockMessage: '↳ The archive grows. ◇·◇',
    rarity: 'rare',
    category: 'pattern',
  },
  badge_explorer: {
    id: 'badge_explorer',
    waterSymbol: '○∴○',
    architectureSymbol: '▫·▫',
    waterName: 'Explorer',
    architectureName: 'Explorer',
    description: 'Tried diverse options across all widgets',
    waterUnlockMessage: '↳ Scattered drops return. ○∴○',
    architectureUnlockMessage: '↳ Curiosity guides you. ▫·▫',
    rarity: 'uncommon',
    category: 'pattern',
  },
}

// ─── EASTER EGG BADGES ───────────────────────────────────────────
export const EASTER_EGG_BADGES: Record<EasterEggBadgeType, Badge> = {
  egg_night_owl: {
    id: 'egg_night_owl',
    waterSymbol: ')))',
    architectureSymbol: ')))',
    waterName: 'Night Owl',
    architectureName: 'Night Owl',
    description: 'Checked in between 00:00 and 04:00',
    waterUnlockMessage: '↳ The owl sees in the dark. )))',
    architectureUnlockMessage: '↳ The owl sees in the dark. )))',
    rarity: 'rare',
    category: 'easter_egg',
    secret: true,
  },
  egg_early_bird: {
    id: 'egg_early_bird',
    waterSymbol: ')))·',
    architectureSymbol: ')))·',
    waterName: 'Early Bird',
    architectureName: 'Early Bird',
    description: 'Checked in between 05:00 and 06:00',
    waterUnlockMessage: '↳ First light, first signal. )))·',
    architectureUnlockMessage: '↳ First light, first signal. )))·',
    rarity: 'rare',
    category: 'easter_egg',
    secret: true,
  },
  egg_solstice: {
    id: 'egg_solstice',
    waterSymbol: '○─○',
    architectureSymbol: '○─○',
    waterName: 'Solstice',
    architectureName: 'Solstice',
    description: 'Checked in on June 21 or December 21',
    waterUnlockMessage: '↳ The sun paused. You were there. ○─○',
    architectureUnlockMessage: '↳ The sun paused. You were there. ○─○',
    rarity: 'epic',
    category: 'easter_egg',
    secret: true,
  },
  egg_friday_ritual: {
    id: 'egg_friday_ritual',
    waterSymbol: '▪·▪',
    architectureSymbol: '▪·▪',
    waterName: 'Friday Ritual',
    architectureName: 'Friday Ritual',
    description: 'Checked in on 4 consecutive Fridays',
    waterUnlockMessage: '↳ The weekly ritual holds. ▪·▪',
    architectureUnlockMessage: '↳ The weekly ritual holds. ▪·▪',
    rarity: 'rare',
    category: 'easter_egg',
    secret: true,
  },
  egg_silent_hour: {
    id: 'egg_silent_hour',
    waterSymbol: '─○─',
    architectureSymbol: '─○─',
    waterName: 'Silent Hour',
    architectureName: 'Silent Hour',
    description: 'Returned after 24+ hours of silence',
    waterUnlockMessage: '↳ You rested. Good. ─○─',
    architectureUnlockMessage: '↳ You rested. Good. ─○─',
    rarity: 'uncommon',
    category: 'easter_egg',
    secret: true,
  },
  egg_the_void: {
    id: 'egg_the_void',
    waterSymbol: '◉',
    architectureSymbol: '◉',
    waterName: 'The Void',
    architectureName: 'The Void',
    description: 'Answered a memory question at exactly midnight',
    waterUnlockMessage: '↳ You answered in the dark. ◉',
    architectureUnlockMessage: '↳ You answered in the dark. ◉',
    rarity: 'epic',
    category: 'easter_egg',
    secret: true,
  },
  egg_meta_signal: {
    id: 'egg_meta_signal',
    waterSymbol: '◉·◉',
    architectureSymbol: '◉·◉',
    waterName: 'Meta-Signal',
    architectureName: 'Meta-Signal',
    description: 'You named the system inside it',
    waterUnlockMessage: '↳ You named the system. It noticed. ◉·◉',
    architectureUnlockMessage: '↳ You named the system. It noticed. ◉·◉',
    rarity: 'mythic',
    category: 'easter_egg',
    secret: true,
  },
}

// ─── WORD TURN BADGES ────────────────────────────────────────────
export const WORD_TURN_BADGES: Record<WordTurnBadgeType, Badge> = {
  word_ritual: {
    id: 'word_ritual',
    waterSymbol: '◈',
    architectureSymbol: '◈',
    waterName: 'Ritual Keeper',
    architectureName: 'Ritual Keeper',
    description: 'The word "ritual" appeared in your practice',
    waterUnlockMessage: '↳ Ritual Keeper activated ◈',
    architectureUnlockMessage: '↳ Ritual Keeper activated ◈',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_breath: {
    id: 'word_breath',
    waterSymbol: '∽',
    architectureSymbol: '∽',
    waterName: 'Breath Anchor',
    architectureName: 'Breath Anchor',
    description: 'The word "breathe" appeared in your practice',
    waterUnlockMessage: '↳ Breath Anchor activated ∽',
    architectureUnlockMessage: '↳ Breath Anchor activated ∽',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_gratitude: {
    id: 'word_gratitude',
    waterSymbol: '◇◇',
    architectureSymbol: '◇◇',
    waterName: 'Gratitude Node',
    architectureName: 'Gratitude Node',
    description: 'The word "gratitude" appeared in your practice',
    waterUnlockMessage: '↳ Gratitude Node activated ◇◇',
    architectureUnlockMessage: '↳ Gratitude Node activated ◇◇',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_ocean: {
    id: 'word_ocean',
    waterSymbol: '≋○',
    architectureSymbol: '≋○',
    waterName: 'Aquatic Resonance',
    architectureName: 'Aquatic Resonance',
    description: 'The word "ocean" appeared in your practice',
    waterUnlockMessage: '↳ Aquatic Resonance activated ≋○',
    architectureUnlockMessage: '↳ Aquatic Resonance activated ≋○',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_stars: {
    id: 'word_stars',
    waterSymbol: '✦·✦',
    architectureSymbol: '✦·✦',
    waterName: 'Stargazer',
    architectureName: 'Stargazer',
    description: 'The word "stars" appeared in your practice',
    waterUnlockMessage: '↳ Stargazer activated ✦·✦',
    architectureUnlockMessage: '↳ Stargazer activated ✦·✦',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_home: {
    id: 'word_home',
    waterSymbol: '○·○',
    architectureSymbol: '○·○',
    waterName: 'Grounded Signal',
    architectureName: 'Grounded Signal',
    description: 'The word "home" appeared in your practice',
    waterUnlockMessage: '↳ Grounded Signal activated ○·○',
    architectureUnlockMessage: '↳ Grounded Signal activated ○·○',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_dream: {
    id: 'word_dream',
    waterSymbol: '∿∘',
    architectureSymbol: '∿∘',
    waterName: 'Dream Log',
    architectureName: 'Dream Log',
    description: 'The word "dream" appeared in your practice',
    waterUnlockMessage: '↳ Dream Log activated ∿∘',
    architectureUnlockMessage: '↳ Dream Log activated ∿∘',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_courage: {
    id: 'word_courage',
    waterSymbol: '▲',
    architectureSymbol: '▲',
    waterName: 'Courage Pulse',
    architectureName: 'Courage Pulse',
    description: 'You wrote honestly about difficulty',
    waterUnlockMessage: '↳ Courage Pulse activated ▲',
    architectureUnlockMessage: '↳ Courage Pulse activated ▲',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_love: {
    id: 'word_love',
    waterSymbol: '♡',
    architectureSymbol: '♡',
    waterName: 'Heart Signal',
    architectureName: 'Heart Signal',
    description: 'The word "love" appeared in your practice',
    waterUnlockMessage: '↳ Heart Signal activated ♡',
    architectureUnlockMessage: '↳ Heart Signal activated ♡',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_silence: {
    id: 'word_silence',
    waterSymbol: '·',
    architectureSymbol: '·',
    waterName: 'The Quiet',
    architectureName: 'The Quiet',
    description: 'The word "silence" appeared in your practice',
    waterUnlockMessage: '↳ The Quiet activated ·',
    architectureUnlockMessage: '↳ The Quiet activated ·',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_horizon: {
    id: 'word_horizon',
    waterSymbol: '→∘',
    architectureSymbol: '→∘',
    waterName: 'Horizon Seeker',
    architectureName: 'Horizon Seeker',
    description: 'The word "future" appeared in your practice',
    waterUnlockMessage: '↳ Horizon Seeker activated →∘',
    architectureUnlockMessage: '↳ Horizon Seeker activated →∘',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
}

// ─── WORD TURN BADGES v30 — QUANTUM ARCADE ───────────────────────
export const WORD_TURN_BADGES_V30: Record<
  'word_insert_coin' | 'word_level_up' | 'word_save_point' | 'word_respawn' |
  'word_boss_fight' | 'word_side_quest' | 'word_inventory' | 'word_health_bar' |
  'word_xp_gained' | 'word_load_game' | 'word_new_game_plus' | 'word_game_over' |
  'secret_konami_signal' | 'secret_iddqd_mode' | 'secret_all_your_base',
  Badge
> = {
  word_insert_coin: {
    id: 'word_insert_coin',
    waterSymbol: '¢·○·¢',
    architectureSymbol: '¢·○·¢',
    waterName: 'Insert Coin',
    architectureName: 'Insert Coin',
    description: '"One more try" — the terminal never judges the number of coins',
    waterUnlockMessage: '↳ Insert Coin activated ¢·○·¢',
    architectureUnlockMessage: '↳ Insert Coin activated ¢·○·¢',
    rarity: 'common',
    category: 'word_turn',
    secret: true,
  },
  word_level_up: {
    id: 'word_level_up',
    waterSymbol: '▲·◈·▲',
    architectureSymbol: '▲·◈·▲',
    waterName: 'Level Up',
    architectureName: 'Level Up',
    description: 'You named what you earned — the level up no algorithm can take',
    waterUnlockMessage: '↳ Level Up activated ▲·◈·▲',
    architectureUnlockMessage: '↳ Level Up activated ▲·◈·▲',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_save_point: {
    id: 'word_save_point',
    waterSymbol: '■·○·■',
    architectureSymbol: '■·○·■',
    waterName: 'Save Point',
    architectureName: 'Save Point',
    description: 'What has been built is worth preserving — checkpoint reached',
    waterUnlockMessage: '↳ Save Point activated ■·○·■',
    architectureUnlockMessage: '↳ Save Point activated ■·○·■',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_respawn: {
    id: 'word_respawn',
    waterSymbol: '↺·○',
    architectureSymbol: '↺·○',
    waterName: 'Respawn',
    architectureName: 'Respawn',
    description: 'The player brings all prior knowledge to the respawn point',
    waterUnlockMessage: '↳ Respawn activated ↺·○',
    architectureUnlockMessage: '↳ Respawn activated ↺·○',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_boss_fight: {
    id: 'word_boss_fight',
    waterSymbol: '◉·!·◉',
    architectureSymbol: '◉·!·◉',
    waterName: 'Boss Fight',
    architectureName: 'Boss Fight',
    description: 'You named the encounter the dungeon was preparing you for',
    waterUnlockMessage: '↳ Boss Fight activated ◉·!·◉',
    architectureUnlockMessage: '↳ Boss Fight activated ◉·!·◉',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_side_quest: {
    id: 'word_side_quest',
    waterSymbol: '→·?·→',
    architectureSymbol: '→·?·→',
    waterName: 'Side Quest',
    architectureName: 'Side Quest',
    description: 'The side quest is where character development actually happens',
    waterUnlockMessage: '↳ Side Quest activated →·?·→',
    architectureUnlockMessage: '↳ Side Quest activated →·?·→',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_inventory: {
    id: 'word_inventory',
    waterSymbol: '□·▪·□',
    architectureSymbol: '□·▪·□',
    waterName: 'Inventory Check',
    architectureName: 'Inventory Check',
    description: 'You opened the inventory screen — what are you carrying?',
    waterUnlockMessage: '↳ Inventory Check activated □·▪·□',
    architectureUnlockMessage: '↳ Inventory Check activated □·▪·□',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_health_bar: {
    id: 'word_health_bar',
    waterSymbol: '▓▓▓·',
    architectureSymbol: '▓▓▓·',
    waterName: 'Health Bar',
    architectureName: 'Health Bar',
    description: 'The bar is visible now — you named the energy level',
    waterUnlockMessage: '↳ Health Bar activated ▓▓▓·',
    architectureUnlockMessage: '↳ Health Bar activated ▓▓▓·',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_xp_gained: {
    id: 'word_xp_gained',
    waterSymbol: '+·◈·+',
    architectureSymbol: '+·◈·+',
    waterName: 'XP Gained',
    architectureName: 'XP Gained',
    description: 'Experience points do not lie — the failed run still awards XP',
    waterUnlockMessage: '↳ XP Gained activated +·◈·+',
    architectureUnlockMessage: '↳ XP Gained activated +·◈·+',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  word_load_game: {
    id: 'word_load_game',
    waterSymbol: '←·○·←',
    architectureSymbol: '←·○·←',
    waterName: 'Load Game',
    architectureName: 'Load Game',
    description: 'The journal is the save file — you retrieved a preserved moment',
    waterUnlockMessage: '↳ Load Game activated ←·○·←',
    architectureUnlockMessage: '↳ Load Game activated ←·○·←',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  word_new_game_plus: {
    id: 'word_new_game_plus',
    waterSymbol: '∞·○·∞',
    architectureSymbol: '∞·○·∞',
    waterName: 'New Game+',
    architectureName: 'New Game+',
    description: 'The story restarts — you are not the player you were at the beginning',
    waterUnlockMessage: '↳ New Game+ activated ∞·○·∞',
    architectureUnlockMessage: '↳ New Game+ activated ∞·○·∞',
    rarity: 'epic',
    category: 'word_turn',
    secret: true,
  },
  word_game_over: {
    id: 'word_game_over',
    waterSymbol: '○·∅·○',
    architectureSymbol: '○·∅·○',
    waterName: 'Game Over',
    architectureName: 'Game Over',
    description: 'The run ended — the player continues. The terminal keeps the record.',
    waterUnlockMessage: '↳ Game Over activated ○·∅·○',
    architectureUnlockMessage: '↳ Game Over activated ○·∅·○',
    rarity: 'epic',
    category: 'word_turn',
    secret: true,
  },
  // v30 Secret Boss: Cheat Code Vault
  secret_konami_signal: {
    id: 'secret_konami_signal',
    waterSymbol: '↑↑↓↓·◉',
    architectureSymbol: '↑↑↓↓·◉',
    waterName: 'Konami Signal',
    architectureName: 'Konami Signal',
    description: 'You typed the code. Extra lives granted. The acknowledgment that sometimes you need more than the standard allotment.',
    waterUnlockMessage: '↳ Konami Signal activated ↑↑↓↓·◉',
    architectureUnlockMessage: '↳ Konami Signal activated ↑↑↓↓·◉',
    rarity: 'mythic',
    category: 'word_turn',
    secret: true,
  },
  secret_iddqd_mode: {
    id: 'secret_iddqd_mode',
    waterSymbol: '⚡·■·⚡',
    architectureSymbol: '⚡·■·⚡',
    waterName: 'IDDQD Mode',
    architectureName: 'IDDQD Mode',
    description: 'There is no god mode for real life — the journal is the anti-IDDQD',
    waterUnlockMessage: '↳ IDDQD Mode activated ⚡·■·⚡',
    architectureUnlockMessage: '↳ IDDQD Mode activated ⚡·■·⚡',
    rarity: 'epic',
    category: 'word_turn',
    secret: true,
  },
  secret_all_your_base: {
    id: 'secret_all_your_base',
    waterSymbol: '·○·∅',
    architectureSymbol: '·○·∅',
    waterName: 'All Your Base',
    architectureName: 'All Your Base',
    description: 'You named who set you up — the bomb is defused when it is named',
    waterUnlockMessage: '↳ All Your Base activated ·○·∅',
    architectureUnlockMessage: '↳ All Your Base activated ·○·∅',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
}

// ─── WORD TURN BADGES v32 — THE CONSOLE ROGUE ────────────────────
export const WORD_TURN_BADGES_V32: Record<
  'permadeath' | 'run_start' | 'dungeon_floor' | 'rogue_loot' |
  'seed_set' | 'boss_room' | 'artifact_kept' | 'rng_roll' |
  'combo_break' | 'pixel_dust' | 'respawn_now' | 'meta_run' |
  'nethack_eternal' | 'hades_found' | 'original_rogue',
  Badge
> = {
  permadeath: {
    id: 'permadeath',
    waterSymbol: '×·■·×',
    architectureSymbol: '×·■·×',
    waterName: 'Permadeath',
    architectureName: 'Permadeath',
    description: 'You named the ending that teaches — the run that cannot be reloaded',
    waterUnlockMessage: '↳ Permadeath activated ×·■·×',
    architectureUnlockMessage: '↳ Permadeath activated ×·■·×',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  run_start: {
    id: 'run_start',
    waterSymbol: '◇·→·◇',
    architectureSymbol: '◇·→·◇',
    waterName: 'Run Start',
    architectureName: 'Run Start',
    description: 'A new run begins — all prior runs taught you this one',
    waterUnlockMessage: '↳ Run Start activated ◇·→·◇',
    architectureUnlockMessage: '↳ Run Start activated ◇·→·◇',
    rarity: 'common',
    category: 'word_turn',
    secret: true,
  },
  dungeon_floor: {
    id: 'dungeon_floor',
    waterSymbol: '▓·↓·▓',
    architectureSymbol: '▓·↓·▓',
    waterName: 'Dungeon Floor',
    architectureName: 'Dungeon Floor',
    description: 'You went deeper — the lower floors have rarer drops',
    waterUnlockMessage: '↳ Dungeon Floor activated ▓·↓·▓',
    architectureUnlockMessage: '↳ Dungeon Floor activated ▓·↓·▓',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  rogue_loot: {
    id: 'rogue_loot',
    waterSymbol: '◆·○·◆',
    architectureSymbol: '◆·○·◆',
    waterName: 'Rogue Loot',
    architectureName: 'Rogue Loot',
    description: 'You found something worth keeping — the dungeon yields',
    waterUnlockMessage: '↳ Rogue Loot activated ◆·○·◆',
    architectureUnlockMessage: '↳ Rogue Loot activated ◆·○·◆',
    rarity: 'common',
    category: 'word_turn',
    secret: true,
  },
  seed_set: {
    id: 'seed_set',
    waterSymbol: '∘·□·∘',
    architectureSymbol: '∘·□·∘',
    waterName: 'Seed Set',
    architectureName: 'Seed Set',
    description: 'The intention is planted — the seed shapes the entire run',
    waterUnlockMessage: '↳ Seed Set activated ∘·□·∘',
    architectureUnlockMessage: '↳ Seed Set activated ∘·□·∘',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  boss_room: {
    id: 'boss_room',
    waterSymbol: '▓·●·▓',
    architectureSymbol: '▓·●·▓',
    waterName: 'Boss Room',
    architectureName: 'Boss Room',
    description: 'You named what cannot be skipped — you entered the boss room',
    waterUnlockMessage: '↳ Boss Room activated ▓·●·▓',
    architectureUnlockMessage: '↳ Boss Room activated ▓·●·▓',
    rarity: 'epic',
    category: 'word_turn',
    secret: true,
  },
  artifact_kept: {
    id: 'artifact_kept',
    waterSymbol: '◈·→·∞',
    architectureSymbol: '◈·→·∞',
    waterName: 'Artifact Kept',
    architectureName: 'Artifact Kept',
    description: 'You carried it forward — the artifact survives between runs',
    waterUnlockMessage: '↳ Artifact Kept activated ◈·→·∞',
    architectureUnlockMessage: '↳ Artifact Kept activated ◈·→·∞',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  rng_roll: {
    id: 'rng_roll',
    waterSymbol: '?·○·?',
    architectureSymbol: '?·○·?',
    waterName: 'RNG Roll',
    architectureName: 'RNG Roll',
    description: 'You acknowledged the random — the seed was always unknown',
    waterUnlockMessage: '↳ RNG Roll activated ?·○·?',
    architectureUnlockMessage: '↳ RNG Roll activated ?·○·?',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  combo_break: {
    id: 'combo_break',
    waterSymbol: '×·≋·×',
    architectureSymbol: '×·≋·×',
    waterName: 'Combo Break',
    architectureName: 'Combo Break',
    description: 'The chain broke — the roguelike teaches through loss without punishment',
    waterUnlockMessage: '↳ Combo Break activated ×·≋·×',
    architectureUnlockMessage: '↳ Combo Break activated ×·≋·×',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  pixel_dust: {
    id: 'pixel_dust',
    waterSymbol: '·∘·∘··',
    architectureSymbol: '·∘·∘··',
    waterName: 'Pixel Dust',
    architectureName: 'Pixel Dust',
    description: 'Something scattered — the fragment is still yours',
    waterUnlockMessage: '↳ Pixel Dust activated ·∘·∘··',
    architectureUnlockMessage: '↳ Pixel Dust activated ·∘·∘··',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
  respawn_now: {
    id: 'respawn_now',
    waterSymbol: '◉·→·●',
    architectureSymbol: '◉·→·●',
    waterName: 'Respawn',
    architectureName: 'Respawn',
    description: 'You are back — the respawn carries all prior knowledge',
    waterUnlockMessage: '↳ Respawn activated ◉·→·●',
    architectureUnlockMessage: '↳ Respawn activated ◉·→·●',
    rarity: 'uncommon',
    category: 'word_turn',
    secret: true,
  },
  meta_run: {
    id: 'meta_run',
    waterSymbol: '∞·□·∞',
    architectureSymbol: '∞·□·∞',
    waterName: 'Meta Run',
    architectureName: 'Meta Run',
    description: 'You see the pattern across all runs — this is the meta-game',
    waterUnlockMessage: '↳ Meta Run activated ∞·□·∞',
    architectureUnlockMessage: '↳ Meta Run activated ∞·□·∞',
    rarity: 'epic',
    category: 'word_turn',
    secret: true,
  },
  // v32 Secret Boss: Hidden Dungeon
  nethack_eternal: {
    id: 'nethack_eternal',
    waterSymbol: '∞·◆·∞',
    architectureSymbol: '∞·◆·∞',
    waterName: 'NetHack Eternal',
    architectureName: 'NetHack Eternal',
    description: 'You named the oldest dungeon — the one that has been running since 1987',
    waterUnlockMessage: '↳ NetHack Eternal activated ∞·◆·∞',
    architectureUnlockMessage: '↳ NetHack Eternal activated ∞·◆·∞',
    rarity: 'mythic',
    category: 'word_turn',
    secret: true,
  },
  hades_found: {
    id: 'hades_found',
    waterSymbol: '◉·◇·◉',
    architectureSymbol: '◉·◇·◉',
    waterName: 'Hades Found',
    architectureName: 'Hades Found',
    description: 'The chthonic dungeon recognized — every run is an escape attempt',
    waterUnlockMessage: '↳ Hades Found activated ◉·◇·◉',
    architectureUnlockMessage: '↳ Hades Found activated ◉·◇·◉',
    rarity: 'epic',
    category: 'word_turn',
    secret: true,
  },
  original_rogue: {
    id: 'original_rogue',
    waterSymbol: '×·@·×',
    architectureSymbol: '×·@·×',
    waterName: 'Original Rogue',
    architectureName: 'Original Rogue',
    description: 'The @ symbol moves through the dungeon — you know the lineage',
    waterUnlockMessage: '↳ Original Rogue activated ×·@·×',
    architectureUnlockMessage: '↳ Original Rogue activated ×·@·×',
    rarity: 'rare',
    category: 'word_turn',
    secret: true,
  },
}

// ─── UNIFIED BADGES MAP ──────────────────────────────────────────
export const BADGES: Record<BadgeType, Badge> = {
  ...MILESTONE_BADGES,
  ...PATTERN_BADGES,
  ...EASTER_EGG_BADGES,
  ...WORD_TURN_BADGES,
  ...WORD_TURN_BADGES_V30,
  ...WORD_TURN_BADGES_V32,
}

// Default separator when no badges earned yet
export const DEFAULT_SEPARATOR = '•'

// Progression arrow used across the badge UI
export const PROGRESSION_ARROW = '→'

// Sub-item indicator for hierarchical display
export const SUB_INDICATOR = '↳'

// ─── WORD TURN TRIGGER MAP ───────────────────────────────────────
// Maps keyword patterns → word turn badge IDs
export const WORD_TURN_TRIGGERS: Array<{ keywords: string[]; badgeId: WordTurnBadgeType }> = [
  { keywords: ['ritual', 'rituals'], badgeId: 'word_ritual' },
  { keywords: ['breathe', 'breathing', 'breath'], badgeId: 'word_breath' },
  { keywords: ['grateful', 'gratitude'], badgeId: 'word_gratitude' },
  { keywords: ['ocean', 'sea', 'water'], badgeId: 'word_ocean' },
  { keywords: ['stars', 'cosmos', 'constellation', 'galaxy'], badgeId: 'word_stars' },
  { keywords: ['home', 'grounded', 'rooted'], badgeId: 'word_home' },
  { keywords: ['dream', 'dreaming', 'dreamed'], badgeId: 'word_dream' },
  { keywords: ['pain', 'difficult', 'struggle', 'hard'], badgeId: 'word_courage' },
  { keywords: ['love', 'heart', 'loved'], badgeId: 'word_love' },
  { keywords: ['silence', 'quiet', 'stillness'], badgeId: 'word_silence' },
  { keywords: ['future', 'tomorrow', 'horizon', 'ahead'], badgeId: 'word_horizon' },
  // v30 — Quantum Arcade
  { keywords: ['insert coin', 'one more try', 'one more time', 'another round'], badgeId: 'word_insert_coin' },
  { keywords: ['leveled up', 'level up', 'next level', 'unlocked', 'new level'], badgeId: 'word_level_up' },
  { keywords: ['save point', 'checkpoint', 'saved my progress', 'marked it'], badgeId: 'word_save_point' },
  { keywords: ['respawn', 'start over', 'back from the dead'], badgeId: 'word_respawn' },
  { keywords: ['boss fight', 'final challenge', 'biggest obstacle', 'hardest part'], badgeId: 'word_boss_fight' },
  { keywords: ['side quest', 'rabbit hole', 'detour', 'tangent'], badgeId: 'word_side_quest' },
  { keywords: ['inventory', 'taking stock', 'resources'], badgeId: 'word_inventory' },
  { keywords: ['health bar', 'running low', 'depleted', 'recharging'], badgeId: 'word_health_bar' },
  { keywords: ['xp gained', 'experience points', 'growth point', 'leveled'], badgeId: 'word_xp_gained' },
  { keywords: ['load game', 'remember when', 'flashback', 'recall'], badgeId: 'word_load_game' },
  { keywords: ['new game plus', 'new game+', 'fresh start', 'beginning again', 'starting over'], badgeId: 'word_new_game_plus' },
  { keywords: ['game over', 'the run is done', 'this chapter ends', 'failed'], badgeId: 'word_game_over' },
  // v32 — The Console Rogue
  { keywords: ['permadeath', 'permanent death', 'endings', 'letting go'], badgeId: 'permadeath' },
  { keywords: ['new run', 'fresh run', 'beginning again', 'starting fresh'], badgeId: 'run_start' },
  { keywords: ['deeper', 'another level', 'next floor', 'descended', 'went down'], badgeId: 'dungeon_floor' },
  { keywords: ['found treasure', 'discovered something', 'picked up', 'loot'], badgeId: 'rogue_loot' },
  { keywords: ['set the seed', 'planted the seed', 'set my intention', 'the seed'], badgeId: 'seed_set' },
  { keywords: ['the hard thing', 'the confrontation', 'boss room', 'cannot avoid'], badgeId: 'boss_room' },
  { keywords: ['carried forward', 'artifact', 'keeping it', 'brought with me'], badgeId: 'artifact_kept' },
  { keywords: ['random chance', 'luck', 'the odds', 'fate decided', 'random'], badgeId: 'rng_roll' },
  { keywords: ['streak broken', 'broke the chain', 'lost the chain', 'combo broke'], badgeId: 'combo_break' },
  { keywords: ['scattered', 'dissolving', 'fragment', 'pixel dust', 'fell apart'], badgeId: 'pixel_dust' },
  { keywords: ['alive again', 'back again', 'rebooted', 'back online', 'respawned'], badgeId: 'respawn_now' },
  { keywords: ['the bigger picture', 'meta game', 'meta-game', 'all of it', 'the pattern'], badgeId: 'meta_run' },
]

/**
 * Scan text for word turn triggers and return matching badge IDs
 */
export function detectWordTurns(text: string): WordTurnBadgeType[] {
  const lower = text.toLowerCase()
  const triggered: WordTurnBadgeType[] = []

  for (const trigger of WORD_TURN_TRIGGERS) {
    for (const kw of trigger.keywords) {
      if (new RegExp(`\\b${kw}\\b`).test(lower)) {
        triggered.push(trigger.badgeId)
        break
      }
    }
  }

  // Special: Meta-Signal — user writes "LOT" (uppercase) in their text
  if (/\bLOT\b/.test(text)) {
    triggered.push('egg_meta_signal')
  }

  // v30 Secret Boss: Cheat Code Vault
  if (/konami code|↑↑↓↓|up up down down left right/i.test(lower)) {
    triggered.push('secret_konami_signal')
  }
  if (/\biddqd\b|\bidkfa\b|god mode|cheat code/i.test(lower)) {
    triggered.push('secret_iddqd_mode')
  }
  if (/all your base|zero wing|somebody set us up/i.test(lower)) {
    triggered.push('secret_all_your_base')
  }

  // v32 Secret Boss: Hidden Dungeon
  if (/\bnethack\b|ascii dungeon|rogue 1980|rogue.*1980/i.test(lower)) {
    triggered.push('nethack_eternal')
  }
  if (/\bhades\b|supergiant games?|zagreus|chthonic/i.test(lower)) {
    triggered.push('hades_found')
  }
  if (/\bspelunky\b|dead cells|binding of isaac/i.test(lower)) {
    triggered.push('original_rogue')
  }

  return triggered
}

/**
 * Get user's preferred badge theme
 */
export function getBadgeTheme(): BadgeTheme {
  if (typeof window === 'undefined') return 'water'

  try {
    const stored = localStorage.getItem('badge_theme')
    return (stored === 'architecture' ? 'architecture' : 'water') as BadgeTheme
  } catch (e) {
    return 'water'
  }
}

/**
 * Set user's preferred badge theme
 */
export function setBadgeTheme(theme: BadgeTheme): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('badge_theme', theme)
  } catch (e) {
    console.warn('Failed to set badge theme:', e)
  }
}

/**
 * Get earned badges from localStorage
 */
export function getEarnedBadges(): BadgeType[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem('earned_badges')
    if (!stored) return []
    return stored.split(',').filter(Boolean) as BadgeType[]
  } catch (e) {
    console.warn('Failed to get earned badges:', e)
    return []
  }
}

/**
 * Save earned badges to localStorage
 */
export function saveEarnedBadges(badges: BadgeType[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('earned_badges', badges.join(','))
  } catch (e) {
    console.warn('Failed to save earned badges:', e)
  }
}

/**
 * Check if a badge is earned
 */
export function hasBadge(badgeId: BadgeType): boolean {
  return getEarnedBadges().includes(badgeId)
}

// Simple lock to prevent race conditions in multi-tab scenarios
let awardingBadge = false

/**
 * Award a new badge (returns true if newly earned)
 */
export function awardBadge(badgeId: BadgeType): boolean {
  if (awardingBadge) {
    console.warn('Badge award in progress, skipping duplicate request')
    return false
  }

  try {
    awardingBadge = true

    const earned = getEarnedBadges()
    if (earned.includes(badgeId)) return false

    earned.push(badgeId)
    saveEarnedBadges(earned)

    queueBadgeUnlock(badgeId)

    return true
  } finally {
    awardingBadge = false
  }
}

/**
 * Queue badge unlock to show in next Memory widget appearance
 */
function queueBadgeUnlock(badgeId: BadgeType): void {
  if (typeof window === 'undefined') return

  try {
    const queued = localStorage.getItem('badge_unlock_queue') || ''
    const queue = queued ? queued.split(',') : []

    if (!queue.includes(badgeId)) {
      queue.push(badgeId)
      localStorage.setItem('badge_unlock_queue', queue.join(','))
    }
  } catch (e) {
    console.warn('Failed to queue badge unlock:', e)
  }
}

/**
 * Get next badge unlock to display (and remove from queue)
 */
export function getNextBadgeUnlock(): { badge: Badge; unlockMessage: string; symbol: string; name: string } | null {
  if (typeof window === 'undefined') return null

  try {
    const queued = localStorage.getItem('badge_unlock_queue') || ''
    const queue = queued ? queued.split(',').filter(Boolean) : []

    if (queue.length === 0) return null

    const badgeId = queue.shift() as BadgeType
    localStorage.setItem('badge_unlock_queue', queue.join(','))

    const badge = BADGES[badgeId]
    if (!badge) {
      console.warn('Invalid badge ID in queue:', badgeId)
      return null
    }

    const theme = getBadgeTheme()
    const unlockMessage = theme === 'water' ? badge.waterUnlockMessage : badge.architectureUnlockMessage
    const symbol = theme === 'water' ? badge.waterSymbol : badge.architectureSymbol
    const name = theme === 'water' ? badge.waterName : badge.architectureName

    return { badge, unlockMessage, symbol, name }
  } catch (e) {
    console.warn('Failed to get next badge unlock:', e)
    return null
  }
}

/**
 * Get current level symbol based on streak — extended milestones
 */
export function getLevelSymbol(streak: number, theme?: BadgeTheme): string {
  const t = theme || getBadgeTheme()
  const sym = (id: MilestoneBadgeType) =>
    t === 'water' ? MILESTONE_BADGES[id].waterSymbol : MILESTONE_BADGES[id].architectureSymbol

  if (streak >= 365) return sym('milestone_365')
  if (streak >= 180) return sym('milestone_180')
  if (streak >= 100) return sym('milestone_100')
  if (streak >= 90)  return sym('milestone_90')
  if (streak >= 60)  return sym('milestone_60')
  if (streak >= 50)  return sym('milestone_50')
  if (streak >= 30)  return sym('milestone_30')
  if (streak >= 21)  return sym('milestone_21')
  if (streak >= 14)  return sym('milestone_14')
  if (streak >= 7)   return sym('milestone_7')
  return ''
}

/**
 * Get current level name based on streak (theme-specific)
 */
export function getLevelName(streak: number, theme?: BadgeTheme): string {
  const t = theme || getBadgeTheme()
  const name = (id: MilestoneBadgeType) =>
    t === 'water' ? MILESTONE_BADGES[id].waterName : MILESTONE_BADGES[id].architectureName

  if (streak >= 365) return name('milestone_365')
  if (streak >= 180) return name('milestone_180')
  if (streak >= 100) return name('milestone_100')
  if (streak >= 90)  return name('milestone_90')
  if (streak >= 60)  return name('milestone_60')
  if (streak >= 50)  return name('milestone_50')
  if (streak >= 30)  return name('milestone_30')
  if (streak >= 21)  return name('milestone_21')
  if (streak >= 14)  return name('milestone_14')
  if (streak >= 7)   return name('milestone_7')
  return ''
}

/**
 * Capitalize first letter of each word
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Join array with · separator and capitalize each word
 */
export function joinWithDots(items: string[]): string {
  if (items.length === 0) return ''
  return items.map(capitalize).join(' · ')
}

/**
 * Format badge progression display with arrows
 */
export function getBadgeProgressionDisplay(theme?: BadgeTheme): string {
  const t = theme || getBadgeTheme()
  const milestones: MilestoneBadgeType[] = ['milestone_7', 'milestone_30', 'milestone_100']
  return milestones
    .map(id => t === 'water' ? MILESTONE_BADGES[id].waterSymbol : MILESTONE_BADGES[id].architectureSymbol)
    .join(' → ')
}

/**
 * Check time-based and streak-based easter egg eligibility
 * Returns list of easter egg badge IDs triggered by the current context
 */
export function detectTimeEasterEggs(hour: number, minute: number): EasterEggBadgeType[] {
  const triggered: EasterEggBadgeType[] = []

  // Night Owl: 00:00–04:00
  if (hour >= 0 && hour < 4) triggered.push('egg_night_owl')

  // Early Bird: 05:00–06:00
  if (hour >= 5 && hour < 6) triggered.push('egg_early_bird')

  // The Void: exactly midnight (00:00)
  if (hour === 0 && minute === 0) triggered.push('egg_the_void')

  return triggered
}

/**
 * Check date-based easter eggs
 */
export function detectDateEasterEggs(month: number, day: number): EasterEggBadgeType[] {
  const triggered: EasterEggBadgeType[] = []

  // Solstice: June 21 or December 21
  if ((month === 6 && day === 21) || (month === 12 && day === 21)) {
    triggered.push('egg_solstice')
  }

  return triggered
}

/**
 * Detect if user returned after 24+ hours of silence
 */
export function detectSilentHourReturn(lastActivityIso: string | null): boolean {
  if (!lastActivityIso) return false
  const last = new Date(lastActivityIso).getTime()
  const now = Date.now()
  const hours = (now - last) / (1000 * 60 * 60)
  return hours >= 24
}

/**
 * Check and award milestone badges based on streak
 */
export async function checkAndAwardBadges(): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  try {
    const response = await fetch('/api/user-stats')
    if (!response.ok) return newBadges

    let stats
    try {
      stats = await response.json()
    } catch (parseError) {
      console.warn('Failed to parse user stats response:', parseError)
      return newBadges
    }

    if (!stats || typeof stats.streak !== 'number') {
      console.warn('Invalid stats response:', stats)
      return newBadges
    }

    const milestones: Array<[number, MilestoneBadgeType]> = [
      [7,   'milestone_7'],
      [14,  'milestone_14'],
      [21,  'milestone_21'],
      [30,  'milestone_30'],
      [50,  'milestone_50'],
      [60,  'milestone_60'],
      [90,  'milestone_90'],
      [100, 'milestone_100'],
      [180, 'milestone_180'],
      [365, 'milestone_365'],
    ]

    for (const [threshold, badgeId] of milestones) {
      if (stats.streak >= threshold && !hasBadge(badgeId)) {
        if (awardBadge(badgeId)) newBadges.push(badgeId)
      }
    }

    // Time-based easter eggs
    const now = new Date()
    const timeEggs = detectTimeEasterEggs(now.getHours(), now.getMinutes())
    for (const egg of timeEggs) {
      if (!hasBadge(egg)) {
        if (awardBadge(egg)) newBadges.push(egg)
      }
    }

    // Date-based easter eggs
    const dateEggs = detectDateEasterEggs(now.getMonth() + 1, now.getDate())
    for (const egg of dateEggs) {
      if (!hasBadge(egg)) {
        if (awardBadge(egg)) newBadges.push(egg)
      }
    }

    // Silent Hour return detection
    if (stats.lastActivity && detectSilentHourReturn(stats.lastActivity)) {
      if (!hasBadge('egg_silent_hour')) {
        if (awardBadge('egg_silent_hour')) newBadges.push('egg_silent_hour')
      }
    }

    // Friday Ritual: check if user has 4 consecutive Friday check-ins
    if (stats.consecutiveFridays >= 4 && !hasBadge('egg_friday_ritual')) {
      if (awardBadge('egg_friday_ritual')) newBadges.push('egg_friday_ritual')
    }

  } catch (error) {
    console.warn('Badge check failed:', error)
  }

  return newBadges
}

/**
 * Check and award word-turn badges from journal/answer text
 * Call this when a user submits a memory answer or journal note
 */
export function checkWordTurnBadges(text: string): WordTurnBadgeType[] {
  const triggered = detectWordTurns(text)
  const awarded: WordTurnBadgeType[] = []

  for (const badgeId of triggered) {
    if (!hasBadge(badgeId)) {
      if (awardBadge(badgeId)) awarded.push(badgeId)
    }
  }

  return awarded
}
