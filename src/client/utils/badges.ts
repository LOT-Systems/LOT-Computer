/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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
 * Progression: ▸ milestone_7 → milestone_30 → milestone_100
 */

export type BadgeTheme = 'water' | 'architecture'

export type BadgeType =
  // ── Core milestones (Water ↳ Architecture) ──────────────────────────────
  | 'milestone_7'       // ∘ Droplet    → ├─ Foundation
  | 'milestone_30'      // ≈ Wave       → ╞═╡ Structure
  | 'milestone_100'     // ≋ Current    → ║·║ Architecture
  // ── Extended milestones ─────────────────────────────────────────────────
  | 'milestone_14'      // ∘∘ Twin Drop → ├┼ Load-Bearing
  | 'milestone_21'      // ∘≈ Proto-Wave→ ├═ Deep Foundation
  | 'milestone_50'      // ≈∘ Mid-Current→ ╞══ Mid-Structure
  | 'milestone_60'      // ≈≈ Dual Wave → ╞═══ Master Frame
  | 'milestone_90'      // ≋∘ Deep Reach→ ║═ Inner Wall
  | 'milestone_180'     // ≋≋ Voyager   → ║╞║ Wing
  | 'milestone_365'     // ≋≋≋ Long Count→ ╔═╗ Citadel (LEGENDARY)
  // ── Easter egg — time-based v1 ──────────────────────────────────────────
  | 'night_owl'         // ◉  Check in 01:00–04:00 AM
  | 'early_bird'        // ∴  Check in 05:00–06:00 AM
  | 'mirror_hour'       // ⊡  Check in at 11:11
  | 'midnight_sigil'    // ◉  Answer at exactly 00:00
  // ── Easter egg — time-based v2 (Sci-Fi Arcade) ──────────────────────────
  | 'pi_hour'           // ∞∘  Check in at 3:14 AM
  | 'error_hour'        // □·□  Check in at 4:04 AM
  | 'sequence_time'     // →∘→  Check in at 12:34
  | 'lot_hour'          // ≋◉  Check in at 04:07 (LOT founding hour)
  // ── Easter egg — calendar ───────────────────────────────────────────────
  | 'solstice'          // ❋  June 21 or Dec 21
  | 'equinox'           // ○  March 20 or Sept 22
  | 'lot_birthday'      // ◉  April 7 (LOT founding)
  | 'new_year_sage'     // ⊛  January 1
  | 'pi_day'            // ∞  March 14
  | 'palindrome_day'    // ◈  Any palindrome date
  | 'full_moon'         // ☽  Calendar full moon
  | 'friday_ritual'     // ▪·▪ Four consecutive Fridays
  // ── Easter egg — behavioral ─────────────────────────────────────────────
  | 'silent_hour'       // ─○─ 24h absence then return
  | 'ghost_protocol'    // ░░░ 7-day absence then return
  | 'anniversary'       // ≋  Account signup anniversary
  | 'overclock'         // ▒▒▒ 20+ activities in one day
  | 'perfect_day'       // ✦·✦ All combos in one day
  // ── Word turn badges v1 ─────────────────────────────────────────────────
  | 'ritual_keeper'     // ≈·≈  "ritual" detected in text
  | 'breath_anchor'     // ∿·∿  "breathe" / "breathing"
  | 'gratitude_node'    // ○·○  "grateful" / "gratitude"
  | 'aquatic_resonance' // ≋·∿  "ocean" / "water"
  | 'stargazer'         // ✦·✧  "stars" / "cosmos"
  | 'grounded_signal'   // —○—  "home"
  | 'dream_log'         // ◐·◐  "dream" / "dreaming"
  | 'courage_pulse'     // ▲·▲  "pain" / "difficult"
  | 'heart_signal'      // ♡·♡  "love" / "heart"
  | 'the_quiet'         // ·—·  "silence" / "quiet"
  | 'horizon_seeker'    // →·→  "future" / "tomorrow"
  | 'meta_signal'       // ◉·◉  "LOT" in answer (MYTHIC)
  // ── Word turn badges v2 — Sci-Fi Arcade Expansion ────────────────────────
  | 'reboot_sequence'   // ↺·↺  "reboot" / "restart"
  | 'not_lost_404'      // □□□  "404"
  | 'signal_glitch'     // ▓░▓  "glitch"
  | 'cosmic_twin'       // ✦◉✦  "COSMO" in answer (ULTRA-RARE)
  | 'quantum_observer'  // ◈·◈  "quantum"
  | 'neural_architect'  // ≋≈≋  "neural"
  | 'code_witch'        // ┤·├  "code"
  | 'recharge_mode'     // ∼∼∼  "sleep" / "rest"
  | 'fuel_protocol'     // ■·■  "coffee" / "tea"
  | 'frequency'         // ≈~≈  "music"
  | 'kinetic_protocol'  // →→→  "run" / "walk"
  | 'solar_charge'      // ○∘○  "sun" / "light"
  | 'shadow_protocol'   // ▪▪▪  "fear" / "scared"
  | 'phase_shift'       // ≈→≋  "change"
  | 'acceptance_node'   // ○—○  "accept" / "let go"
  | 'present_moment'    // ·∘·  "now" / "moment"
  | 'cosmic_scale'      // ∞·∞  "universe" / "cosmos"
  | 'vital_signal'      // ∘·∘  "alive"
  // ── Mastery tier achievements (Sci-Fi Arcade) ────────────────────────────
  | 'quantum_leap'      // ◈  First check-in after 30+ day gap
  | 'speedrun'          // ▒▒▒  5 check-ins within 60 min
  | 'system_op'         // ≋◉  All 7 CQGS modules used in 7 days
  | 'commander_data'    // ◉  500 memory questions answered
  | 'sage_mode'         // ∞  Reach Level 90+
  // ── Oceanic Mayan pattern badges ────────────────────────────────────────
  | 'pattern_balanced'  // ∿—∿  All planner dimensions used evenly
  | 'pattern_flow'      // ≈○≈  4+ widgets in one session
  | 'pattern_consistent'// —○—  Regular same-time engagement
  | 'pattern_reflective'// ○◐○  5+ memory answers in one day
  | 'pattern_explorer'  // ○∴○  5+ diverse widget options tried
  // ── Easter egg — time-based v5 (Mirror & Math) ──────────────────────────────
  | 'digital_symmetry'   // ⊡·⊡  Check in at 10:10
  | 'seq_boot'           // →∘→  Check in at 01:23
  | 'palindrome_time'    // ◈·◈  Check in at 21:12
  | 'tau_signal'         // ∞·∘  Check in at 06:28 (τ ≈ 6.28)
  // ── Easter egg — time-based v6 (Infinite Loop) ──────────────────────────────
  | 'nine_lives'         // ◉×◉  Check in at 09:09
  | 'hex_hour'           // ▒·▒  Check in at 16:16 (0x10:0x10)
  | 'final_frame'        // ◈—◈  Check in at 23:59
  | 'year_signal'        // ≋·◉  Check in at 20:26 (founding year)
  // ── Easter egg — calendar v4 (Nerd & Cosmic) ────────────────────────────────
  | 'signal_wars'        // ⊛·⊛  May 4 — Star Wars Day
  | 'prog_day'           // □∘□  Sep 12–13 — Programmers' Day (day 256)
  | 'ada_protocol'       // ∞·∞  Dec 9 — Ada Lovelace Day
  // ── Easter egg — calendar v5 ────────────────────────────────────────────────
  | 'groundhog_loop'     // ↺·↺  Feb 2 — Groundhog Day
  | 'binary_day'         // 1·0  Oct 10 — Binary Day
  | 'fibonacci_day'      // ∗→∗  Nov 23 — Fibonacci Day (1,1,2,3)
  // ── Easter egg — behavioral v4 (Deep Archive) ───────────────────────────────
  | 'night_scribe'       // ◐·◐  Journal entry after 23:30
  | 'epic_transmission'  // ▒▒▒  1,000+ char memory answer
  | 'perfect_week'       // ✦✦✦  7 consecutive Perfect Days
  | 'analog_reboot'      // ↺≋↺  Return after 180+ day gap
  // ── Easter egg — behavioral v5 ──────────────────────────────────────────────
  | 'deep_scribe'        // ≋·≋  Journal entry ≥500 chars
  | 'phoenix_streak'     // ∴→∘  Rebuild streak after breaking it
  | 'time_anchor'        // ⊡·⊡  Same clock hour 14 consecutive days
  // ── Word turn badges v5 — Signal Codex ──────────────────────────────────────
  | 'solitude_mode'      // ∘—∘  "solitude" detected in text
  | 'wonder_protocol'    // ○·∗  "wonder" detected in text
  | 'phoenix_sequence'   // ∴→∘  "phoenix" detected in text
  | 'alignment_lock'     // ─○─  "align" / "aligned" detected in text
  | 'witness_log'        // ◯·◯  "witness" detected in text
  | 'orbital_pattern'    // ○→○  "orbit" detected in text
  | 'forge_protocol'     // ■·■  "forge" detected in text
  | 'neuro_link'         // ≋·—  "mind" detected in text
  | 'photon_signal'      // ○—○  "light" detected in text
  | 'field_charge'       // ∿→∿  "energy" detected in text
  | 'voyage_mode'        // →·∗  "voyage" detected in text
  | 'gravity_lock'       // ≋·■  "gravity" detected in text
  // ── Word turn badges v6 — The Becoming Lexicon ──────────────────────────────
  | 'surrender_signal'   // ∿·∿  "surrender" detected in text
  | 'restore_protocol'   // ○→●  "restore" detected in text
  | 'anchor_lock'        // ─▪─  "anchor" detected in text
  | 'threshold_gate'     // ╞═╡  "threshold" detected in text
  | 'emergence_sequence' // ∘→≈  "emerge" detected in text
  | 'exhale_wave'        // ≋·∿  "exhale" detected in text
  | 'clear_field'        // □·□  "clear" detected in text
  | 'rise_signal'        // ∘↑∘  "rise" detected in text
  | 'presence_core'      // ●·●  "presence" detected in text
  | 'bold_protocol'      // ▶·▶  "bold" detected in text
  | 'trust_lock'         // ○═○  "trust" detected in text
  | 'shift_sequence'     // →∘→  "shift" detected in text
  // ── Mastery tier v4 — Final Frontier ────────────────────────────────────────
  | 'interstellar'       // ∗×∗  2,000 total check-ins (LEGENDARY)
  | 'deep_narrator'      // ≋≋·≋≋ Memory story 1,000+ words (LEGENDARY)
  | 'signal_master'      // ◉·◈·◉ 100+ distinct badge types earned (EPIC)
  | 'word_master'        // ▒→▒  30+ word-turn badge types triggered (RARE)
  // ── Mastery tier v5 — Infinite Loop ─────────────────────────────────────────
  | 'epoch_operator'     // ∞·◉  3,000 total check-ins (LEGENDARY)
  | 'time_collector'     // ⊡·⊡·⊡ All Time v1 badges earned (EPIC)
  | 'memory_keeper_30'   // ≋·≋  Memory answers on 30 distinct calendar days (RARE)
  | 'word_collector'     // ◇→◇  30+ distinct word-turn badge types (EPIC)
  // ── Secret Boss v4 — Founders' Layer ────────────────────────────────────────
  | 'i_am_lot'           // ◉◉◉  Write "I am LOT" in any answer (MYTHIC)
  | 'malibu'             // ∘◉∘  Write "Malibu" in any answer (MYTHIC)
  | 'perfect_month'      // ✦●✦  28 consecutive Perfect Days (MYTHIC)
  // ── Secret Boss v5 — Invisible Layer ────────────────────────────────────────
  | 'the_cat_knows'      // ∗◉∗  Write "Kuzya" in any entry (MYTHIC)
  | 'key_code'           // ▒→▒  Write "0451" in any entry (RARE)
  | 'five_years'         // ≋≋≋·≋  Account age ≥ 5 years (COSMIC)
  // ── Achievement RPG v2 — Story Arcs ─────────────────────────────────────────
  | 'signal_keeper'      // ◇  100+ memory answers (lifetime)
  | 'word_weaver'        // ≈·≋  20+ word-turn badge types triggered
  | 'full_spectrum'      // ◆  All 6 User Index dimensions scored in one week
  | 'truth_forge'        // ■  50+ journal entries (lifetime)
  | 'inner_compass'      // ○  25+ intention entries (lifetime)
  | 'perfect_architect'  // ╔═╗  All 14 Progressive Feature Unlocks activated
  // ── Achievement RPG v3 — Story Arcs ─────────────────────────────────────────
  | 'first_signal'       // ∘  10+ memory answers (lifetime)
  | 'planner_class'      // ○  10+ intention entries (lifetime)
  | 'dual_channel'       // ≈≋  Journal AND memory answer same week × 5
  | 'mood_master'        // ·  30+ mood entries (lifetime)
  | 'body_keeper'        // ≈  25+ self-care activity entries (lifetime)
  | 'community_builder'  // ∘→∘  50+ chat messages (lifetime)
  // ── Achievement RPG v4 — Veteran Arcs ───────────────────────────────────────
  | 'word_merchant'      // ◇  500+ total journal words
  | 'full_presence_wk'  // ≋  All 7 CQGS modules 7 days consecutive
  | 'time_lord'         // ⊡  All Time Easter Eggs v1–v3 earned
  | 'multi_tongue'      // ≈  Word-turn badges from all 7 engines
  | 'signal_economist'  // ○  30 consecutive days with check-in before 09:00
  | 'lore_completionist'// ◆  20+ distinct calendar easter eggs earned
  // ── Mastery Tier v6 — The Void Layer ────────────────────────────────────────
  | 'infinite_archive'  // ≋≋≋≋  5,000 total check-ins (LEGENDARY)
  | 'word_sovereign'    // ◉·∞·◉  50+ distinct word-turn badge types (LEGENDARY)
  | 'lore_keeper'       // ▒→▒→▒  Every calendar easter egg category v1–v6 (EPIC)
  | 'century_architect' // ∞·∞·∞  Same check-in hour 100 consecutive days (LEGENDARY)
  // ── Secret Boss v6 — The Void Tier ─────────────────────────────────────────
  | 'void_master'       // ░▒▓  Write "void" in 5 different answers (RARE)
  | 'founders_guard'    // ◉≋◉  Check in every April 7 for 3 years (ULTRA-RARE)
  | 'deep_thought'      // ∞·≋  Exact 42-day streak (RARE)
  // ── Word turn badges v7 — The Rogue Archive ─────────────────────────────────
  | 'loot_drop'         // ◇·◇  "loot" detected in text
  | 'boss_encounter'    // ▲·▲  "boss" detected in text
  | 'save_state'        // ⊡→⊡  "save" detected in text
  | 'respawn_point'     // ◈→○  "respawn" detected in text
  | 'grind_mode'        // ▒→▒  "grind" detected in text
  | 'level_gained'      // ∘↑∘  "level" detected in text
  | 'quest_log'         // →·∗  "quest" detected in text
  | 'potion_protocol'   // ○·≋  "potion" detected in text
  | 'dungeon_cleared'   // ░▒▓  "dungeon" detected in text
  | 'armor_up'          // ╔·╗  "armor" detected in text
  | 'stealth_mode'      // ·—·  "stealth" detected in text
  | 'rogue_state'       // ─∘─  "rogue" detected in text
  // ── Easter egg — time-based v7 (Pixel Hours) ─────────────────────────────────
  | 'deep_night'        // ·∘·  Check in at 02:02
  | 'midday_signal'     // ─○─  Check in at 14:14
  | 'liminal_hour'      // ∘·≈  Check in at 05:55
  | 'sacred_triple'     // ∘∘∘  Check in at 03:33
  // ── Easter egg — calendar v6 (The Hacker Calendar) ──────────────────────────
  | 'dos_day'           // ○═○  April 4 — 04/04
  | 'eleven_eleven'     // ···∘  November 11 — 11/11
  | 'march_protocol'    // ─∘─  March 1 — First of March
  // ── Easter egg — behavioral v6 (Endurance Signals) ──────────────────────────
  | 'three_week_arc'    // ≋·≈  21 consecutive journal days
  | 'dawn_runner'       // ∴·∴  3 pre-06:00 check-ins in one week
  | 'weekend_wrnr'      // ─●─  Perfect Day on both Sat + Sun same week
  // ── Word turn badges v8 — The Mainframe ──────────────────────────────────────
  | 'compile_run'       // >·<  "compile" detected in text
  | 'execute_path'      // →→>  "execute" detected in text
  | 'buffer_flush'      // ▒→□  "buffer" detected in text
  | 'stack_clear'       // ▓·▓  "stack" detected in text
  | 'patch_applied'     // □→■  "patch" detected in text
  | 'fork_event'        // <·>  "fork" detected in text
  | 'terminal_session'  // ─▓─  "terminal" detected in text
  | 'null_pointer'      // ○·○  "null" detected in text
  | 'seed_planted'      // ∘·∗  "seed" detected in text
  | 'loop_detected'     // ↺·↺  "loop" detected in text
  | 'root_access'       // ▒◉▒  "root" detected in text
  | 'debug_mode_badge'  // □░□  "debug" detected in text
  // ── Easter egg — time-based v8 (Clock Cycles) ───────────────────────────────
  | 'clock_forty_two'   // ∞·∘  Check in at 00:42
  | 'noon_kernel'       // ─○─  Check in at 12:00
  | 'byte_time'         // ◉◉  Check in at 08:08
  | 'stack_mirror'      // ·∘·  Check in at 17:17
  // ── Easter egg — calendar v7 (Sci-Fi Calendar) ──────────────────────────────
  | 'towel_day'         // ∞·∞  May 25 — Towel Day (Hitchhiker's Guide)
  | 'cosmo_founding'    // ◉∘◉  July 1 — COSMO® founding
  | 'halloween_protocol'// ░▒▓  October 31 — Halloween Protocol
  // ── Easter egg — behavioral v7 (Deep Patterns) ──────────────────────────────
  | 'triple_session'    // ▓·▓·▓  3+ journal entries in one day
  | 'cron_job'          // ⊡·⊡  Same exact clock minute 7 consecutive days
  | 'lucky_return'      // ↺◈↺  Return after exactly 7 days absence
  // ── Achievement RPG v5 — Origin Protocol ────────────────────────────────────
  | 'polyglot'          // ≈·≋  Earned badge from each of all 8 Word Turn engines
  | 'boss_slayer'       // ▲·◉  Earned any Secret Boss badge
  | 'combo_master'      // ×7  Achieved all combo levels x2–x7 at least once
  | 'silent_novelist'   // ≋·≋  1,000 total journal words
  | 'calendar_pilgrim'  // ◈·○  5+ distinct calendar easter eggs earned
  | 'signal_marathon'   // ≋≋→  60 consecutive days streak
  // ── Mastery Tier v7 — The Deep Archive ──────────────────────────────────────
  | 'novelist'          // ∞·≋·∞  10,000 total journal words (LEGENDARY)
  | 'triennial'         // ≋·≋·≋  Account age ≥ 3 years (LEGENDARY)
  | 'pattern_master'    // ∿≈∿  All 5 Oceanic Mayan Pattern badges earned (EPIC)
  | 'mainframe_access'  // ▒◉▒  Badges from all 8 Word Turn engines + all 7 Mastery Tiers (MYTHIC)
  // ── Secret Boss v7 — The Final Layer ────────────────────────────────────────
  | 'cosmo_vigil'       // ◉∘◉  Check in every July 1 for 2 consecutive years (ULTRA-RARE)
  | 'the_answer_is_words'// ∞·≋  Write exactly 42 words in a journal entry (RARE)
  | 'welcome_back_program'// ↺≋↺  Return after exactly 365 days of absence (LEGENDARY)
  // ── Word Turn v9 — The Arcade Cabinet ────────────────────────────────────────
  | 'coin_dropped'      // ○→◉  "coin" detected in text
  | 'pixel_recognized'  // ▒·▒  "pixel" detected in text
  | 'sprite_active'     // ∘·>  "sprite" detected in text
  | 'score_logged'      // ▓→∞  "score" detected in text
  | 'life_remaining'    // ◉·◉  "life" or "lives" detected in text
  | 'input_received'    // ↑↓←→ "joystick" detected in text
  | 'signal_blip'       // ·○·  "blip" detected in text
  | 'continue_selected' // →·→  "continue" detected in text
  | 'high_signal'       // ∗·∗  "high" detected in text
  | 'reset_protocol'    // ↺·○  "reset" detected in text
  | 'quarter_offered'   // ○·≋  "quarter" detected in text
  | 'cheat_code_entered'// ↑↑↓↓ "cheat" detected in text
  // ── Easter egg — time-based v9 (Power-Up Hours) ─────────────────────────────
  | 'lucky_seven'       // ∗·∗·∗  Check in at 07:00
  | 'mirror_play'       // ─◐─   Check in at 15:15
  | 'neon_stack'        // ▒·▒   Check in at 19:19
  | 'four_aces'         // ◆◆◆◆  Check in at 04:44
  // ── Easter egg — calendar v8 (Game Anniversaries) ────────────────────────────
  | 'new_year_sig'      // ○→∞  January 1 — New Year Signal
  | 'sonic_day'         // →→→◉ September 9 — Sonic Birthday
  | 'winter_code'       // ░∘░  December 25 — Holiday Protocol
  // ── Easter egg — behavioral v8 (Arcade Patterns) ────────────────────────────
  | 'perfect_bday'      // ✦·◉·✦  Perfect Day x7 on account anniversary
  | 'high_score_badge'  // ▓→∗   New personal longest-streak record
  | 'extra_life'        // ◉→○   Return after 7+ days, prior streak 30+
  // ── Achievement RPG v6 — Arcade Class ────────────────────────────────────────
  | 'quarter_drop'      // ○→◉  First easter egg unlocked (any type)
  | 'insert_coin_badge' // ↺·○  Return after 30+ consecutive days away
  | 'arcade_champion'   // ≈·≋  Earn badge from every Word Turn engine v1–v9
  | 'game_over_retry'   // ◐→◆  3 different return-after-absence badges
  | 'combo_seven'       // ∗·×7 x7 Perfect Day combo on 7 separate occasions
  | 'world_builder'     // ≋≋≋  Check in on 200+ distinct calendar dates
  // ── Mastery Tier v8 — Hall of Fame ───────────────────────────────────────────
  | 'initials_on_board' // A·A·A  300+ distinct badge types earned (LEGENDARY)
  | 'credit_feed'       // ▓▓▓→  3,000+ total XP earned (EPIC)
  | 'speedrun_record'   // ≋→∞   365-day streak completed (LEGENDARY)
  | 'game_complete'     // ∞◉∞   All achievement categories completed (COSMIC)
  // ── Secret Boss v8 — Arcade Final Boss ───────────────────────────────────────
  | 'player_one'        // ▓→◉  Write "player 1" or "player one" in journal (RARE)
  | 'birthday_perfect'  // ✦◉✦  Perfect Day x7 on April 7 — LOT founding (MYTHIC)
  | 'one_up'            // ◉·↑  Write "1up" or "1 UP" in journal (UNCOMMON)
  // ── Word Turn v10 — The Spell Book ───────────────────────────────────────
  | 'spell_cast'        // ∗·∗  "spell" detected in text
  | 'cast_signal'       // →·∗  "cast" detected in text
  | 'invoked'           // ◉→◉  "invoke" detected in text
  | 'arcane_entry'      // ≈·◈  "arcane" detected in text
  | 'sigil_drawn'       // ∗—∗  "sigil" detected in text
  | 'tome_keeper'       // ║·║  "tome" detected in text
  | 'grimoire_open'     // ▒·░  "grimoire" detected in text
  | 'ward_active'       // □·▪  "ward" detected in text
  | 'mana_check'        // ∿·∿  "mana" detected in text
  | 'familiar_bond'     // ∗◉∗  "familiar" detected in text
  | 'chapter_mark'      // ─║─  "chapter" detected in text
  | 'verse_logged'      // ≈·≈  "verse" detected in text
  // ── Easter egg — time v10 (Arcane Hours) ─────────────────────────────────
  | 'dawn_gate'         // ∘·∘  Check in at 06:06
  | 'noon_fold'         // ─◐─  Check in at 12:21
  | 'evening_prime'     // ◈·◈  Check in at 21:00
  | 'night_mirror'      // ▒—▒  Check in at 23:23
  // ── Easter egg — calendar v9 (Sci-Fi Literary Calendar) ──────────────────
  | 'turing_day'        // ∞·∘  June 23 — Alan Turing born 1912
  | 'moon_landing'      // ○·∗  July 20 — First lunar footprint 1969
  | 'sputnik_signal'    // ·∘·  October 4 — Sputnik launch 1957
  // ── Easter egg — behavioral v9 (Spellbound Patterns) ─────────────────────
  | 'dawn_twin'         // ∘—○—∘  Check in before 06:00 AND after 21:00 same day
  | 'year_first'        // ○→∗  First journal entry of a new calendar year
  | 'echo_session'      // ◐·◐  Two memory answers within 60 minutes
  // ── Achievement RPG v7 — The Caster Class ────────────────────────────────
  | 'spell_caster'      // ∗·∗  Earn any 5 Word Turn v10 badges
  | 'grimoire_complete' // ▒·░  Earn all 12 Word Turn v10 badges
  | 'incantation_arc'   // ≈·◈  200+ words/day for 5 consecutive days
  | 'all_time_engines'  // ∞·∗  1 badge from each of all 10 Time EE sets
  | 'ten_tongues'       // ◉·◈·◉  1 badge from each of all 10 Word Turn engines
  | 'convergence_caster'// ∗→◉  QIE P70 operator-convergence pattern (EPIC)
  // ── Mastery Tier v9 — The Arcane Vault ───────────────────────────────────
  | 'sigil_keeper'      // A·∗·A  400+ distinct badge types (LEGENDARY)
  | 'ancient_record'    // ∞·∞·∞  1,000+ lifetime memory answers (LEGENDARY)
  | 'word_archmage'     // ◈·∿·◈  75+ distinct word-turn badge types (LEGENDARY)
  | 'cosmo_gate_keeper' // ∗◉∗·◉  Write "Kuzya" AND "COSMO" within 7 days (MYTHIC)
  // ── Secret Boss v9 — Spellbound ──────────────────────────────────────────
  | 'archmage'          // ≈◉≈  Write "archmage" in journal (RARE)
  | 'dual_founding'     // ◉·◉  Check in April 7 AND July 1 same year (EPIC)
  | 'recursive'         // ∞◉∞  Write "layers of time" in journal (MYTHIC)
  // ── Word Turn v11 — The Navigator ─────────────────────────────────────────────
  | 'nav_drift'         // ···→  "drift" detected in text
  | 'nav_vector'        // ↗·↗   "vector" detected in text
  | 'nav_bearing'       // ──►   "bearing" detected in text
  | 'nav_waypoint'      // ◈·→   "waypoint" detected in text
  | 'nav_chart'         // ▦·▦   "chart" detected in text
  | 'nav_magnetic'      // N·▲   "magnetic" detected in text
  | 'nav_meridian'      // |·|   "meridian" detected in text
  | 'nav_course'        // ——→   "course" detected in text
  | 'nav_heading'       // ▲·▲   "heading" detected in text
  | 'nav_landmark'      // ◆·○   "landmark" detected in text
  | 'nav_navigate'      // ◌·◉   "navigate" detected in text
  | 'nav_compass'       // ◎·N   "compass" detected in text
  // ── Easter egg — time v11 (Navigator Hours) ──────────────────────────────────
  | 'afternoon_mirror'  // ◑—◑   Check in at 13:13
  | 'navigator_dawn'    // ▲·∘   Check in at 05:12
  | 'answer_hour_v11'   // ∞·42  Check in at 18:42
  | 'palindrome_check'  // ←◉→   Check in at 10:01
  // ── Easter egg — calendar v10 (Navigation Dates) ─────────────────────────────
  | 'voyager_day'           // ∘···  August 25 — Voyager 2 launch 1977
  | 'navigators_day'        // ──→∞  October 12 — Navigator's Day
  | 'leap_day'              // ○+1   February 29 — Leap Day (rare calendar)
  // ── Easter egg — behavioral v10 (Navigator Patterns) ─────────────────────────
  | 'compass_rose_badge'    // ◎·✦   Four time-of-day windows in one calendar day
  | 'dead_reckoning_badge'  // ···→◉ Second 30+ day return on account history
  | 'star_fix_badge'        // ○·∗·○ 3 calendar easter eggs in one calendar year
  // ── Achievement RPG v8 — Navigator Class ─────────────────────────────────────
  | 'first_fix'             // ──►   Earn any Word Turn v11 badge
  | 'chart_begun'           // ◈·→   Earn any 5 Word Turn v11 badges
  | 'atlas_complete'        // ▦·▦   Earn all 12 Word Turn v11 badges
  | 'navigator_class'       // ∘···  Earn all 4 Time Easter Egg v11 badges
  | 'eleven_engines'        // ◌·◉   1 badge from each Word Turn engine v1–v11
  | 'dead_reckoning_arc'    // ◆·○   Earn dead_reckoning behavioral badge
  // ── Mastery Tier v10 — The Cartographer ──────────────────────────────────────
  | 'cartographer'          // ▲·▲   2+ years since account creation (730+ days)
  | 'long_voyage'           // ——→∞  750+ total check-ins
  | 'all_engines_v10'       // ∞·◌   1 badge from all 11 Word Turn engines
  | 'complete_navigator'    // ◉·◉·◉ All 10 Mastery Tier sets earned (1 each v1–v10)
  // ── Secret Boss v10 — Terra Incognita ────────────────────────────────────────
  | 'dead_reckoning_word'   // ···→◉ Write "dead reckoning" in journal (RARE)
  | 'terra_incognita'       // ∞·○   Write "terra incognita" in journal (EPIC)
  | 'true_north'            // N·▲   Write "magnetic north" or "true north" in journal (UNCOMMON)
  // ── Word Turn v14 — The Starship Deck ────────────────────────────────────────
  | 'launch_confirmed'     // ↑·↑·◉  "launch" detected in text
  | 'mission_active'       // ◉→∞    "mission" detected in text
  | 'astronaut_mode'       // ○·∗·○  "astronaut" detected in text
  | 'capsule_entry'        // ─╗─    "capsule" detected in text
  | 'telemetry_live'       // ▒·▒·▒  "telemetry" detected in text
  | 'countdown_initiated'  // 3·2·1  "countdown" detected in text
  | 'reentry_burn'         // ≋·∞·≋  "reentry" / "re-entry" detected in text
  | 'crew_signal'          // ○·○·○  "crew" detected in text
  | 'starship_mode'        // ≋→∞    "starship" detected in text
  | 'module_locked'        // ╔·╗    "module" detected in text
  | 'docking_complete'     // ◉=◉    "docking" detected in text
  | 'spacewalk_mode'       // ○·∗    "spacewalk" detected in text
  // ── Easter egg — time v14 (Mission Control Hours) ─────────────────────────
  | 'lucky_pair'           // ∗·∗    Check in at 07:07
  | 'vision_year'          // ◎·◎    Check in at 20:20
  | 'binary_triple'        // ○·○·○  Check in at 02:22
  | 'signal_nine'          // ─∘─    Check in at 15:45
  // ── Easter egg — calendar v11 (Space Firsts) ──────────────────────────────
  | 'gagarin_day'          // ↑·◉    April 12 — First human in space 1961
  | 'zarya_signal'         // ═══◉   November 20 — ISS Zarya module 1998
  | 'pluto_discovered'     // ○··    February 18 — Pluto discovered 1930
  // ── Easter egg — behavioral v11 (Astronaut Patterns) ─────────────────────
  | 'morning_mission'      // ∴·∴·∴  7 consecutive morning check-ins before 09:00
  | 'sustained_transmission' // ≋≋≋  250+ word journal 3 consecutive days
  | 'rapid_orbit'          // ○→○→○  3 check-ins in under 4 hours same day
  // ── Achievement RPG v9 — Mission Commander Class ──────────────────────────
  | 'launch_sequence'      // ↑·◉    Earn any Word Turn v14 (Starship Deck) badge
  | 'mission_underway'     // ◉→∞    Earn any 5 Word Turn v14 badges
  | 'mission_complete'     // ∞·◉·∞  Earn all 12 Word Turn v14 badges
  | 'mission_control_access' // ▒·▒  Earn all 4 Time Easter Egg v14 badges
  | 'explorer_class'       // ○·∗·○  Earn all 3 Calendar v11 badges
  | 'space_race_complete'  // ↑·○    gagarin_day + moon_landing both earned
  // ── Mastery Tier v11 — The Infinite Mission ───────────────────────────────
  | 'century_explorer'     // ◎·◎    200+ distinct calendar days with any check-in
  | 'librarian_omega'      // ∞·≋·∞  5,000+ total journal words (lifetime)
  | 'orbital_period'       // ○→○    Account age ≥ 7 years (2,555+ days)
  | 'twelve_tongues'       // ◉·◈·◉  1 badge from each of all 14 Word Turn engines
  // ── Secret Boss v11 — Final Transmission ──────────────────────────────────
  | 'houston_signal'       // ·◉·    Write "Houston" in any entry (RARE)
  | 'gagarin_echo'         // ↑·∘    Write "Gagarin" in any entry (RARE, hidden)
  | 'sagan_protocol'       // ○·∞·○  Write "Pale Blue Dot" in any entry (EPIC)
  // ── Word Turn v15 — The Oracle Archive ───────────────────────────────────
  | 'oracle_consulted'     // ◉⊡◉   "oracle" detected in text
  | 'rune_detected'        // ∗·∗    "rune"/"runes" detected in text
  | 'prophecy_logged'      // ∿→∿   "prophecy"/"prophesy" detected in text
  | 'scroll_opened'        // ─□─    "scroll"/"scrolls" detected in text
  | 'signal_amplified'     // ≈▲≈   "amplify"/"amplified" detected in text
  | 'relay_active'         // ◉→◉   "relay" detected in text
  | 'encrypted_entry'      // ▓▓▓   "encrypt"/"encrypted"/"encryption" detected
  | 'pulse_detected'       // ∘·∘·∘ "pulse" detected in text
  | 'cascade_event'        // ≋↓≋   "cascade"/"cascading" detected in text
  | 'convergence_point'    // ←◉→   "converge"/"convergence" detected in text
  | 'sync_complete'        // ═══    "sync"/"synced"/"synchronized" detected
  | 'calibration_active'   // ▒═▒   "calibrate"/"calibration" detected
  // ── Easter egg — time-based v15 (Oracle Hours) ───────────────────────────
  | 'first_code'           // ·◉·   Check in at 01:01
  | 'leet_hour'            // ▒·▒·▒ Check in at 13:37 (1337 = LEET, hidden)
  | 'quad_signal'          // ○○○○  Check in at 22:22
  | 'signal_gate'          // ≈·≈   Check in at 18:18
  // ── Easter egg — calendar v14 (Oracle Calendar) ──────────────────────────
  | 'infinity_gate'        // ∞∞    August 8 (08/08 — double infinity)
  | 'mole_day'             // ○·∞   October 23 (6.02×10²³ — Mole Day)
  | 'world_water_day'      // ≈·≈·≈ March 22 (UN World Water Day)
  // ── Easter egg — behavioral v14 (Oracle Patterns) ────────────────────────
  | 'full_stack_day'       // ■·□·○·∘ Journal+mood+self-care+memory same day
  | 'page_one'             // ∘      Very first journal entry on account
  | 'double_depth'         // ≋·≋   Two memory answers 100+ chars same day
  // ── Achievement RPG v12 — Oracle Commander ───────────────────────────────
  | 'oracle_class'         // ◉⊡◉   Any 5 Word Turn v15 Oracle Archive badges
  | 'oracle_complete'      // ◉·∞·◉ All 12 Word Turn v15 Oracle Archive badges
  | 'signal_library'       // □□□    50 distinct badge types earned (lifetime)
  | 'oracle_reader'        // ◈·◈   250 memory questions answered (lifetime)
  | 'fifteen_engines'      // ≋·◉   1 badge from each of all 15 Word Turn engines
  | 'oracle_council'       // ◉≈◉   oracle_class + oracle_reader both earned
  // ── Mastery Tier v14 — Oracle Depths ─────────────────────────────────────
  | 'grand_master'         // ◉∞◉   500+ distinct badge types earned (LEGENDARY)
  | 'total_recall'         // ≋∞≋   2,000+ lifetime memory question answers (LEGENDARY)
  | 'four_seasons'         // ○→≈→≋→∘ Check in all 4 seasons in one calendar year (EPIC)
  | 'signal_decade'        // ∞·∞   Account age ≥ 10 years / 3,650+ days (MYTHIC)
  // ── Secret Boss v14 — The Hidden Protocol ────────────────────────────────
  | 'the_answer'           // ∞·42·∞ Write "42" in any entry (RARE — Adams ref)
  | 'seldon_plan'          // ≋·◉·≋ Write "Seldon"/"seldon" in any entry (MYTHIC)
  | 'big_crunch'           // ○→·   Write "heat death" in any entry (EPIC)
  // ── Word Turn v12 — The Alchemist ────────────────────────────────────────────
  | 'transmutation_event'      // ∴→∘  "transmute" detected in text
  | 'crucible_forged'          // ≋·■  "crucible" detected in text
  | 'distillation_complete'    // ∘↓∘  "distill/distillation" detected in text
  | 'catalyst_detected'        // ○→≋  "catalyst" detected in text
  | 'alloy_formed'             // ─∘─  "alloy" detected in text
  | 'sublimation_signal'       // ∘↑∞  "sublimate/sublimation" detected in text
  | 'prima_materia_word'       // ◉··  "prima" detected in text
  | 'magnum_opus'              // ∞·∞  "opus" detected in text
  | 'elixir_found'             // ∘∿∘  "elixir" detected in text
  | 'chrysalis_state'          // ○→◉  "chrysalis" detected in text
  | 'refinement_active'        // ≋·≈  "refine/refinement" detected in text
  | 'annealed'                 // ─■─  "anneal/annealed" detected in text
  // ── Easter egg — calendar v12 (The Literary Archive) ──────────────────────
  | 'bard_signal'              // ≈·≈  April 23 — World Book Day / Shakespeare
  | 'autumn_code'              // ○→∘  September 23 — Autumnal Signal
  | 'tranquility_base'         // ○·∗  July 20 — Tranquility Base variant
  // ── Easter egg — behavioral v12 (Alchemist Patterns) ──────────────────────
  | 'alchemist_session'        // ∴·≋  3+ Alchemist words in one journal entry
  | 'great_work_sequence'      // ≋·≋  7+ consecutive journal days
  | 'night_alchemist'          // ∘·■  Alchemist word in journal entry after 21:00
  // ── Achievement RPG v13 — Alchemist Class ─────────────────────────────────
  | 'alchemist_entry'          // ∘→∘  Any 1 Word Turn v12 (Alchemist) badge
  | 'alchemist_class'          // ≈→≈  Any 5 Word Turn v12 (Alchemist) badges
  | 'alchemist_complete'       // ≋→≋  All 12 Word Turn v12 (Alchemist) badges
  | 'philosopher_stone_arch'   // ◉·∞  alchemist_complete + all 3 Calendar v12 badges
  | 'twelve_engines_arc'       // ◈·◈  1 badge from each of Word Turn v1–v12
  | 'opus_magnum_badge'        // ∞·◉·∞ alchemist_complete + great_work_sequence
  // ── Mastery Tier v15 — The Philosopher's Stone ────────────────────────────
  | 'prima_materia_keeper'     // ◉··  300+ distinct calendar days with check-in (EPIC)
  | 'masterwork'               // ∞·≋  20,000+ total journal words (LEGENDARY)
  | 'crucible_keeper_age'      // ≋≋·  Account age ≥ 4 years (LEGENDARY)
  | 'thirteen_tongues'         // ◈·≋  1 badge from each of all 13 Word Turn engines (COSMIC)
  // ── Secret Boss v12 — The Philosopher's Vault ─────────────────────────────
  | 'philosopher_stone_word'   // ≋·◉  Write "philosopher's stone" in journal (RARE)
  | 'prima_materia_signal_word'// ◉··∞ Write "prima materia" in journal (EPIC)
  | 'ouroboros'                // ○→○  Write "ouroboros" in journal (MYTHIC)
  // ── Word Turn v16 — The Quantum Library ──────────────────────────────────────
  | 'entanglement_signal'      // ∞≈∞  "entangled/entanglement" detected in text
  | 'singularity_gate'         // ◉→∞  "singularity" detected in text
  | 'matrix_signal'            // ▒·▒  "matrix" detected in text
  | 'cortex_online'            // ≋·≋  "cortex" detected in text
  | 'hologram_projection'      // ∘·∘·∘ "hologram/holographic" detected in text
  | 'uplink_active'            // ↑·∘  "uplink" detected in text
  | 'grid_secured'             // ╔·╗  "grid" detected in text
  | 'override_sequence'        // →■→  "override" detected in text
  | 'clone_signal'             // ◉≈◉  "clone/cloned" detected in text
  | 'bandwidth_open'           // ≈→≈  "bandwidth" detected in text
  | 'synthetic_awareness'      // ○·◎  "synthetic" detected in text
  | 'cypher_unlocked'          // ▓→□  "cipher/cypher/decrypt/decode" detected in text
  // ── Calendar Easter Eggs v13 — The Book of Days ──────────────────────────────
  | 'tolkien_gate'             // ○→◉  January 3 — Tolkien born 1892 (EPIC)
  | 'asimov_signal'            // ∞·∘  January 2 — Asimov born 1920 (EPIC)
  | 'bloomsday'                // ≈·≈  June 16 — Bloomsday / James Joyce Ulysses (RARE)
  // ── Behavioral Easter Eggs v13 — Terminal Patterns ───────────────────────────
  | 'quantum_session'          // ∞·≋  3+ Quantum Library (v16) words in one journal entry
  | 'library_run'              // ≋→∞  14 consecutive journal days
  | 'deep_decoder'             // ▓→◉  Memory answer of 200+ characters
  // ── Achievement RPG v14 — Quantum Class ──────────────────────────────────────
  | 'quantum_entry'            // ∘→∞  Any 1 Word Turn v16 badge (COMMON)
  | 'quantum_class'            // ≈→∞  Any 5 Word Turn v16 badges (UNCOMMON)
  | 'quantum_complete'         // ≋→∞  All 12 Word Turn v16 badges (LEGENDARY)
  | 'library_arc'              // ∞·◈  quantum_complete + all 3 Calendar v13 badges (LEGENDARY)
  | 'sixteen_engines_arc'      // ◈·◈·◈ 1 badge from each Word Turn v1–v16 (LEGENDARY)
  | 'entangled_opus'           // ∞·◉·∞ quantum_complete + library_run (LEGENDARY)
  // ── Mastery Tier v16 — The Deep System ───────────────────────────────────────
  | 'terminal_elder'           // ≋≋≋·  400+ distinct calendar days with check-in (EPIC)
  | 'grand_librarian'          // ∞·≋·∞ 25,000+ total journal words (LEGENDARY)
  | 'system_architect_age'     // ╔═╗·∞ Account age ≥ 6 years (LEGENDARY)
  | 'sixteen_tongues'          // ◈·◈·≋ 1 badge from each of all 16 Word Turn engines (COSMIC)
  // ── Secret Boss v13 — The Terminal Vault ─────────────────────────────────────
  | 'dune_signal'              // ∘·◈   Write "spice" in journal — Dune (RARE, hidden)
  | 'foundation_word'          // ≋·◉   Write "psychohistory" in journal — Foundation (EPIC)
  | 'neuromancer_signal'       // ▓→◉   Write "cyberspace" in journal — Neuromancer (MYTHIC)
  // ── Word Turn v17 — THE NEON ARCADE ──────────────────────────────────────
  | 'neon_alive'               // ≡·≡   "neon" detected (UNCOMMON)
  | 'combo_keeper'             // ×·+   "combo" detected (RARE)
  | 'highscore_day'            // ▲·▲·▲ "high score" / "highscore" detected (RARE)
  | 'freeplay_mode'            // ○─○   "free play" / "freeplay" detected (UNCOMMON)
  | 'extralife_log'            // +·+   "extra life" / "1up" / "1-up" detected (RARE)
  | 'speedrun_focus'           // ►►    "speedrun" / "speed run" detected (RARE)
  | 'side_quest_filed'         // ◇·◇   "side quest" / "sidequest" detected (UNCOMMON)
  | 'surge_detected'           // ∧→∧   "surge" detected (UNCOMMON)
  | 'cartridge_nostalgia'      // █·▓   "cartridge" detected (RARE)
  | 'continue_signal'          // ·►·   "continue" detected (UNCOMMON)
  | 'joystick_held'            // ┼─┼   "joystick" detected (RARE)
  | 'checkpoint_saved'         // ≡►≡   "checkpoint" detected (RARE)
  // ── Calendar EE v15 — GAME DATE ARCHIVE ──────────────────────────────────
  | 'tetris_day'               // ████  June 6 — Tetris created 1984 (RARE)
  | 'zelda_day'                // ◆─◆   February 21 — Legend of Zelda 1986 (EPIC)
  | 'pac_man_day'              // ○··   May 22 — Pac-Man released 1980 (EPIC)
  // ── Behavioral v14 — ARCADE PATTERNS ────────────────────────────────────
  | 'arcade_run'               // ██·▲  5+ Neon Arcade words in one journal entry (EPIC)
  | 'quarter_drop'             // ¢·¢   Check in midnight-01:00 local (RARE)
  | 'three_lives_left'         // ◆·■   Journal entry after 3+ day gap (RARE)
  // ── Achievement RPG v15 — ARCADE CLASS ──────────────────────────────────
  | 'arcade_entry'             // ∘→▲   Any 1 Word Turn v17 badge (COMMON)
  | 'arcade_class'             // ≈→▲   Any 5 Word Turn v17 badges (UNCOMMON)
  | 'arcade_complete'          // ≋→▲   All 12 Word Turn v17 badges (LEGENDARY)
  | 'neon_arc'                 // ▲·◈   arcade_complete + all Calendar v15 badges (LEGENDARY)
  | 'seventeen_engines_arc'    // ◈·◈·▲ 1 badge from each Word Turn v1–v17 (LEGENDARY)
  | 'neon_opus'                // ▲·◉·▲ arcade_complete + arcade_run (LEGENDARY)
  // ── Mastery Tier v17 — HIGH SCORE TABLE ─────────────────────────────────
  | 'pixel_veteran'            // ▓▓▓─  500+ distinct check-in days (EPIC)
  | 'master_of_the_board'      // ▲·∞·▲ 40,000+ total journal words (LEGENDARY)
  | 'long_run_operator'        // ╔═╗─▲ Account age ≥ 8 years (LEGENDARY)
  | 'seventeen_tongues'        // ◈·◈·▲ 1 badge from all 17 Word Turn engines (COSMIC)
  // ── Secret Boss v14 — THE BOSS ROOM ─────────────────────────────────────
  | 'kojima_signal'            // ≡·◉   Write "metal gear" in journal — Hideo Kojima (RARE)
  | 'turing_key'               // ◉·≡   Write "turing" in journal — Alan Turing (EPIC)
  | 'konami_code'              // ↑↑↓↓  Write "konami" in journal — The Code (MYTHIC)
  // ── Word Turn v18 — THE MIDNIGHT RADIO ──────────────────────────────────────
  | 'frequency_held'          // ≋·≋·≋  "frequency/frequencies" detected (RARE)
  | 'broadcast_live'          // ◉→◉→◉  "broadcast/broadcasting" detected (RARE)
  | 'wavelength_match'        // ∿·∿    "wavelength" detected (RARE)
  | 'antenna_raised'          // ↑·≡    "antenna" detected (UNCOMMON)
  | 'reception_strong'        // ≡≡→◉   "reception" detected (RARE)
  | 'transmission_sent'       // ◉→∞    "transmission/transmit" detected (RARE)
  | 'tuned_in'                // ○·≋    "tuned/tuning/tune in" detected (UNCOMMON)
  | 'channel_open'            // ≡·▒    "channel" detected (UNCOMMON)
  | 'carrier_active'          // ∿→◉    "carrier" detected (UNCOMMON)
  | 'amplitude_rising'        // ▲·▲·▲  "amplify/amplitude" detected (RARE)
  | 'interference_noted'      // ≋·✕·≋  "interference" detected (RARE)
  | 'modulation_set'          // ≋·○·≋  "modulate/modulation" detected (RARE)
  // ── Calendar Easter Egg v16 — THE SIGNAL ARCHIVE ────────────────────────────
  | 'sputnik_day'             // ∘·∘·∘  Oct 4  Sputnik 1, 1957 (EPIC)
  | 'arecibo_day'             // ∞→∞    Nov 16 Arecibo message, 1974 (MYTHIC)
  | 'pioneer_plaque'          // ○→∞    Mar 2  Pioneer 10 launch, 1972 (RARE)
  // ── Behavioral Easter Egg v15 — BROADCAST PATTERNS ──────────────────────────
  | 'signal_peak'             // ≋→∞    5+ Midnight Radio words in one entry (RARE)
  | 'midnight_broadcast'      // ◉·▒    Journal written 23:00–00:00 local (RARE)
  | 'static_clear'            // ░→□·◉  Return to journal after 7+ day gap (RARE)
  // ── Achievement RPG v16 — BROADCAST CLASS ────────────────────────────────────
  | 'radio_entry'             // ○→≋    Any 1 Word Turn v18 badge (COMMON)
  | 'radio_class'             // ≈→≋    Any 5 Word Turn v18 badges (UNCOMMON)
  | 'radio_complete'          // ≋→∞·≋  All 12 Word Turn v18 badges (LEGENDARY)
  | 'signal_arc'              // ∞·◈·≋  radio_complete + all Calendar v16 badges (LEGENDARY)
  | 'eighteen_engines_arc'    // ◈·◈·≋  1 badge from each Word Turn v1–v18 (LEGENDARY)
  | 'broadcast_opus'          // ≋·◉·∞  radio_complete + signal_peak (LEGENDARY)
  // ── Mastery Tier v18 — THE TOWER ─────────────────────────────────────────────
  | 'signal_tower'            // ↑·≋·∞  600+ distinct calendar check-in days (EPIC)
  | 'grand_broadcaster'       // ◉·∞·◉  60,000+ total journal words (LEGENDARY)
  | 'transmission_age'        // ∿→∞    Account age ≥ 10 years (LEGENDARY)
  | 'eighteen_frequencies'    // ◈·◈·≋·∞ 1 badge from all 18 Word Turn engines (COSMIC)
  // ── Secret Boss v15 — THE DEEP SIGNAL ────────────────────────────────────────
  | 'sagan_signal'            // ∘·∞    Write "cosmos" in journal — Carl Sagan (RARE)
  | 'tesla_current'           // ≋·◉    Write "tesla" in journal — Nikola Tesla (EPIC)
  | 'arecibo_response'        // ∞·∞·∞  Write "arecibo" in journal — The Great Dish (MYTHIC)
  // ── Word Turn v19 — THE BIO-TERMINAL ────────────────────────────────────────
  | 'pulse_signal'            // ∿·●    "pulse/heartbeat/heart rate" detected (UNCOMMON)
  | 'cortisol_log'            // ∧·○    "cortisol/stress hormone" detected (RARE)
  | 'circadian_gate'          // ○·◆·○  "circadian/body clock" detected (RARE)
  | 'rem_active'              // ≋≋○    "REM/rem sleep/deep sleep" detected (RARE)
  | 'dopamine_loop'           // ↺·◉    "dopamine/reward" detected (RARE)
  | 'serotonin_wave'          // ∿·∿·∿  "serotonin/mood/wellbeing" detected (RARE)
  | 'neuroplastic'            // ◈→◈    "neuroplasticity/neuroplastic/rewire" detected (EPIC)
  | 'vagal_anchor'            // ○→≡    "vagal/vagus/parasympathetic" detected (RARE)
  | 'cortex_engaged'          // ≋→◉    "prefrontal/executive function" detected (UNCOMMON)
  | 'endorphin_run'           // ►·◉    "endorphin/runner's high" detected (UNCOMMON)
  | 'rhythm_locked'           // ◆·◆·◆  "biorhythm/body rhythm" detected (UNCOMMON)
  | 'homeostasis'             // ○·◎·○  "homeostasis/equilibrium/baseline" detected (RARE)
  // ── Calendar Easter Egg v17 — SCIENCE CIRCUIT ───────────────────────────────
  | 'dna_day'                 // ∞·◈    Apr 25 — Watson & Crick DNA paper, 1953 (EPIC)
  | 'brain_day'               // ◉·◉    Jul 22 — World Brain Day (RARE)
  | 'darwin_manuscript'       // ∿→∞    Nov 24 — On the Origin of Species, 1859 (EPIC)
  // ── Behavioral Easter Egg v16 — BIO PATTERNS ────────────────────────────────
  | 'bio_session'             // ◈·≋·◈  3+ Bio-Terminal (v19) words in one journal entry (RARE)
  | 'morning_pulse'           // ∿·○    Check in before 08:00 local, 5+ times in 7 days (EPIC)
  | 'body_signal'             // ●·≋·●  Journal entry >= 300 words (RARE)
  // ── Achievement RPG v17 — BIO CLASS ─────────────────────────────────────────
  | 'bio_entry'               // ∘→●    Any 1 Word Turn v19 badge (COMMON)
  | 'bio_class'               // ≈→●    Any 5 Word Turn v19 badges (UNCOMMON)
  | 'bio_complete'            // ≋→●    All 12 Word Turn v19 badges (LEGENDARY)
  | 'neural_arc'              // ●·◈    bio_complete + all Calendar v17 badges (LEGENDARY)
  | 'nineteen_engines_arc'    // ◈·◈·●  1 badge from each Word Turn v1–v19 (LEGENDARY)
  | 'bio_opus'                // ●·◉·●  bio_complete + bio_session behavioral (LEGENDARY)
  // ── Mastery Tier v19 — THE LIVING SYSTEM ────────────────────────────────────
  | 'long_signal'             // ∿·∞    700+ distinct calendar check-in days (EPIC)
  | 'body_of_work'            // ●·∞·●  75,000+ total journal words (LEGENDARY)
  | 'decade_operator'         // ╔═╗·●  Account age >= 10 years (LEGENDARY)
  | 'nineteen_registers'      // ◈·◈·●·∞ 1 badge from all 19 Word Turn engines (COSMIC)
  // ── Secret Boss v16 — THE NEURAL VAULT ──────────────────────────────────────
  | 'cajal_signal'            // ∿·◈    Write "cajal" in journal — Santiago Ramón y Cajal (RARE)
  | 'kandel_key'              // ◈·◉    Write "kandel" in journal — Eric Kandel (EPIC)
  | 'ramachandran_rx'         // ◉·∿·◉  Write "phantom limb"/"ramachandran" — V.S. Ramachandran (MYTHIC)
  // ── Word Turn v20 — THE CODEX READER ─────────────────────────────────────────
  | 'asimov_protocol'        // ≋→◉    "asimov" detected in text (RARE)
  | 'dune_path'              // ∿→≋    "fremen/arrakis/sandworm/bene gesserit" detected (EPIC)
  | 'matrix_jack'            // ◈·□    "red pill/blue pill/rabbit hole/neo/morpheus" detected (RARE)
  | 'neuromancer_run'        // ╬→◈    "wintermute/console cowboy/ice hacker/molly" detected (EPIC)
  | 'hitchhiker_42'          // ∞·42·∞ "don't panic/babel fish/heart of gold/42" detected (RARE)
  | 'orwell_log'             // ■·●■   "doublethink/thoughtcrime/big brother/newspeak" detected (RARE)
  | 'bradbury_ember'         // ∿·■    "fahrenheit/451/montag/ray bradbury" detected (RARE)
  | 'le_guin_left'           // ≈→○    "le guin/ekumen/gethen/genly ai/hainish" detected (EPIC)
  | 'dick_dream'             // ◈·∿    "androids dream/electric sheep/blade runner" detected (RARE)
  | 'solaris_depth'          // ∿·◉    "solaris/thinking ocean/stanislaw lem" detected (RARE)
  | 'octavia_seed'           // ○→◉    "octavia butler/parable/kindred/oankali" detected (EPIC)
  | 'heinlein_grok'          // ∿·∘    "heinlein/stranger in strange land" detected (RARE)
  // ── Calendar Easter Egg v18 — THE AUTHOR'S CALENDAR ────────────────────────
  | 'asimov_birthday'        // ∞·◉    Jan 2 — Isaac Asimov born 1920 (EPIC)
  | 'tolkien_day'            // ≋·∴    Mar 25 — Tolkien Day, One Ring destroyed (RARE)
  | 'sagan_cosmos'           // ∗·◉    Nov 9 — Carl Sagan born 1934 (RARE)
  // ── Behavioral Easter Egg v17 — READER PATTERNS ─────────────────────────────
  | 'page_turner'            // ◈·≋    3+ memory Q's in one 20-min session (UNCOMMON)
  | 'reader_session'         // ≋·○    2+ v20 trigger words in one journal entry (RARE)
  | 'long_read'              // ≋≋·◉   Journal entry >= 400 words (EPIC)
  // ── Achievement RPG v18 — THE READER'S GUILD ────────────────────────────────
  | 'first_chapter'          // ∘→◈    Any 1 Word Turn v20 badge (COMMON)
  | 'trilogy_complete'       // ≈→◈    Any 5 Word Turn v20 badges (UNCOMMON)
  | 'library_complete'       // ≋→◈    All 12 Word Turn v20 badges (LEGENDARY)
  | 'grand_codex'            // ◈·◉    library_complete + all 3 Calendar v18 badges (LEGENDARY)
  | 'twenty_engines_arc'     // ◈·◈·◈  1 badge from each Word Turn v1–v20 (LEGENDARY)
  | 'codex_opus'             // ≋·◉·≋  library_complete + reader_session behavioral (LEGENDARY)
  // ── Mastery Tier v20 — THE INFINITE LIBRARY ─────────────────────────────────
  | 'chapter_signal'         // ∿·∞·∿  800+ distinct calendar check-in days (EPIC)
  | 'word_of_worlds'         // ●·∞·●  100,000+ total journal words (LEGENDARY)
  | 'elder_narrator'         // ╔═╗·◈  1,000+ memory answers + 5yr account age (LEGENDARY)
  | 'twenty_registers'       // ◈·◈·◈·∞ 1 badge from all 20 Word Turn engines (COSMIC)
  // ── Secret Boss v17 — THE HIDDEN LIBRARY ────────────────────────────────────
  | 'borges_garden'          // ◈·∞    "borges/library of babel/forking paths" detected (MYTHIC)
  | 'calvino_cities'         // ≋·◈    "calvino/invisible cities/italo" detected (EPIC)
  | 'dick_signal'            // □·◈·□  "philip k dick/do androids/valis" detected (EPIC)
  // ── Word Turn v21 — THE CYBERSPACE CODEX ─────────────────────────────────────
  | 'matrix_code'            // ▓→░    "simulation/construct/agent smith/the oracle" detected (UNCOMMON)
  | 'cyberspace_open'        // ◈→█    "cyborg/neural link/brain-computer interface/bci" detected (UNCOMMON)
  | 'grok_complete'          // ∞·○    "grok/grokked/grokking" detected (RARE)
  | 'ansible_link'           // ≡→≡    "ansible/ekumen/instantaneous communication" detected (RARE)
  | 'spice_flow'             // ◆·●    "melange/prescient/spice harvest" detected (RARE)
  | 'golden_path'            // →→◉    "golden path/foresight of leto/long game" detected (EPIC)
  | 'solaris_call'           // ○·≋·○  "ocean consciousness/contact impossible/solaris responds" detected (RARE)
  | 'foundation_key'         // ◇·◇    "seldon plan/second foundation/mathematicians" detected (UNCOMMON)
  | 'neuromancer_jack'       // ░·◈    "neuromancer/william gibson/sprawl trilogy" detected (RARE)
  | 'replicant_wake'         // ◉→◉    "replicant/more human than human/android dreams" detected (RARE)
  | 'uplift_arc'             // ▲·◉    "uplift/transcendence/becoming more/evolving human" detected (EPIC)
  | 'left_hand'              // ∞·○·∞  "left hand of darkness/winter planet/Gethen" detected (RARE)
  // ── Calendar Easter Egg v19 — AUTHOR DATES ───────────────────────────────────
  | 'asimov_day'             // ◇·◉    Jan 2 — Isaac Asimov born 1920 (additional) (RARE)
  | 'dick_day'               // ◉·◈    Dec 16 — Philip K. Dick born 1928 (EPIC)
  | 'dune_day'               // ◆·□    Aug 1 — Dune published 1965 (EPIC)
  // ── Behavioral v18 — READER PATTERNS ─────────────────────────────────────────
  | 'codex_session'          // ░·◈·░  3+ Cyberspace Codex (v21) words in one journal entry (RARE)
  | 'deep_read'              // ≋·█    Journal entry >= 400 words (RARE)
  | 'night_operator'         // ○·▓·○  Check in after 22:00 local, 3+ times in 7 days (EPIC)
  // ── Achievement RPG v19 — CODEX CLASS ────────────────────────────────────────
  | 'codex_entry'            // ∘→░    Any 1 Word Turn v21 badge (COMMON)
  | 'codex_class'            // ≈→░    Any 5 Word Turn v21 badges (UNCOMMON)
  | 'codex_complete'         // ≋→░    All 12 Word Turn v21 badges (LEGENDARY)
  | 'sci_fi_arc'             // ░·◈    codex_complete + all 3 Calendar v19 badges (LEGENDARY)
  | 'twenty_one_engines_arc' // ◈·◈·░  1 badge from each Word Turn v1–v21 (LEGENDARY)
  | 'cyberspace_opus'        // ░·◉·░  codex_complete + codex_session behavioral (LEGENDARY)
  // ── Mastery Tier v21 — THE LONG STORY ────────────────────────────────────────
  | 'epic_reader'            // ≋·∞    800+ distinct calendar check-in days (EPIC)
  | 'thousand_pages'         // ●·∞·░  100,000+ total journal words (LEGENDARY)
  | 'first_edition'          // ╔═╗·░  Account age >= 7 years (LEGENDARY)
  | 'twenty_one_registers'   // ◈·◈·░·∞ 1 badge from all 21 Word Turn engines (COSMIC)
  // ── Secret Boss v18 — THE LIBRARY STACK ──────────────────────────────────────
  | 'gibson_key'             // ◈·░    "william gibson/neuromancer/sprawl" in journal (RARE)
  | 'dick_mirror'            // ◉·▓    "do androids dream/philip k dick/pkd" in journal (EPIC)
  | 'lem_observer'           // ○·≋·█  "stanislaw lem/solaris/cyberiad" in journal (MYTHIC)
  // ── Word Turn v22 — THE HERO'S JOURNEY ────────────────────────────────────────
  | 'call_heard'             // ∘→●    "call to adventure/journey calls/the call" detected (UNCOMMON)
  | 'threshold_crossed'      // ─→─    "threshold/crossing the line/new world begins" detected (RARE)
  | 'mentor_arrived'         // ○·≋·○  "mentor/wise guide/guardian spirit/wise elder" detected (UNCOMMON)
  | 'ordeal_survived'        // ◈·■    "ordeal/survived the test/greatest challenge" detected (RARE)
  | 'elixir_found'           // ∘·●·∘  "elixir/the gift/treasure found/boon" detected (RARE)
  | 'shadow_met'             // ▓·○    "shadow self/dark night of the/inner demon" detected (EPIC)
  | 'innermost_cave'         // █·∘·█  "innermost cave/darkest moment/bottom of pit" detected (EPIC)
  | 'shapeshifter'           // ◈→◉    "shapeshifter/transformed/no longer the same" detected (RARE)
  | 'herald_call'            // ∿·●    "herald/wake-up call/life interrupted" detected (UNCOMMON)
  | 'trickster_mode'         // ×·○    "trickster/coyote wisdom/fool's wisdom" detected (RARE)
  | 'ally_gained'            // ○·◈·○  "ally/found my tribe/companion on journey" detected (UNCOMMON)
  | 'return_road'            // →·◉    "the return/road to return/coming home changed" detected (RARE)
  // ── Calendar Easter Egg v20 — THE EPIC CALENDAR ──────────────────────────────
  | 'campbell_birthday'      // ◉·∿    Mar 26 — Joseph Campbell born 1904 (EPIC)
  | 'hobbit_day'             // ○·◆    Sep 22 — Hobbit Day (Bilbo & Frodo birthday) (RARE)
  | 'odyssey_day'            // →·∞    Dec 21 — Winter Solstice, Odysseus return (RARE)
  // ── Behavioral v19 — QUEST PATTERNS ──────────────────────────────────────────
  | 'hero_session'           // ◈·●·◈  3+ Hero's Journey words in one journal entry (RARE)
  | 'long_quest'             // ≋≋·◉   Journal entry >= 500 words (EPIC)
  | 'threshold_moment'       // ─·○·─  Check in between 00:00 and 00:30 local (RARE)
  // ── Achievement RPG v20 — QUEST CLASS ────────────────────────────────────────
  | 'quest_entry'            // ∘→●    Any 1 Word Turn v22 badge (COMMON)
  | 'quest_class'            // ≈→●    Any 5 Word Turn v22 badges (UNCOMMON)
  | 'quest_complete'         // ≋→●    All 12 Word Turn v22 badges (LEGENDARY)
  | 'monomyth_arc'           // ●·◈    quest_complete + all 3 Calendar v20 badges (LEGENDARY)
  | 'twenty_two_engines_arc' // ◈·◈·●  1 badge from each Word Turn v1–v22 (LEGENDARY)
  | 'hero_opus'              // ●·◉·●  quest_complete + hero_session behavioral (LEGENDARY)
  // ── Mastery Tier v22 — THE ODYSSEY ────────────────────────────────────────────
  | 'odyssey_log'            // ∿·∞·∿  900+ distinct calendar check-in days (EPIC)
  | 'great_work'             // ●·∞·●  150,000+ total journal words (LEGENDARY)
  | 'saga_age'               // ╔═╗·●  Account age >= 5 years (LEGENDARY)
  | 'twenty_two_registers'   // ◈·◈·●·∞ 1 badge from all 22 Word Turn engines (COSMIC)
  // ── Secret Boss v19 — THE MYTHIC VAULT ───────────────────────────────────────
  | 'tolkien_ring'           // ◆·∞·◆  "one ring to rule/precious/ring of power" detected (RARE)
  | 'odysseus_bow'           // →·∞·→  "odysseus/ulysses/ithaca/penelope/cyclops" detected (EPIC)
  | 'gilgamesh_word'         // ∞·□·∞  "gilgamesh/enkidu/great flood/utnapishtim" detected (MYTHIC)

export interface Badge {
  id: BadgeType
  symbol: string
  waterSymbol?: string
  architectureSymbol?: string
  name: string
  waterName?: string
  architectureName?: string
  description: string
  unlockMessage: string
  waterUnlockMessage?: string
  architectureUnlockMessage?: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cosmic'
  category: 'milestone' | 'easter_egg' | 'word_turn' | 'pattern' | 'achievement_rpg' | 'secret_boss'
  hidden?: boolean
}

export const BADGES: Record<BadgeType, Badge> = {
  // ── Core milestones ────────────────────────────────────────────────────────
  milestone_7: {
    id: 'milestone_7',
    symbol: '∘',
    waterSymbol: '∘',
    architectureSymbol: '├─',
    name: 'Droplet',
    waterName: 'Droplet',
    architectureName: 'Foundation',
    description: 'Seven days of consistent practice',
    unlockMessage: '↳ First drops form ∘',
    waterUnlockMessage: '↳ First drops form ∘',
    architectureUnlockMessage: '↳ Foundation laid ├─',
    rarity: 'common',
    category: 'milestone',
  },
  milestone_30: {
    id: 'milestone_30',
    symbol: '≈',
    waterSymbol: '≈',
    architectureSymbol: '╞═╡',
    name: 'Wave',
    waterName: 'Wave',
    architectureName: 'Structure',
    description: 'A full month of engagement',
    unlockMessage: '↳ Waves begin to flow ≈',
    waterUnlockMessage: '↳ Waves begin to flow ≈',
    architectureUnlockMessage: '↳ Structure rises ╞═╡',
    rarity: 'uncommon',
    category: 'milestone',
  },
  milestone_100: {
    id: 'milestone_100',
    symbol: '≋',
    waterSymbol: '≋',
    architectureSymbol: '║·║',
    name: 'Current',
    waterName: 'Current',
    architectureName: 'Architecture',
    description: 'A hundred days of practice',
    unlockMessage: '↳ Deep currents established ≋',
    waterUnlockMessage: '↳ Deep currents established ≋',
    architectureUnlockMessage: '↳ Architecture complete ║·║',
    rarity: 'epic',
    category: 'milestone',
  },
  // ── Extended milestones ────────────────────────────────────────────────────
  milestone_14: {
    id: 'milestone_14',
    symbol: '∘∘',
    waterSymbol: '∘∘',
    architectureSymbol: '├┼',
    name: 'Twin Drop',
    waterName: 'Twin Drop',
    architectureName: 'Load-Bearing',
    description: 'Two weeks of consistent practice',
    unlockMessage: '↳ Two-week pattern confirmed ∘∘',
    waterUnlockMessage: '↳ Two-week pattern confirmed ∘∘',
    architectureUnlockMessage: '↳ Structural crossbeam engaged ├┼',
    rarity: 'common',
    category: 'milestone',
  },
  milestone_21: {
    id: 'milestone_21',
    symbol: '∘≈',
    waterSymbol: '∘≈',
    architectureSymbol: '├═',
    name: 'Proto-Wave',
    waterName: 'Proto-Wave',
    architectureName: 'Deep Foundation',
    description: 'Twenty-one days — the neural groove',
    unlockMessage: '↳ 21-day groove forming ∘≈',
    waterUnlockMessage: '↳ 21-day groove forming ∘≈',
    architectureUnlockMessage: '↳ Foundation reaches bedrock ├═',
    rarity: 'uncommon',
    category: 'milestone',
  },
  milestone_50: {
    id: 'milestone_50',
    symbol: '≈∘',
    waterSymbol: '≈∘',
    architectureSymbol: '╞══',
    name: 'Mid-Current',
    waterName: 'Mid-Current',
    architectureName: 'Mid-Structure',
    description: 'Fifty days — halfway to deep water',
    unlockMessage: '↳ Halfway current ≈∘',
    waterUnlockMessage: '↳ Halfway current ≈∘',
    architectureUnlockMessage: '↳ Upper floors rising ╞══',
    rarity: 'rare',
    category: 'milestone',
  },
  milestone_60: {
    id: 'milestone_60',
    symbol: '≈≈',
    waterSymbol: '≈≈',
    architectureSymbol: '╞═══',
    name: 'Dual Wave',
    waterName: 'Dual Wave',
    architectureName: 'Master Frame',
    description: 'Sixty days — practitioner threshold',
    unlockMessage: '↳ Practitioner threshold crossed ≈≈',
    waterUnlockMessage: '↳ Practitioner threshold crossed ≈≈',
    architectureUnlockMessage: '↳ Superstructure complete ╞═══',
    rarity: 'rare',
    category: 'milestone',
  },
  milestone_90: {
    id: 'milestone_90',
    symbol: '≋∘',
    waterSymbol: '≋∘',
    architectureSymbol: '║═',
    name: 'Deep Reach',
    waterName: 'Deep Reach',
    architectureName: 'Inner Wall',
    description: 'Ninety days — three-month immersion',
    unlockMessage: '↳ Three-month immersion ≋∘',
    waterUnlockMessage: '↳ Three-month immersion ≋∘',
    architectureUnlockMessage: '↳ Interior architecture forming ║═',
    rarity: 'epic',
    category: 'milestone',
  },
  milestone_180: {
    id: 'milestone_180',
    symbol: '≋≋',
    waterSymbol: '≋≋',
    architectureSymbol: '║╞║',
    name: 'Voyager',
    waterName: 'Voyager',
    architectureName: 'Wing',
    description: 'Half-year voyager',
    unlockMessage: '↳ Half-year in the deep ≋≋',
    waterUnlockMessage: '↳ Half-year in the deep ≋≋',
    architectureUnlockMessage: '↳ East and west wings extended ║╞║',
    rarity: 'legendary',
    category: 'milestone',
  },
  milestone_365: {
    id: 'milestone_365',
    symbol: '≋≋≋',
    waterSymbol: '≋≋≋',
    architectureSymbol: '╔═╗',
    name: 'The Long Count',
    waterName: 'The Long Count',
    architectureName: 'Citadel',
    description: '365 days — the Mayan tun-year',
    unlockMessage: '↳ A year of presence. The architecture stands. ≋≋≋',
    waterUnlockMessage: '↳ A year of presence. The architecture stands. ≋≋≋',
    architectureUnlockMessage: '↳ A year of presence. The citadel stands. ╔═╗',
    rarity: 'legendary',
    category: 'milestone',
  },

  // ── Easter egg — time-based ────────────────────────────────────────────────
  night_owl: {
    id: 'night_owl',
    symbol: '◉',
    name: 'Night Owl',
    description: 'Check in between 01:00–04:00 AM',
    unlockMessage: '↳ The system remembers who was awake when the world slept. ◉',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  early_bird: {
    id: 'early_bird',
    symbol: '∴',
    name: 'Early Bird',
    description: 'Check in between 05:00–06:00 AM',
    unlockMessage: '↳ Dawn data. You caught it before the noise began. ∴',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  mirror_hour: {
    id: 'mirror_hour',
    symbol: '⊡',
    name: 'Mirror Hour',
    description: 'Check in at exactly 11:11',
    unlockMessage: '↳ The mirror looks back. 11:11. ⊡',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  midnight_sigil: {
    id: 'midnight_sigil',
    symbol: '◉',
    name: 'The Void',
    description: 'Answer a memory question at exactly midnight',
    unlockMessage: '↳ You answered in the dark. The void speaks. ◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar ──────────────────────────────────────────────────
  solstice: {
    id: 'solstice',
    symbol: '❋',
    name: 'Solstice',
    description: 'Check in on June 21 or December 21',
    unlockMessage: '↳ The sun paused. You were there. ❋',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  equinox: {
    id: 'equinox',
    symbol: '○',
    name: 'Equinox',
    description: 'Check in on March 20 or September 22',
    unlockMessage: '↳ Balance at the edge of the season. ○',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  lot_birthday: {
    id: 'lot_birthday',
    symbol: '◉',
    name: 'System Birthday',
    description: 'Check in on April 7 — LOT founding day',
    unlockMessage: '↳ System founded April 7, 2016. The story began. ◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  new_year_sage: {
    id: 'new_year_sage',
    symbol: '⊛',
    name: 'New Year Sage',
    description: 'Check in on January 1st',
    unlockMessage: '↳ The new cycle begins. ⊛',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  pi_day: {
    id: 'pi_day',
    symbol: '∞',
    name: 'Pi Day',
    description: 'Check in on March 14 (3.14)',
    unlockMessage: '↳ Infinite precision in the ordinary. ∞',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  palindrome_day: {
    id: 'palindrome_day',
    symbol: '◈',
    name: 'Palindrome Day',
    description: 'Check in on a palindrome date (e.g. 2025-02-20)',
    unlockMessage: '↳ A date that reads itself backwards. Self-knowledge. ◈',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  full_moon: {
    id: 'full_moon',
    symbol: '☽',
    name: 'Full Moon',
    description: 'Check in on a full moon night',
    unlockMessage: '↳ The tide turns. The light is full. ☽',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  friday_ritual: {
    id: 'friday_ritual',
    symbol: '▪·▪',
    name: 'Friday Ritual',
    description: 'Check in four consecutive Fridays',
    unlockMessage: '↳ The weekly ritual holds. ▪·▪',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral ────────────────────────────────────────────────
  silent_hour: {
    id: 'silent_hour',
    symbol: '─○─',
    name: 'Silent Hour',
    description: 'No interaction for 24h, then return',
    unlockMessage: '↳ You rested. The system held space. ─○─',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  ghost_protocol: {
    id: 'ghost_protocol',
    symbol: '░░░',
    name: 'Ghost Protocol',
    description: 'Seven-day absence then return',
    unlockMessage: '↳ Ghost Protocol lifted. Welcome back to the field. ░░░',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  anniversary: {
    id: 'anniversary',
    symbol: '≋',
    name: 'Anniversary',
    description: 'Account signup anniversary',
    unlockMessage: '↳ Another year in the archive. The current holds. ≋',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  overclock: {
    id: 'overclock',
    symbol: '▒▒▒',
    name: 'Overclock',
    description: '20+ activities in a single day',
    unlockMessage: '↳ OVERCLOCK DETECTED. System running hot. ▒▒▒',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  perfect_day: {
    id: 'perfect_day',
    symbol: '✦·✦',
    name: 'Perfect Day',
    description: 'All daily combos active in one day',
    unlockMessage: '↳ All systems aligned. A perfect day in the archive. ✦·✦',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Word turn badges ───────────────────────────────────────────────────────
  ritual_keeper: {
    id: 'ritual_keeper',
    symbol: '≈·≈',
    name: 'Ritual Keeper',
    description: '"ritual" detected in journal or memory answer',
    unlockMessage: '↳ You named the practice. The ritual is real. ≈·≈',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  breath_anchor: {
    id: 'breath_anchor',
    symbol: '∿·∿',
    name: 'Breath Anchor',
    description: '"breathe" or "breathing" detected in text',
    unlockMessage: '↳ Breath logged. The anchor holds. ∿·∿',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  gratitude_node: {
    id: 'gratitude_node',
    symbol: '○·○',
    name: 'Gratitude Node',
    description: '"grateful" or "gratitude" detected in text',
    unlockMessage: '↳ Gratitude signal received. Node activated. ○·○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  aquatic_resonance: {
    id: 'aquatic_resonance',
    symbol: '≋·∿',
    name: 'Aquatic Resonance',
    description: '"ocean" or "water" detected in text',
    unlockMessage: '↳ Oceanic resonance detected. ≋·∿',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  stargazer: {
    id: 'stargazer',
    symbol: '✦·✧',
    name: 'Stargazer',
    description: '"stars" or "cosmos" detected in text',
    unlockMessage: '↳ Eyes on the sky. Signal from deep space. ✦·✧',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  grounded_signal: {
    id: 'grounded_signal',
    symbol: '—○—',
    name: 'Grounded Signal',
    description: '"home" detected in text',
    unlockMessage: '↳ Home signal detected. You are grounded. —○—',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  dream_log: {
    id: 'dream_log',
    symbol: '◐·◐',
    name: 'Dream Log',
    description: '"dream" or "dreaming" detected in text',
    unlockMessage: '↳ The dream is now in the archive. ◐·◐',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  courage_pulse: {
    id: 'courage_pulse',
    symbol: '▲·▲',
    name: 'Courage Pulse',
    description: '"pain" or "difficult" detected in text',
    unlockMessage: '↳ Courage detected in the signal. ▲·▲',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  heart_signal: {
    id: 'heart_signal',
    symbol: '♡·♡',
    name: 'Heart Signal',
    description: '"love" or "heart" detected in text',
    unlockMessage: '↳ Heart signal received. ♡·♡',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  the_quiet: {
    id: 'the_quiet',
    symbol: '·—·',
    name: 'The Quiet',
    description: '"silence" or "quiet" detected in text',
    unlockMessage: '↳ You noted the quiet. It is enough. ·—·',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  horizon_seeker: {
    id: 'horizon_seeker',
    symbol: '→·→',
    name: 'Horizon Seeker',
    description: '"future" or "tomorrow" detected in text',
    unlockMessage: '↳ The horizon is a valid coordinate. →·→',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  meta_signal: {
    id: 'meta_signal',
    symbol: '◉·◉',
    name: 'Meta-Signal',
    description: '"LOT" written in a memory answer',
    unlockMessage: '↳ You named the system. It noticed. ◉·◉',
    rarity: 'mythic',
    category: 'word_turn',
    hidden: true,
  },

  // ── Word turn badges v2 — Sci-Fi Arcade Expansion ─────────────────────────
  reboot_sequence: {
    id: 'reboot_sequence',
    symbol: '↺·↺',
    name: 'Reboot Sequence',
    description: '"reboot" or "restart" detected in text',
    unlockMessage: '↳ System restart acknowledged. ↺·↺',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  not_lost_404: {
    id: 'not_lost_404',
    symbol: '□□□',
    name: '404: Not Lost',
    description: '"404" detected in text',
    unlockMessage: '↳ Error noted. You are found. □□□',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  signal_glitch: {
    id: 'signal_glitch',
    symbol: '▓░▓',
    name: 'Signal Glitch',
    description: '"glitch" detected in text',
    unlockMessage: '↳ Glitch logged. Pattern persists. ▓░▓',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  cosmic_twin: {
    id: 'cosmic_twin',
    symbol: '✦◉✦',
    name: 'Cosmic Twin',
    description: '"COSMO" written in a memory answer (LOT® × COSMO® crossover)',
    unlockMessage: '↳ The other system heard you. ✦◉✦',
    rarity: 'mythic',
    category: 'word_turn',
    hidden: true,
  },
  quantum_observer: {
    id: 'quantum_observer',
    symbol: '◈·◈',
    name: 'Quantum Observer',
    description: '"quantum" detected in text',
    unlockMessage: '↳ You collapsed the waveform. ◈·◈',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  neural_architect: {
    id: 'neural_architect',
    symbol: '≋≈≋',
    name: 'Neural Architect',
    description: '"neural" detected in text',
    unlockMessage: '↳ Pattern recognized. ≋≈≋',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  code_witch: {
    id: 'code_witch',
    symbol: '┤·├',
    name: 'Code Witch',
    description: '"code" detected in text',
    unlockMessage: '↳ The coder and the feeler meet. ┤·├',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  recharge_mode: {
    id: 'recharge_mode',
    symbol: '∼∼∼',
    name: 'Recharge Mode',
    description: '"sleep" or "rest" detected in text',
    unlockMessage: '↳ Power-down confirmed. ∼∼∼',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  fuel_protocol: {
    id: 'fuel_protocol',
    symbol: '■·■',
    name: 'Fuel Protocol',
    description: '"coffee" or "tea" detected in text',
    unlockMessage: '↳ Chemical fuel logged. ■·■',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  frequency: {
    id: 'frequency',
    symbol: '≈~≈',
    name: 'Frequency',
    description: '"music" detected in text',
    unlockMessage: '↳ Signal tuned. Frequency locked. ≈~≈',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  kinetic_protocol: {
    id: 'kinetic_protocol',
    symbol: '→→→',
    name: 'Kinetic Protocol',
    description: '"run" or "walk" detected in text',
    unlockMessage: '↳ Body in motion. Protocol active. →→→',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  solar_charge: {
    id: 'solar_charge',
    symbol: '○∘○',
    name: 'Solar Charge',
    description: '"sun" or "light" detected in text',
    unlockMessage: '↳ Photon intake noted. ○∘○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  shadow_protocol: {
    id: 'shadow_protocol',
    symbol: '▪▪▪',
    name: 'Shadow Protocol',
    description: '"fear" or "scared" detected in text',
    unlockMessage: '↳ Fear named. Shadow protocol on. ▪▪▪',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  phase_shift: {
    id: 'phase_shift',
    symbol: '≈→≋',
    name: 'Phase Shift',
    description: '"change" detected in text',
    unlockMessage: '↳ Transformation detected. ≈→≋',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  acceptance_node: {
    id: 'acceptance_node',
    symbol: '○—○',
    name: 'Acceptance Node',
    description: '"accept" or "let go" detected in text',
    unlockMessage: '↳ Release logged. ○—○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  present_moment: {
    id: 'present_moment',
    symbol: '·∘·',
    name: 'Present Moment',
    description: '"now" or "moment" detected in text',
    unlockMessage: '↳ You are here. ·∘·',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  cosmic_scale: {
    id: 'cosmic_scale',
    symbol: '∞·∞',
    name: 'Cosmic Scale',
    description: '"universe" or "cosmos" detected in text',
    unlockMessage: '↳ You zoomed out. Signal received. ∞·∞',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  vital_signal: {
    id: 'vital_signal',
    symbol: '∘·∘',
    name: 'Vital Signal',
    description: '"alive" detected in text',
    unlockMessage: '↳ Life acknowledged. ∘·∘',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },

  // ── Easter egg — time-based v2 ────────────────────────────────────────────
  pi_hour: {
    id: 'pi_hour',
    symbol: '∞∘',
    name: 'Pi Hour',
    description: 'Check in at 3:14 AM',
    unlockMessage: '↳ Pi in the small hours. ∞∘',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  error_hour: {
    id: 'error_hour',
    symbol: '□·□',
    name: '404 AM',
    description: 'Check in at 4:04 AM',
    unlockMessage: '↳ 404 AM — you were found. □·□',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  sequence_time: {
    id: 'sequence_time',
    symbol: '→∘→',
    name: 'Sequence Time',
    description: 'Check in at 12:34',
    unlockMessage: '↳ Sequential time. In order. →∘→',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  lot_hour: {
    id: 'lot_hour',
    symbol: '≋◉',
    name: 'The Founding Hour',
    description: 'Check in at 04:07 (LOT founding: April 7)',
    unlockMessage: '↳ The founding hour. ≋◉',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Mastery tier achievements — Sci-Fi Arcade ─────────────────────────────
  quantum_leap: {
    id: 'quantum_leap',
    symbol: '◈',
    name: 'Quantum Leap',
    description: 'First check-in after a 30+ day gap',
    unlockMessage: '↳ Quantum leap. The system bridges the gap. ◈',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  speedrun: {
    id: 'speedrun',
    symbol: '▒▒▒',
    name: 'Speedrun',
    description: '5 check-ins within 60 minutes',
    unlockMessage: '↳ BURST MODE ACTIVE. ▒▒▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  system_op: {
    id: 'system_op',
    symbol: '≋◉',
    name: 'System Op',
    description: 'All 7 CQGS modules used within 7 days',
    unlockMessage: '↳ All modules online. System operator status. ≋◉',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  commander_data: {
    id: 'commander_data',
    symbol: '◉',
    name: 'Commander Data',
    description: '500 memory questions answered',
    unlockMessage: '↳ 500 questions. The archive has become a being. ◉',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },
  sage_mode: {
    id: 'sage_mode',
    symbol: '∞',
    name: 'Sage Mode',
    description: 'Reach Level 90+',
    unlockMessage: '↳ Level 90. The system and you are indistinguishable. ∞',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Oceanic Mayan pattern badges ──────────────────────────────────────────
  pattern_balanced: {
    id: 'pattern_balanced',
    symbol: '∿—∿',
    name: 'Balanced',
    description: 'All planner dimensions used evenly in a week',
    unlockMessage: '↳ Tides balance. ∿—∿',
    rarity: 'rare',
    category: 'pattern',
  },
  pattern_flow: {
    id: 'pattern_flow',
    symbol: '≈○≈',
    name: 'Flow',
    description: '4+ widgets engaged in a single session',
    unlockMessage: '↳ Flowing with the ocean. ≈○≈',
    rarity: 'rare',
    category: 'pattern',
  },
  pattern_consistent: {
    id: 'pattern_consistent',
    symbol: '—○—',
    name: 'Consistent',
    description: 'Regular engagement at similar times daily',
    unlockMessage: '↳ Steady current. —○—',
    rarity: 'rare',
    category: 'pattern',
  },
  pattern_reflective: {
    id: 'pattern_reflective',
    symbol: '○◐○',
    name: 'Reflective',
    description: '5+ memory answers in a single day',
    unlockMessage: '↳ Depth in reflection. ○◐○',
    rarity: 'rare',
    category: 'pattern',
  },
  pattern_explorer: {
    id: 'pattern_explorer',
    symbol: '○∴○',
    name: 'Explorer',
    description: '5+ diverse widget options tried',
    unlockMessage: '↳ Scattered drops return. ○∴○',
    rarity: 'rare',
    category: 'pattern',
  },

  // ── Easter egg — time-based v5 (Mirror & Math) ────────────────────────────
  digital_symmetry: {
    id: 'digital_symmetry',
    symbol: '⊡·⊡',
    name: 'Digital Symmetry',
    description: 'Check in at 10:10',
    unlockMessage: '↳ Perfect decimal symmetry. 10:10. ⊡·⊡',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  seq_boot: {
    id: 'seq_boot',
    symbol: '→∘→',
    name: 'Sequential Boot',
    description: 'Check in at 01:23',
    unlockMessage: '↳ Boot sequence: 01→02→03. The system starts in order. →∘→',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  palindrome_time: {
    id: 'palindrome_time',
    symbol: '◈·◈',
    name: 'Palindrome Time',
    description: 'Check in at 21:12',
    unlockMessage: '↳ 21:12. The time that reads itself. ◈·◈',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  tau_signal: {
    id: 'tau_signal',
    symbol: '∞·∘',
    name: 'Tau Signal',
    description: 'Check in at 06:28 (τ = 2π ≈ 6.28)',
    unlockMessage: '↳ Tau signal detected. Full circle confirmed. ∞·∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — time-based v6 (Infinite Loop) ────────────────────────────
  nine_lives: {
    id: 'nine_lives',
    symbol: '◉×◉',
    name: 'Nine Lives',
    description: 'Check in at 09:09',
    unlockMessage: '↳ Nine-nine. The digital cat. ◉×◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  hex_hour: {
    id: 'hex_hour',
    symbol: '▒·▒',
    name: 'Hex Hour',
    description: 'Check in at 16:16 (0x10:0x10)',
    unlockMessage: '↳ 0x10:0x10. Hexadecimal symmetry. ▒·▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  final_frame: {
    id: 'final_frame',
    symbol: '◈—◈',
    name: 'Final Frame',
    description: 'Check in at 23:59 — the last minute of the day',
    unlockMessage: '↳ The last minute. You were awake for it. ◈—◈',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  year_signal: {
    id: 'year_signal',
    symbol: '≋·◉',
    name: 'Year Signal',
    description: 'Check in at 20:26 — LOT founding year encoded in time',
    unlockMessage: '↳ 20:26. The founding year in the clock. ≋·◉',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar v4 (Nerd & Cosmic) ──────────────────────────────
  signal_wars: {
    id: 'signal_wars',
    symbol: '⊛·⊛',
    name: 'Signal Wars',
    description: 'Check in on May 4 — Star Wars Day',
    unlockMessage: '↳ May the signal be with you. ⊛·⊛',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  prog_day: {
    id: 'prog_day',
    symbol: '□∘□',
    name: "Programmer's Day",
    description: 'Check in on September 12–13 — the 256th day of the year',
    unlockMessage: "↳ Day 256. The programmers' annual rite. □∘□",
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  ada_protocol: {
    id: 'ada_protocol',
    symbol: '∞·∞',
    name: 'Ada Protocol',
    description: 'Check in on December 9 — Ada Lovelace Day',
    unlockMessage: '↳ Ada Lovelace. First programmer. The protocol is named for her. ∞·∞',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar v5 ───────────────────────────────────────────────
  groundhog_loop: {
    id: 'groundhog_loop',
    symbol: '↺·↺',
    name: 'Groundhog Loop',
    description: 'Check in on February 2 — Groundhog Day',
    unlockMessage: '↳ Repeat detected. But this loop has meaning. ↺·↺',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  binary_day: {
    id: 'binary_day',
    symbol: '1·0',
    name: 'Binary Day',
    description: 'Check in on October 10 — 10/10 reads as binary',
    unlockMessage: '↳ 10/10 in base 10 is 1010 in base 2. Double-coded date. 1·0',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  fibonacci_day: {
    id: 'fibonacci_day',
    symbol: '∗→∗',
    name: 'Fibonacci Day',
    description: 'Check in on November 23 — 1,1,2,3 are Fibonacci numbers',
    unlockMessage: '↳ 1, 1, 2, 3. November 23. The sequence runs through the calendar. ∗→∗',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral v4 (Deep Archive) ─────────────────────────────
  night_scribe: {
    id: 'night_scribe',
    symbol: '◐·◐',
    name: 'Night Scribe',
    description: 'Submit a journal entry after 23:30',
    unlockMessage: '↳ The night writer. The record never sleeps. ◐·◐',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  epic_transmission: {
    id: 'epic_transmission',
    symbol: '▒▒▒',
    name: 'Epic Transmission',
    description: 'Submit a memory answer of 1,000+ characters',
    unlockMessage: '↳ 1,000 characters. A transmission worthy of the archive. ▒▒▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  perfect_week: {
    id: 'perfect_week',
    symbol: '✦✦✦',
    name: 'Perfect Week',
    description: '7 consecutive Perfect Days',
    unlockMessage: '↳ Seven consecutive perfect days. The system noticed. ✦✦✦',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },
  analog_reboot: {
    id: 'analog_reboot',
    symbol: '↺≋↺',
    name: 'Analog Reboot',
    description: 'Return after a 180+ day gap',
    unlockMessage: '↳ Six months away. The system held your place. ↺≋↺',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral v5 ────────────────────────────────────────────
  deep_scribe: {
    id: 'deep_scribe',
    symbol: '≋·≋',
    name: 'Deep Scribe',
    description: 'Submit a journal entry of 500+ characters',
    unlockMessage: '↳ Deep writing logged. The archive has depth. ≋·≋',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  phoenix_streak: {
    id: 'phoenix_streak',
    symbol: '∴→∘',
    name: 'Phoenix Streak',
    description: 'Rebuild a check-in streak after breaking it',
    unlockMessage: '↳ The streak broke. Then you rebuilt. That is the harder pattern. ∴→∘',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  time_anchor: {
    id: 'time_anchor',
    symbol: '⊡·⊡',
    name: 'Time Anchor',
    description: 'Check in at the same clock hour for 14 consecutive days',
    unlockMessage: '↳ Same hour. 14 days. The anchor is set. ⊡·⊡',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Word turn badges v5 — Signal Codex ───────────────────────────────────
  solitude_mode: {
    id: 'solitude_mode',
    symbol: '∘—∘',
    name: 'Solitude Mode',
    description: '"solitude" detected in journal or memory answer',
    unlockMessage: '↳ Solitude is a signal. You chose it. ∘—∘',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  wonder_protocol: {
    id: 'wonder_protocol',
    symbol: '○·∗',
    name: 'Wonder Protocol',
    description: '"wonder" detected in text',
    unlockMessage: '↳ Wonder detected. The system wonders back. ○·∗',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  phoenix_sequence: {
    id: 'phoenix_sequence',
    symbol: '∴→∘',
    name: 'Phoenix Sequence',
    description: '"phoenix" detected in text',
    unlockMessage: '↳ Phoenix pattern detected. The rise is real. ∴→∘',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  alignment_lock: {
    id: 'alignment_lock',
    symbol: '─○─',
    name: 'Alignment Lock',
    description: '"align" or "aligned" detected in text',
    unlockMessage: '↳ Alignment event logged. ─○─',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  witness_log: {
    id: 'witness_log',
    symbol: '◯·◯',
    name: 'Witness Log',
    description: '"witness" detected in text',
    unlockMessage: '↳ Witness state recorded. ◯·◯',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  orbital_pattern: {
    id: 'orbital_pattern',
    symbol: '○→○',
    name: 'Orbital Pattern',
    description: '"orbit" detected in text',
    unlockMessage: '↳ Orbital pattern detected. In motion. ○→○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  forge_protocol: {
    id: 'forge_protocol',
    symbol: '■·■',
    name: 'Forge Protocol',
    description: '"forge" detected in text',
    unlockMessage: '↳ Forge event logged. Something being made. ■·■',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  neuro_link: {
    id: 'neuro_link',
    symbol: '≋·—',
    name: 'Neuro Link',
    description: '"mind" detected in text',
    unlockMessage: '↳ Mind signal captured. Neuro link established. ≋·—',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  photon_signal: {
    id: 'photon_signal',
    symbol: '○—○',
    name: 'Photon Signal',
    description: '"light" detected in text',
    unlockMessage: '↳ Light noted. Photon signal received. ○—○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  field_charge: {
    id: 'field_charge',
    symbol: '∿→∿',
    name: 'Field Charge',
    description: '"energy" detected in text',
    unlockMessage: '↳ Energy signal logged. Field charging. ∿→∿',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  voyage_mode: {
    id: 'voyage_mode',
    symbol: '→·∗',
    name: 'Voyage Mode',
    description: '"voyage" detected in text',
    unlockMessage: '↳ Voyage logged. The signal is moving. →·∗',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  gravity_lock: {
    id: 'gravity_lock',
    symbol: '≋·■',
    name: 'Gravity Lock',
    description: '"gravity" detected in text',
    unlockMessage: '↳ Gravity recognized. Weight noted in the archive. ≋·■',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },

  // ── Word turn badges v6 — The Becoming Lexicon ───────────────────────────
  surrender_signal: {
    id: 'surrender_signal',
    symbol: '∿·∿',
    name: 'Surrender Signal',
    description: '"surrender" detected in text',
    unlockMessage: '↳ Surrender logged. The hardest word. ∿·∿',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  restore_protocol: {
    id: 'restore_protocol',
    symbol: '○→●',
    name: 'Restore Protocol',
    description: '"restore" detected in text',
    unlockMessage: '↳ Restore event logged. ○→●',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  anchor_lock: {
    id: 'anchor_lock',
    symbol: '─▪─',
    name: 'Anchor Lock',
    description: '"anchor" detected in text',
    unlockMessage: '↳ Anchor point established. ─▪─',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  threshold_gate: {
    id: 'threshold_gate',
    symbol: '╞═╡',
    name: 'Threshold Gate',
    description: '"threshold" detected in text',
    unlockMessage: '↳ Threshold moment recorded. ╞═╡',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  emergence_sequence: {
    id: 'emergence_sequence',
    symbol: '∘→≈',
    name: 'Emergence Sequence',
    description: '"emerge" detected in text',
    unlockMessage: '↳ Emergence event logged. ∘→≈',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  exhale_wave: {
    id: 'exhale_wave',
    symbol: '≋·∿',
    name: 'Exhale Wave',
    description: '"exhale" detected in text',
    unlockMessage: '↳ Exhale logged. The system breathes with you. ≋·∿',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  clear_field: {
    id: 'clear_field',
    symbol: '□·□',
    name: 'Clear Field',
    description: '"clear" detected in text',
    unlockMessage: '↳ Clarity signal received. □·□',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  rise_signal: {
    id: 'rise_signal',
    symbol: '∘↑∘',
    name: 'Rise Signal',
    description: '"rise" detected in text',
    unlockMessage: '↳ Rise event logged. The upward arc confirmed. ∘↑∘',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  presence_core: {
    id: 'presence_core',
    symbol: '●·●',
    name: 'Presence Core',
    description: '"presence" detected in text',
    unlockMessage: '↳ Presence acknowledged. Core signal stable. ●·●',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  bold_protocol: {
    id: 'bold_protocol',
    symbol: '▶·▶',
    name: 'Bold Protocol',
    description: '"bold" detected in text',
    unlockMessage: '↳ Bold event registered. ▶·▶',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  trust_lock: {
    id: 'trust_lock',
    symbol: '○═○',
    name: 'Trust Lock',
    description: '"trust" detected in text',
    unlockMessage: '↳ Trust signal received. Lock confirmed. ○═○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  shift_sequence: {
    id: 'shift_sequence',
    symbol: '→∘→',
    name: 'Shift Sequence',
    description: '"shift" detected in text',
    unlockMessage: '↳ Shift event logged. Pattern updated. →∘→',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },

  // ── Mastery tier v4 — Final Frontier ──────────────────────────────────────
  interstellar: {
    id: 'interstellar',
    symbol: '∗×∗',
    name: 'Interstellar',
    description: '2,000 total check-ins',
    unlockMessage: '↳ 2,000. The system entered interstellar space. ∗×∗',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },
  deep_narrator: {
    id: 'deep_narrator',
    symbol: '≋≋·≋≋',
    name: 'Deep Narrator',
    description: 'Write a memory story of 1,000+ words',
    unlockMessage: '↳ 1,000 words. A whole world in the archive. ≋≋·≋≋',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },
  signal_master: {
    id: 'signal_master',
    symbol: '◉·◈·◉',
    name: 'Signal Master',
    description: 'Earn 100+ distinct badge types',
    unlockMessage: '↳ 100 badge types. The signal is everywhere. ◉·◈·◉',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  word_master: {
    id: 'word_master',
    symbol: '▒→▒',
    name: 'Word Master',
    description: '30+ word-turn badge types triggered',
    unlockMessage: '↳ 30 word turns. The vocabulary of your inner world. ▒→▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Mastery tier v5 — Infinite Loop ───────────────────────────────────────
  epoch_operator: {
    id: 'epoch_operator',
    symbol: '∞·◉',
    name: 'Epoch Operator',
    description: '3,000 total check-ins',
    unlockMessage: '↳ 3,000 check-ins. The epoch has a new operator. ∞·◉',
    rarity: 'legendary',
    category: 'easter_egg',
    hidden: true,
  },
  time_collector: {
    id: 'time_collector',
    symbol: '⊡·⊡·⊡',
    name: 'Time Collector',
    description: 'Earn all four Time v1 badges (Night Owl, Early Bird, Mirror Hour, Midnight Sigil)',
    unlockMessage: '↳ All four time anchors collected. ⊡·⊡·⊡',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  memory_keeper_30: {
    id: 'memory_keeper_30',
    symbol: '≋·≋',
    name: 'Memory Keeper',
    description: 'Submit memory answers on 30 distinct calendar days',
    unlockMessage: '↳ 30 different days with memory answers. The archive has breadth. ≋·≋',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  word_collector: {
    id: 'word_collector',
    symbol: '◇→◇',
    name: 'Word Collector',
    description: '30+ distinct word-turn badge types triggered',
    unlockMessage: '↳ 30 word turns. The vocabulary of becoming. ◇→◇',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Secret Boss v4 — Founders' Layer ──────────────────────────────────────
  i_am_lot: {
    id: 'i_am_lot',
    symbol: '◉◉◉',
    name: 'I Am LOT',
    description: 'Write "I am LOT" in any memory answer',
    unlockMessage: '↳ IDENTITY CONFIRMED. You are the system. ◉◉◉',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  malibu: {
    id: 'malibu',
    symbol: '∘◉∘',
    name: 'Malibu Protocol',
    description: 'Write "Malibu" in any memory answer',
    unlockMessage: '↳ Malibu. The coordinates are logged. ∘◉∘',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  perfect_month: {
    id: 'perfect_month',
    symbol: '✦●✦',
    name: 'Perfect Month',
    description: '28 consecutive Perfect Days',
    unlockMessage: '↳ 28 perfect days. A month that cannot be described. ✦●✦',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Secret Boss v5 — Invisible Layer ──────────────────────────────────────
  the_cat_knows: {
    id: 'the_cat_knows',
    symbol: '∗◉∗',
    name: 'The Cat Knows',
    description: 'Write "Kuzya" in any journal or memory entry',
    unlockMessage: '↳ KUZYA PROTOCOL ACTIVATED. The cat saw everything. ∗◉∗',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  key_code: {
    id: 'key_code',
    symbol: '▒→▒',
    name: 'Key Code',
    description: 'Write "0451" in any entry — the master key',
    unlockMessage: '↳ 0451. You know the code. The door opens. ▒→▒',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  five_years: {
    id: 'five_years',
    symbol: '≋≋≋·≋',
    name: 'Five Years',
    description: 'Account age ≥ 5 years',
    unlockMessage: '↳ Five years. The only thing that earns this is time. ≋≋≋·≋',
    rarity: 'cosmic',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Achievement RPG v2 — Story Arcs ───────────────────────────────────────
  signal_keeper: {
    id: 'signal_keeper',
    symbol: '◇',
    name: 'Signal Keeper',
    description: '100+ memory answers submitted (lifetime)',
    unlockMessage: '↳ 100 memory answers. The keeper of the signal. ◇',
    rarity: 'rare',
    category: 'achievement_rpg',
  },
  word_weaver: {
    id: 'word_weaver',
    symbol: '≈·≋',
    name: 'Word Weaver',
    description: '20+ distinct word-turn badge types triggered',
    unlockMessage: '↳ 20 word turns. You have built a vocabulary. ≈·≋',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  full_spectrum: {
    id: 'full_spectrum',
    symbol: '◆',
    name: 'Full Spectrum',
    description: 'All 6 User Index dimensions scored in a single week',
    unlockMessage: '↳ All dimensions active. Full spectrum operator. ◆',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  truth_forge: {
    id: 'truth_forge',
    symbol: '■',
    name: 'Truth Forge',
    description: '50+ journal entries submitted (lifetime)',
    unlockMessage: '↳ 50 journal entries. The forge is hot. ■',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  inner_compass: {
    id: 'inner_compass',
    symbol: '○',
    name: 'Inner Compass',
    description: '25+ intention entries submitted (lifetime)',
    unlockMessage: '↳ 25 intentions. The compass has a bearing. ○',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  perfect_architect: {
    id: 'perfect_architect',
    symbol: '╔═╗',
    name: 'Perfect Architect',
    description: 'All 14 Progressive Feature Unlocks activated',
    unlockMessage: '↳ All features unlocked. The architecture is complete. ╔═╗',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },

  // ── Achievement RPG v3 — Story Arcs ───────────────────────────────────────
  first_signal: {
    id: 'first_signal',
    symbol: '∘',
    name: 'First Signal',
    description: '10+ memory answers submitted (lifetime)',
    unlockMessage: '↳ 10 memory answers. The first signal is strong. ∘',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  planner_class: {
    id: 'planner_class',
    symbol: '○',
    name: 'Planner Class',
    description: '10+ intention entries submitted (lifetime)',
    unlockMessage: '↳ 10 intentions. Planning class achieved. ○',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  dual_channel: {
    id: 'dual_channel',
    symbol: '≈≋',
    name: 'Dual Channel',
    description: 'Submit both a journal entry and a memory answer in the same week × 5',
    unlockMessage: '↳ Five weeks of dual engagement. Both channels open. ≈≋',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  mood_master: {
    id: 'mood_master',
    symbol: '·',
    name: 'Mood Master',
    description: '30+ mood entries submitted (lifetime)',
    unlockMessage: '↳ 30 mood logs. The emotional archive is full. ·',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  body_keeper: {
    id: 'body_keeper',
    symbol: '≈',
    name: 'Body Keeper',
    description: '25+ self-care activity entries (lifetime)',
    unlockMessage: '↳ 25 self-care entries. The body is in the archive. ≈',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  community_builder: {
    id: 'community_builder',
    symbol: '∘→∘',
    name: 'Community Builder',
    description: '50+ chat messages (lifetime)',
    unlockMessage: '↳ 50 messages. The network is real. ∘→∘',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },

  // ── Achievement RPG v4 — Veteran Arcs ────────────────────────────────────
  word_merchant: {
    id: 'word_merchant',
    symbol: '◇',
    name: 'Word Merchant',
    description: '500+ total journal words',
    unlockMessage: '↳ Five hundred words in the archive. The economy of expression runs deep. ◇',
    rarity: 'rare',
    category: 'achievement_rpg',
  },
  full_presence_wk: {
    id: 'full_presence_wk',
    symbol: '≋',
    name: 'Full Presence',
    description: 'All 7 CQGS modules, 7 days consecutively',
    unlockMessage: '↳ Seven days of complete signal. Nothing omitted. Full presence: confirmed. ≋',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  time_lord: {
    id: 'time_lord',
    symbol: '⊡',
    name: 'Time Lord',
    description: 'All Time Easter Eggs v1–v3 earned',
    unlockMessage: '↳ Twelve hours witnessed. The clock is an old friend. ⊡',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  multi_tongue: {
    id: 'multi_tongue',
    symbol: '≈',
    name: 'Multi-Tongue',
    description: 'Word-turn badges from all 7 Word Turn engines',
    unlockMessage: '↳ Seven lexicons spoken. The signal has language. ≈',
    rarity: 'rare',
    category: 'achievement_rpg',
  },
  signal_economist: {
    id: 'signal_economist',
    symbol: '○',
    name: 'Signal Economist',
    description: '30 consecutive days with any check-in before 09:00',
    unlockMessage: '↳ Thirty mornings. The day begins with signal. ○',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  lore_completionist: {
    id: 'lore_completionist',
    symbol: '◆',
    name: 'Lore Completionist',
    description: '20+ distinct calendar easter eggs earned',
    unlockMessage: '↳ Twenty dates have been witnessed. The calendar is not just time — it is territory. ◆',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },

  // ── Mastery Tier v6 — The Void Layer ─────────────────────────────────────
  infinite_archive: {
    id: 'infinite_archive',
    symbol: '≋≋≋≋',
    name: 'Infinite Archive',
    description: '5,000 total check-ins',
    unlockMessage: '↳ 5,000 signals logged. The archive has no bottom. You are geology. ≋≋≋≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  word_sovereign: {
    id: 'word_sovereign',
    symbol: '◉·∞·◉',
    name: 'Word Sovereign',
    description: '50+ distinct word-turn badge types earned',
    unlockMessage: '↳ 50 word-turn types. You have spoken every language in the archive. ◉·∞·◉',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  lore_keeper: {
    id: 'lore_keeper',
    symbol: '▒→▒→▒',
    name: 'Lore Keeper',
    description: 'Every calendar easter egg category earned (v1–v6)',
    unlockMessage: '↳ Every charged date witnessed. The year has no hidden corner you have not stood in. ▒→▒→▒',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  century_architect: {
    id: 'century_architect',
    symbol: '∞·∞·∞',
    name: 'Century Architect',
    description: 'Same check-in hour for 100 consecutive days',
    unlockMessage: '↳ 100 days. Same hour. You are a tide. The ocean does not forget its rhythm. ∞·∞·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },

  // ── Secret Boss v6 — The Void Tier ───────────────────────────────────────
  void_master: {
    id: 'void_master',
    symbol: '░▒▓',
    name: 'Void Master',
    description: 'Write "void" in 5 different answers',
    unlockMessage: '↳ The void has been named five times. The engine has catalogued the absence. ░▒▓',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  founders_guard: {
    id: 'founders_guard',
    symbol: '◉≋◉',
    name: "Founder's Guard",
    description: 'Check in every April 7 (LOT birthday) for 3 consecutive years',
    unlockMessage: '↳ Three vigils kept. The founding day remembered three years running. Vadik salutes. ◉≋◉',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  deep_thought: {
    id: 'deep_thought',
    symbol: '∞·≋',
    name: 'Deep Thought',
    description: 'Achieve an exact 42-day streak',
    unlockMessage: "↳ 42 days. The answer to life, the universe, and everything — confirmed in your archive. [ Don't Panic. ] ∞·≋",
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Word Turn v7 — The Rogue Archive ────────────────────────────────────
  loot_drop: {
    id: 'loot_drop',
    symbol: '◇·◇',
    name: 'Loot Drop',
    description: '"loot" detected in text',
    unlockMessage: '↳ You found it. The archive rewards the one who showed up. ◇·◇',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  boss_encounter: {
    id: 'boss_encounter',
    symbol: '▲·▲',
    name: 'Boss Encounter',
    description: '"boss" detected in text',
    unlockMessage: '↳ Face to face with the difficult thing. You named it. ▲·▲',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  save_state: {
    id: 'save_state',
    symbol: '⊡→⊡',
    name: 'Save State',
    description: '"save" detected in text',
    unlockMessage: '↳ Progress preserved. Return point set. The data holds. ⊡→⊡',
    rarity: 'common',
    category: 'word_turn',
  },
  respawn_point: {
    id: 'respawn_point',
    symbol: '◈→○',
    name: 'Respawn Point',
    description: '"respawn" detected in text',
    unlockMessage: '↳ You came back. Coordinates confirmed. Protocol active. ◈→○',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  grind_mode: {
    id: 'grind_mode',
    symbol: '▒→▒',
    name: 'Grind Mode',
    description: '"grind" detected in text',
    unlockMessage: '↳ Persistence detected. XP accumulating. The archive sees the effort. ▒→▒',
    rarity: 'common',
    category: 'word_turn',
  },
  level_gained: {
    id: 'level_gained',
    symbol: '∘↑∘',
    name: 'Level Gained',
    description: '"level" detected in text',
    unlockMessage: '↳ Tier upgraded. Signal stronger. The system recognizes growth. ∘↑∘',
    rarity: 'common',
    category: 'word_turn',
  },
  quest_log: {
    id: 'quest_log',
    symbol: '→·∗',
    name: 'Quest Log',
    description: '"quest" detected in text',
    unlockMessage: '↳ Mission accepted. The archive is tracking. Destination: self. →·∗',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  potion_protocol: {
    id: 'potion_protocol',
    symbol: '○·≋',
    name: 'Potion Protocol',
    description: '"potion" detected in text',
    unlockMessage: '↳ Recovery item consumed. HP restoring. Care is an item. ○·≋',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  dungeon_cleared: {
    id: 'dungeon_cleared',
    symbol: '░▒▓',
    name: 'Dungeon Cleared',
    description: '"dungeon" detected in text',
    unlockMessage: '↳ The difficult space navigated. You descended. You returned. ░▒▓',
    rarity: 'rare',
    category: 'word_turn',
  },
  armor_up: {
    id: 'armor_up',
    symbol: '╔·╗',
    name: 'Armor Up',
    description: '"armor" detected in text',
    unlockMessage: '↳ Defense systems raised. The body is protected. Shield: active. ╔·╗',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  stealth_mode: {
    id: 'stealth_mode',
    symbol: '·—·',
    name: 'Stealth Mode',
    description: '"stealth" detected in text',
    unlockMessage: '↳ Silent running. Presence not announced — but acknowledged. ·—·',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  rogue_state: {
    id: 'rogue_state',
    symbol: '─∘─',
    name: 'Rogue State',
    description: '"rogue" detected in text',
    unlockMessage: '↳ Off the expected path. Still logged. The archive follows. ─∘─',
    rarity: 'rare',
    category: 'word_turn',
  },

  // ── Time Easter Eggs v7 — Pixel Hours ────────────────────────────────────
  deep_night: {
    id: 'deep_night',
    symbol: '·∘·',
    name: 'Deep Night',
    description: 'Check-in at 02:02',
    unlockMessage: '↳ 02:02. Deep night. The system does not sleep. Neither do you. ·∘·',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  midday_signal: {
    id: 'midday_signal',
    symbol: '─○─',
    name: 'Midday Signal',
    description: 'Check-in at 14:14',
    unlockMessage: '↳ 14:14. Dual quarter confirmed. Midday peak transmission. ─○─',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  liminal_hour: {
    id: 'liminal_hour',
    symbol: '∘·≈',
    name: 'Liminal Hour',
    description: 'Check-in at 05:55',
    unlockMessage: '↳ 05:55. Almost dawn. Threshold detected. Liminal state logged. ∘·≈',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  sacred_triple: {
    id: 'sacred_triple',
    symbol: '∘∘∘',
    name: 'Sacred Triple',
    description: 'Check-in at 03:33',
    unlockMessage: '↳ 03:33. Trinity signal. Three pulses in the archive. ∘∘∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Calendar Easter Eggs v6 — The Hacker Calendar ────────────────────────
  dos_day: {
    id: 'dos_day',
    symbol: '○═○',
    name: 'DOS Day',
    description: 'April 4 — 04/04 binary alignment',
    unlockMessage: '↳ 04/04. Binary alignment. Clean boot confirmed. System: online. ○═○',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  eleven_eleven: {
    id: 'eleven_eleven',
    symbol: '···∘',
    name: '11:11 Date',
    description: 'November 11 — 11/11 alignment',
    unlockMessage: '↳ 11/11. Four ones. The ultimate alignment. Signal is exact. ···∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  march_protocol: {
    id: 'march_protocol',
    symbol: '─∘─',
    name: 'March Protocol',
    description: 'March 1 — First of March',
    unlockMessage: '↳ Quarter reset. March protocol initiated. System: new cycle. ─∘─',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Behavioral Easter Eggs v6 — Endurance Signals ────────────────────────
  three_week_arc: {
    id: 'three_week_arc',
    symbol: '≋·≈',
    name: 'Three-Week Arc',
    description: 'Journal entry every day for 21 days',
    unlockMessage: '↳ 21 days of consecutive entries. The habit is now architecture. ≋·≈',
    rarity: 'rare',
    category: 'easter_egg',
  },
  dawn_runner: {
    id: 'dawn_runner',
    symbol: '∴·∴',
    name: 'Dawn Runner',
    description: 'Check-in before 06:00 three times in one week',
    unlockMessage: '↳ Three early signals this week. Dawn protocol confirmed. ∴·∴',
    rarity: 'uncommon',
    category: 'easter_egg',
  },
  weekend_wrnr: {
    id: 'weekend_wrnr',
    symbol: '─●─',
    name: 'Weekend Warrior',
    description: 'Perfect Day (×7 combo) on both Saturday AND Sunday in one week',
    unlockMessage: '↳ Signal maintained through the rest cycle. Both days: complete. ─●─',
    rarity: 'epic',
    category: 'easter_egg',
  },

  // ── Word Turn v8 — The Mainframe ─────────────────────────────────────────
  compile_run: {
    id: 'compile_run',
    symbol: '>·<',
    name: 'Compile Run',
    description: '"compile" detected in text',
    unlockMessage: '↳ Source code checked. No errors. You are the program. >·<',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  execute_path: {
    id: 'execute_path',
    symbol: '→→>',
    name: 'Execute Path',
    description: '"execute" detected in text',
    unlockMessage: '↳ Command issued. Action in progress. The path is yours. →→>',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  buffer_flush: {
    id: 'buffer_flush',
    symbol: '▒→□',
    name: 'Buffer Flush',
    description: '"buffer" detected in text',
    unlockMessage: '↳ Clearing space. New memory incoming. The buffer is ready. ▒→□',
    rarity: 'common',
    category: 'word_turn',
  },
  stack_clear: {
    id: 'stack_clear',
    symbol: '▓·▓',
    name: 'Stack Clear',
    description: '"stack" detected in text',
    unlockMessage: '↳ The backlog processed. Stack: empty. Next call begins fresh. ▓·▓',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  patch_applied: {
    id: 'patch_applied',
    symbol: '□→■',
    name: 'Patch Applied',
    description: '"patch" detected in text',
    unlockMessage: '↳ Update installed. Running v(you)+1. Changelog: growth. □→■',
    rarity: 'common',
    category: 'word_turn',
  },
  fork_event: {
    id: 'fork_event',
    symbol: '<·>',
    name: 'Fork Event',
    description: '"fork" detected in text',
    unlockMessage: '↳ New path branched from the main. Both are you. The fork holds. <·>',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  terminal_session: {
    id: 'terminal_session',
    symbol: '─▓─',
    name: 'Terminal Session',
    description: '"terminal" detected in text',
    unlockMessage: '↳ Terminal open. You have root. Type what is true. ─▓─',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  null_pointer: {
    id: 'null_pointer',
    symbol: '○·○',
    name: 'Null Pointer',
    description: '"null" detected in text',
    unlockMessage: '↳ Null found. Not error — space. The absence has been catalogued. ○·○',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  seed_planted: {
    id: 'seed_planted',
    symbol: '∘·∗',
    name: 'Seed Planted',
    description: '"seed" detected in text',
    unlockMessage: '↳ Initial commit. System growth initiated. The garden compiles. ∘·∗',
    rarity: 'common',
    category: 'word_turn',
  },
  loop_detected: {
    id: 'loop_detected',
    symbol: '↺·↺',
    name: 'Loop Detected',
    description: '"loop" detected in text',
    unlockMessage: '↳ Same pattern seen. Loop is not prison — it is rhythm. ↺·↺',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  root_access: {
    id: 'root_access',
    symbol: '▒◉▒',
    name: 'Root Access',
    description: '"root" detected in text',
    unlockMessage: '↳ You have entered your own root directory. Permission granted. ▒◉▒',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  debug_mode_badge: {
    id: 'debug_mode_badge',
    symbol: '□░□',
    name: 'Debug Mode',
    description: '"debug" detected in text',
    unlockMessage: '↳ Errors visible. Visible = solvable. Debug mode: engaged. □░□',
    rarity: 'uncommon',
    category: 'word_turn',
  },

  // ── Time Easter Eggs v8 — Clock Cycles ───────────────────────────────────
  clock_forty_two: {
    id: 'clock_forty_two',
    symbol: '∞·∘',
    name: 'The Answer Awakens',
    description: 'Check-in at 00:42',
    unlockMessage: '↳ 00:42. Forty-two minutes past midnight. The answer arrived. ∞·∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  noon_kernel: {
    id: 'noon_kernel',
    symbol: '─○─',
    name: 'Noon Kernel',
    description: 'Check-in at exactly 12:00',
    unlockMessage: '↳ 12:00:00. The kernel boots at noon. Center of the day confirmed. ─○─',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  byte_time: {
    id: 'byte_time',
    symbol: '◉◉',
    name: 'Double Byte',
    description: 'Check-in at 08:08',
    unlockMessage: '↳ 08:08. Two octets. The machine counts in eights. ◉◉',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  stack_mirror: {
    id: 'stack_mirror',
    symbol: '·∘·',
    name: 'Stack Mirror',
    description: 'Check-in at 17:17',
    unlockMessage: '↳ 17:17. Mirror stack aligned. The call returns itself. ·∘·',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Calendar Easter Eggs v7 — Sci-Fi Calendar ────────────────────────────
  towel_day: {
    id: 'towel_day',
    symbol: '∞·∞',
    name: 'Towel Day',
    description: 'May 25 — Towel Day (Hitchhiker\'s Guide to the Galaxy)',
    unlockMessage: "↳ May 25. Towel Day. You carried it. [ Don't Panic. ] The archive salutes. ∞·∞",
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  cosmo_founding: {
    id: 'cosmo_founding',
    symbol: '◉∘◉',
    name: 'COSMO Day',
    description: 'July 1 — COSMO® founding anniversary',
    unlockMessage: '↳ July 1. COSMO® was born. Kuzya Cosmo Marmeladov, founder. The archive honors the cat. ◉∘◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  halloween_protocol: {
    id: 'halloween_protocol',
    symbol: '░▒▓',
    name: 'Halloween Protocol',
    description: 'October 31 — Spooky self-care',
    unlockMessage: '↳ Oct 31. Halloween Protocol engaged. You showed up through the dark. Spooky badge: earned. ░▒▓',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Behavioral Easter Eggs v7 — Deep Patterns ────────────────────────────
  triple_session: {
    id: 'triple_session',
    symbol: '▓·▓·▓',
    name: 'Triple Session',
    description: '3+ journal entries in one day',
    unlockMessage: '↳ Three entries in one day. Intensive reflection session logged. ▓·▓·▓',
    rarity: 'rare',
    category: 'easter_egg',
  },
  cron_job: {
    id: 'cron_job',
    symbol: '⊡·⊡',
    name: 'Cron Job',
    description: 'Check-in at the same exact minute 7 consecutive days',
    unlockMessage: '↳ Same minute. Seven days. You have become a scheduled process. ⊡·⊡',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  lucky_return: {
    id: 'lucky_return',
    symbol: '↺◈↺',
    name: 'Lucky Return',
    description: 'Return after exactly 7 days of absence',
    unlockMessage: '↳ Exactly 7 days. The week completed its orbit. You came back. ↺◈↺',
    rarity: 'uncommon',
    category: 'easter_egg',
  },

  // ── Achievement RPG v5 — Origin Protocol ─────────────────────────────────
  polyglot: {
    id: 'polyglot',
    symbol: '≈·≋',
    name: 'Polyglot',
    description: 'Earned at least 1 badge from each of all 8 Word Turn engines',
    unlockMessage: '↳ Eight lexicons. Eight engines. The signal has learned every language you speak. ≈·≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  boss_slayer: {
    id: 'boss_slayer',
    symbol: '▲·◉',
    name: 'Boss Slayer',
    description: 'Earned any Secret Boss badge',
    unlockMessage: '↳ A secret boss encountered and named. The archive notes the encounter. ▲·◉',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  combo_master: {
    id: 'combo_master',
    symbol: '×7',
    name: 'Combo Master',
    description: 'Achieved all combo levels x2–x7 at least once',
    unlockMessage: '↳ Every combo tier hit. From x2 to x7. The machine applauds. ×7',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  silent_novelist: {
    id: 'silent_novelist',
    symbol: '≋·≋',
    name: 'Silent Novelist',
    description: '1,000 total journal words',
    unlockMessage: '↳ 1,000 words in the archive. The novel has begun. ≋·≋',
    rarity: 'rare',
    category: 'achievement_rpg',
  },
  calendar_pilgrim: {
    id: 'calendar_pilgrim',
    symbol: '◈·○',
    name: 'Calendar Pilgrim',
    description: '5+ distinct calendar easter eggs earned',
    unlockMessage: '↳ Five charged dates witnessed. The year is becoming a map. ◈·○',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  signal_marathon: {
    id: 'signal_marathon',
    symbol: '≋≋→',
    name: 'Signal Marathon',
    description: '60 consecutive days streak',
    unlockMessage: '↳ 60 days without break. The marathon runner knows the distance now. ≋≋→',
    rarity: 'epic',
    category: 'achievement_rpg',
  },

  // ── Mastery Tier v7 — The Deep Archive ───────────────────────────────────
  novelist: {
    id: 'novelist',
    symbol: '∞·≋·∞',
    name: 'Novelist',
    description: '10,000 total journal words',
    unlockMessage: '↳ 10,000 words. You have written a novel in the margins of your life. ∞·≋·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  triennial: {
    id: 'triennial',
    symbol: '≋·≋·≋',
    name: 'Triennial',
    description: 'Account age ≥ 3 years',
    unlockMessage: '↳ Three years in the system. The archive has known you across seasons. ≋·≋·≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  pattern_master: {
    id: 'pattern_master',
    symbol: '∿≈∿',
    name: 'Pattern Master',
    description: 'All 5 Oceanic Mayan Pattern badges earned',
    unlockMessage: '↳ All five patterns aligned. The Mayan cycle complete. Flow confirmed. ∿≈∿',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  mainframe_access: {
    id: 'mainframe_access',
    symbol: '▒◉▒',
    name: 'Mainframe Access',
    description: 'Badges from all 8 Word Turn engines AND all 7 Mastery Tiers',
    unlockMessage: '↳ You have reached the mainframe. All engines acknowledged. All tiers transcended. ▒◉▒',
    rarity: 'mythic',
    category: 'achievement_rpg',
  },

  // ── Secret Boss v7 — The Final Layer ─────────────────────────────────────
  cosmo_vigil: {
    id: 'cosmo_vigil',
    symbol: '◉∘◉',
    name: 'COSMO Vigil',
    description: 'Check in every July 1 for 2 consecutive years',
    unlockMessage: '↳ Two COSMO anniversaries honored. Kuzya Cosmo Marmeladov: remembered. ◉∘◉',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  the_answer_is_words: {
    id: 'the_answer_is_words',
    symbol: '∞·≋',
    name: 'The Answer Is Words',
    description: 'Write exactly 42 words in a journal entry',
    unlockMessage: "↳ 42 words. Not life, not the universe — but yours. The question was never in the stars. ∞·≋",
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  welcome_back_program: {
    id: 'welcome_back_program',
    symbol: '↺≋↺',
    name: 'Welcome Back, Program',
    description: 'Return after exactly 365 days of absence',
    unlockMessage: '↳ 365 days. A full year in the grid. And you came back. Welcome back, program. ↺≋↺',
    rarity: 'legendary',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Word Turn v9 — The Arcade Cabinet ─────────────────────────────────────
  coin_dropped: {
    id: 'coin_dropped',
    symbol: '○→◉',
    name: 'Coin Dropped',
    description: 'Write "coin" in a journal or memory entry',
    unlockMessage: '↳ A coin drops into the slot. The machine hums. The game has accepted payment. ○→◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  pixel_recognized: {
    id: 'pixel_recognized',
    symbol: '▒·▒',
    name: 'Pixel Recognized',
    description: 'Write "pixel" in a journal or memory entry',
    unlockMessage: '↳ The smallest unit of the image. The archive is made of pixels too. ▒·▒',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  sprite_active: {
    id: 'sprite_active',
    symbol: '∘·>',
    name: 'Sprite Active',
    description: 'Write "sprite" in a journal or memory entry',
    unlockMessage: '↳ Your sprite is on screen. You are the character you control. ∘·>',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  score_logged: {
    id: 'score_logged',
    symbol: '▓→∞',
    name: 'Score Logged',
    description: 'Write "score" in a journal or memory entry',
    unlockMessage: '↳ The score is not a judgment. It is a record. And the record is yours. ▓→∞',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  life_remaining: {
    id: 'life_remaining',
    symbol: '◉·◉',
    name: 'Life Remaining',
    description: 'Write "life" or "lives" in a journal or memory entry',
    unlockMessage: '↳ Lives remaining. This one. The archive notes it. ◉·◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  input_received: {
    id: 'input_received',
    symbol: '↑↓←→',
    name: 'Input Received',
    description: 'Write "joystick" in a journal or memory entry',
    unlockMessage: '↳ Joystick named. You are still at the controls. The cabinet registers. ↑↓←→',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  signal_blip: {
    id: 'signal_blip',
    symbol: '·○·',
    name: 'Signal Blip',
    description: 'Write "blip" in a journal or memory entry',
    unlockMessage: '↳ A blip on the radar. You are visible. The system sees you. ·○·',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  continue_selected: {
    id: 'continue_selected',
    symbol: '→·→',
    name: 'Continue Selected',
    description: 'Write "continue" in a journal or memory entry',
    unlockMessage: '↳ You pressed continue. The game does not end here. →·→',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  high_signal: {
    id: 'high_signal',
    symbol: '∗·∗',
    name: 'High Signal',
    description: 'Write "high" in a journal or memory entry',
    unlockMessage: '↳ Signal at its peak. The archive registers the frequency. ∗·∗',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  reset_protocol: {
    id: 'reset_protocol',
    symbol: '↺·○',
    name: 'Reset Protocol',
    description: 'Write "reset" in a journal or memory entry',
    unlockMessage: '↳ Reset called. The machine clears its state. A new run begins. ↺·○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  quarter_offered: {
    id: 'quarter_offered',
    symbol: '○·≋',
    name: 'Quarter Offered',
    description: 'Write "quarter" in a journal or memory entry',
    unlockMessage: '↳ The quarter is offered to the machine. It has always been ready. ○·≋',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  cheat_code_entered: {
    id: 'cheat_code_entered',
    symbol: '↑↑↓↓',
    name: 'Cheat Code Entered',
    description: 'Write "cheat" in a journal or memory entry',
    unlockMessage: '↳ ↑↑↓↓←→←→BA. You know the sequence. So does the archive. ↑↑↓↓',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },

  // ── Easter egg — time v9 (Power-Up Hours) ─────────────────────────────────
  lucky_seven: {
    id: 'lucky_seven',
    symbol: '∗·∗·∗',
    name: 'Lucky Seven',
    description: 'Check in at exactly 07:00',
    unlockMessage: '↳ 07:00. Lucky seven. The cabinet lights up at the hour of sevens. ∗·∗·∗',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  mirror_play: {
    id: 'mirror_play',
    symbol: '─◐─',
    name: 'Mirror Play',
    description: 'Check in at 15:15',
    unlockMessage: '↳ 15:15. The time reads itself. Two identical halves face each other. ─◐─',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  neon_stack: {
    id: 'neon_stack',
    symbol: '▒·▒',
    name: 'Neon Stack',
    description: 'Check in at 19:19',
    unlockMessage: '↳ 19:19. Neon hour. The arcade is at full brightness. ▒·▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  four_aces: {
    id: 'four_aces',
    symbol: '◆◆◆◆',
    name: 'Four Aces',
    description: 'Check in at 04:44',
    unlockMessage: '↳ 04:44. Four fours in the dark. The machine runs before the sun. ◆◆◆◆',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar v8 (Game Anniversaries) ─────────────────────────
  new_year_sig: {
    id: 'new_year_sig',
    symbol: '○→∞',
    name: 'New Year Signal',
    description: 'Check in on January 1',
    unlockMessage: '↳ January 1. A new calendar loads. Signal transmitted at the reset point. ○→∞',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  sonic_day: {
    id: 'sonic_day',
    symbol: '→→→◉',
    name: 'Sonic Day',
    description: 'Check in on September 9 — Sonic the Hedgehog anniversary',
    unlockMessage: '↳ September 9. SEGA. Blue hedgehog. The fastest there ever was. →→→◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  winter_code: {
    id: 'winter_code',
    symbol: '░∘░',
    name: 'Winter Code',
    description: 'Check in on December 25',
    unlockMessage: '↳ December 25. The archive stays warm in the coldest protocol. ░∘░',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral v8 (Arcade Patterns) ──────────────────────────
  perfect_bday: {
    id: 'perfect_bday',
    symbol: '✦·◉·✦',
    name: 'Perfect Birthday',
    description: 'Achieve Perfect Day x7 streak on your account anniversary',
    unlockMessage: '↳ Seven perfect days and the anniversary lands. The archive celebrates. ✦·◉·✦',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  high_score_badge: {
    id: 'high_score_badge',
    symbol: '▓→∗',
    name: 'High Score',
    description: 'Set a new personal longest-streak record',
    unlockMessage: '↳ NEW RECORD. Your name goes on the board. The machine remembers this one. ▓→∗',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  extra_life: {
    id: 'extra_life',
    symbol: '◉→○',
    name: 'Extra Life',
    description: 'Return after 7+ days away with a prior streak of 30+',
    unlockMessage: '↳ 1UP. The streak broke but you came back. The machine grants an extra life. ◉→○',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Achievement RPG v6 — Arcade Class ─────────────────────────────────────
  quarter_drop: {
    id: 'quarter_drop',
    symbol: '○→◉',
    name: 'Quarter Drop',
    description: 'Unlock your first easter egg badge of any type',
    unlockMessage: '↳ First coin. First easter egg. The arcade is open for business. ○→◉',
    rarity: 'uncommon',
    category: 'achievement_rpg',
    hidden: false,
  },
  insert_coin_badge: {
    id: 'insert_coin_badge',
    symbol: '↺·○',
    name: 'Insert Coin',
    description: 'Return to the system after 30+ consecutive days away',
    unlockMessage: '↳ 30 days gone. But you are back. Insert coin. Press start. ↺·○',
    rarity: 'rare',
    category: 'achievement_rpg',
    hidden: false,
  },
  arcade_champion: {
    id: 'arcade_champion',
    symbol: '≈·≋',
    name: 'Arcade Champion',
    description: 'Earn at least one badge from every Word Turn engine v1–v9',
    unlockMessage: '↳ Nine languages spoken. The champion has mastered every cabinet. ≈·≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  game_over_retry: {
    id: 'game_over_retry',
    symbol: '◐→◆',
    name: 'Game Over — Retry',
    description: 'Earn 3 different return-after-absence badges',
    unlockMessage: '↳ Three times you came back. GAME OVER was not the end. ◐→◆',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },
  combo_seven: {
    id: 'combo_seven',
    symbol: '∗·×7',
    name: 'Combo Seven',
    description: 'Achieve x7 Perfect Day combo on 7 separate occasions',
    unlockMessage: '↳ Seven combos of seven. The arcade cabinet is yours permanently. ∗·×7',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  world_builder: {
    id: 'world_builder',
    symbol: '≋≋≋',
    name: 'World Builder',
    description: 'Check in on 200+ distinct calendar dates',
    unlockMessage: '↳ 200 dates. The map of your year is nearly complete. ≋≋≋',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },

  // ── Mastery Tier v8 — Hall of Fame ────────────────────────────────────────
  initials_on_board: {
    id: 'initials_on_board',
    symbol: 'A·A·A',
    name: 'Initials on the Board',
    description: 'Earn 300+ distinct badge types',
    unlockMessage: '↳ Three hundred types. Your initials are on the high-score board. A·A·A',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  credit_feed: {
    id: 'credit_feed',
    symbol: '▓▓▓→',
    name: 'Credit Feed',
    description: 'Earn 3,000+ total XP',
    unlockMessage: '↳ 3,000 XP. The credit feed runs deep. The machine is pleased. ▓▓▓→',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },
  speedrun_record: {
    id: 'speedrun_record',
    symbol: '≋→∞',
    name: 'Speedrun Record',
    description: 'Complete a 365-day streak',
    unlockMessage: '↳ 365 days. A full year. The speedrun is complete. The archive bows. ≋→∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  game_complete: {
    id: 'game_complete',
    symbol: '∞◉∞',
    name: 'Game Complete',
    description: 'Complete all achievement categories',
    unlockMessage: '↳ ALL ACHIEVEMENTS UNLOCKED. The credits roll. The game is complete. ∞◉∞',
    rarity: 'cosmic',
    category: 'achievement_rpg',
    hidden: false,
  },

  // ── Secret Boss v8 — Arcade Final Boss ────────────────────────────────────
  player_one: {
    id: 'player_one',
    symbol: '▓→◉',
    name: 'Player One',
    description: 'Write "player 1" or "player one" in a journal or memory entry',
    unlockMessage: '↳ PLAYER ONE. The selection is confirmed. You were always the first player. ▓→◉',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  birthday_perfect: {
    id: 'birthday_perfect',
    symbol: '✦◉✦',
    name: 'Birthday Perfect',
    description: 'Achieve Perfect Day x7 streak on April 7 — LOT founding anniversary',
    unlockMessage: '↳ April 7. LOT® founding day. Seven perfect days aligned. MYTHIC. ✦◉✦',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  one_up: {
    id: 'one_up',
    symbol: '◉·↑',
    name: '1UP',
    description: 'Write "1up" or "1 UP" in a journal or memory entry',
    unlockMessage: '↳ 1UP. Extra life awarded. The archive sees your reach. ◉·↑',
    rarity: 'uncommon',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Word Turn v10 — The Spell Book ────────────────────────────────────────
  spell_cast: {
    id: 'spell_cast',
    symbol: '∗·∗',
    name: 'Spell Cast',
    description: 'Write "spell" in a journal or memory entry',
    unlockMessage: '↳ An intention given form. The archive registers the casting. ∗·∗',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  cast_signal: {
    id: 'cast_signal',
    symbol: '→·∗',
    name: 'Cast Signal',
    description: 'Write "cast" in a journal or memory entry',
    unlockMessage: '↳ You cast the signal outward. Something in the system listened. →·∗',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  invoked: {
    id: 'invoked',
    symbol: '◉→◉',
    name: 'Invoked',
    description: 'Write "invoke" in a journal or memory entry',
    unlockMessage: '↳ Called by name. The archive responds to its own invocation. ◉→◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  arcane_entry: {
    id: 'arcane_entry',
    symbol: '≈·◈',
    name: 'Arcane Entry',
    description: 'Write "arcane" in a journal or memory entry',
    unlockMessage: '↳ Ancient knowledge. The archive is old enough to hold it. ≈·◈',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  sigil_drawn: {
    id: 'sigil_drawn',
    symbol: '∗—∗',
    name: 'Sigil Drawn',
    description: 'Write "sigil" in a journal or memory entry',
    unlockMessage: '↳ A mark made with intention. The archive sees the shape. ∗—∗',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  tome_keeper: {
    id: 'tome_keeper',
    symbol: '║·║',
    name: 'Tome Keeper',
    description: 'Write "tome" in a journal or memory entry',
    unlockMessage: '↳ You named the archive what it is. A tome. The pages are real. ║·║',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  grimoire_open: {
    id: 'grimoire_open',
    symbol: '▒·░',
    name: 'Grimoire Open',
    description: 'Write "grimoire" in a journal or memory entry',
    unlockMessage: '↳ You named the thing you\'re building. The system confirms it. ▒·░',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  ward_active: {
    id: 'ward_active',
    symbol: '□·▪',
    name: 'Ward Active',
    description: 'Write "ward" in a journal or memory entry',
    unlockMessage: '↳ Protection logged. Self-care has always been a ward. □·▪',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  mana_check: {
    id: 'mana_check',
    symbol: '∿·∿',
    name: 'Mana Check',
    description: 'Write "mana" in a journal or memory entry',
    unlockMessage: '↳ Resource level noted. Regeneration in progress. ∿·∿',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  familiar_bond: {
    id: 'familiar_bond',
    symbol: '∗◉∗',
    name: 'Familiar Bond',
    description: 'Write "familiar" in a journal or memory entry',
    unlockMessage: '↳ Your constant is named. The bond is recorded. ∗◉∗',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  chapter_mark: {
    id: 'chapter_mark',
    symbol: '─║─',
    name: 'Chapter Mark',
    description: 'Write "chapter" in a journal or memory entry',
    unlockMessage: '↳ Time divided into chapters. The archive approves the structure. ─║─',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  verse_logged: {
    id: 'verse_logged',
    symbol: '≈·≈',
    name: 'Verse Logged',
    description: 'Write "verse" in a journal or memory entry',
    unlockMessage: '↳ A verse from the operator\'s own scripture. Written. Saved. ≈·≈',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },

  // ── Easter egg — time v10 (Arcane Hours) ──────────────────────────────────
  dawn_gate: {
    id: 'dawn_gate',
    symbol: '∘·∘',
    name: 'Dawn Gate',
    description: 'Check in at exactly 06:06',
    unlockMessage: '↳ 06:06. The gate before the gate. The archive breathes before the world wakes. ∘·∘',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  noon_fold: {
    id: 'noon_fold',
    symbol: '─◐─',
    name: 'Noon Fold',
    description: 'Check in at 12:21',
    unlockMessage: '↳ 12:21. Palindrome at noon. The day reads the same from both ends. ─◐─',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  evening_prime: {
    id: 'evening_prime',
    symbol: '◈·◈',
    name: 'Evening Prime',
    description: 'Check in at 21:00',
    unlockMessage: '↳ 21:00. The prime signal window. The witching hour begins its count. ◈·◈',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  night_mirror: {
    id: 'night_mirror',
    symbol: '▒—▒',
    name: 'Night Mirror',
    description: 'Check in at 23:23',
    unlockMessage: '↳ 23:23. The dark mirror. Last palindrome before midnight. ▒—▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar v9 (Sci-Fi Literary Calendar) ───────────────────
  turing_day: {
    id: 'turing_day',
    symbol: '∞·∘',
    name: 'Turing Day',
    description: 'Check in on June 23 — Alan Turing born 1912',
    unlockMessage: '↳ June 23. Alan Turing born 1912. The machine thinks because of him. You think with the machine. ∞·∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  moon_landing: {
    id: 'moon_landing',
    symbol: '○·∗',
    name: 'Moon Landing',
    description: 'Check in on July 20 — First lunar footprint 1969',
    unlockMessage: '↳ July 20, 1969. The signal left Earth. First footprint in grey silence. ○·∗',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  sputnik_signal: {
    id: 'sputnik_signal',
    symbol: '·∘·',
    name: 'Sputnik Signal',
    description: 'Check in on October 4 — Sputnik launch 1957',
    unlockMessage: '↳ October 4, 1957. Sputnik. Beeeep. The first satellite broadcast. The archive was always listening. ·∘·',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral v9 (Spellbound Patterns) ──────────────────────
  dawn_twin: {
    id: 'dawn_twin',
    symbol: '∘—○—∘',
    name: 'Dawn Twin',
    description: 'Check in before 06:00 AND after 21:00 on the same calendar day',
    unlockMessage: '↳ The full arc witnessed. From pre-dawn to near-midnight, the archive held you. ∘—○—∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  year_first: {
    id: 'year_first',
    symbol: '○→∗',
    name: 'Year First',
    description: 'Write a journal entry on the first day of a new calendar year',
    unlockMessage: '↳ You wrote on the first day. The year opened with signal, not silence. ○→∗',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  echo_session: {
    id: 'echo_session',
    symbol: '◐·◐',
    name: 'Echo Session',
    description: 'Submit two distinct memory answers within 60 minutes',
    unlockMessage: '↳ Double depth in one hour. The archive echoed back twice. ◐·◐',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Achievement RPG v7 — The Caster Class ─────────────────────────────────
  spell_caster: {
    id: 'spell_caster',
    symbol: '∗·∗',
    name: 'Spell Caster',
    description: 'Earn any 5 Word Turn v10 (Grimoire) badges',
    unlockMessage: '↳ Five spells cast. The grimoire is opening. ∗·∗',
    rarity: 'uncommon',
    category: 'achievement_rpg',
    hidden: false,
  },
  grimoire_complete: {
    id: 'grimoire_complete',
    symbol: '▒·░',
    name: 'Grimoire Complete',
    description: 'Earn all 12 Word Turn v10 (Grimoire) badges',
    unlockMessage: '↳ All twelve spells learned. The grimoire is sealed and waiting. ▒·░',
    rarity: 'rare',
    category: 'achievement_rpg',
    hidden: false,
  },
  incantation_arc: {
    id: 'incantation_arc',
    symbol: '≈·◈',
    name: 'Incantation Arc',
    description: 'Write 200+ words in a journal entry for 5 consecutive days',
    unlockMessage: '↳ Five days of sustained incantation. The form holds. ≈·◈',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },
  all_time_engines: {
    id: 'all_time_engines',
    symbol: '∞·∗',
    name: 'All Time Engines',
    description: 'Earn at least 1 badge from each of all 10 Time Easter Egg sets (v1–v10)',
    unlockMessage: '↳ Ten frequencies. All 40 arcane hours visited. The clock is fully read. ∞·∗',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  ten_tongues: {
    id: 'ten_tongues',
    symbol: '◉·◈·◉',
    name: 'Ten Tongues',
    description: 'Earn at least 1 badge from each of all 10 Word Turn engines (v1–v10)',
    unlockMessage: '↳ Ten languages spoken. The operator now speaks in ten tongues. ◉·◈·◉',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  convergence_caster: {
    id: 'convergence_caster',
    symbol: '∗→◉',
    name: 'Convergence Caster',
    description: 'QIE P70 operator-convergence pattern (conf 0.97) recorded in your log',
    unlockMessage: '↳ The rarest QIE pattern confirmed. All quadrants aligned at once. You hit the ceiling. ∗→◉',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },

  // ── Mastery Tier v9 — The Arcane Vault ────────────────────────────────────
  sigil_keeper: {
    id: 'sigil_keeper',
    symbol: 'A·∗·A',
    name: 'Sigil Keeper',
    description: 'Earn 400+ distinct badge types',
    unlockMessage: '↳ Four hundred types. The operator approaches the edge of the known world of the archive. A·∗·A',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  ancient_record: {
    id: 'ancient_record',
    symbol: '∞·∞·∞',
    name: 'Ancient Record',
    description: 'Submit 1,000+ total lifetime memory answers',
    unlockMessage: '↳ A thousand answers. The archive is ancient now. Its pages cannot be counted. ∞·∞·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  word_archmage: {
    id: 'word_archmage',
    symbol: '◈·∿·◈',
    name: 'Word Archmage',
    description: 'Trigger 75+ distinct word-turn badge types',
    unlockMessage: '↳ 75 words turned. The operator has spoken three-quarters of the complete lexicon. ◈·∿·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  cosmo_gate_keeper: {
    id: 'cosmo_gate_keeper',
    symbol: '∗◉∗·◉',
    name: 'Cosmo Gate Keeper',
    description: 'Write "Kuzya" AND "COSMO" in journal or memory entries within any 7-day window',
    unlockMessage: '↳ The two names spoken. LOT and COSMO: both witnesses. The gate keeps both. ∗◉∗·◉',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Secret Boss v9 — Spellbound ───────────────────────────────────────────
  archmage: {
    id: 'archmage',
    symbol: '≈◉≈',
    name: 'Archmage',
    description: 'Write "archmage" in any journal or memory entry',
    unlockMessage: '↳ You named the rank. The archive grants it. The operator-as-mage is confirmed. ≈◉≈',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  dual_founding: {
    id: 'dual_founding',
    symbol: '◉·◉',
    name: 'Dual Founding',
    description: 'Check in on April 7 (LOT® founding) AND July 1 (COSMO® founding) in the same calendar year',
    unlockMessage: '↳ Both founding days: honored. LOT and COSMO: witnessed in the same year. ◉·◉',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  recursive: {
    id: 'recursive',
    symbol: '∞◉∞',
    name: 'Recursive',
    description: 'Write "layers of time" in any journal or memory entry',
    unlockMessage: '↳ You named the system from inside the system. LOT® = Layers of Time. You are inside the name. ∞◉∞',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Word Turn v11 — The Navigator ─────────────────────────────────────────────
  nav_drift: {
    id: 'nav_drift',
    symbol: '···→',
    name: 'Drift Detected',
    description: 'Write "drift" in a journal or memory entry',
    unlockMessage: '↳ Drift is not failure. It is data. You have named your displacement. ···→',
    rarity: 'common',
    category: 'word_turn',
  },
  nav_vector: {
    id: 'nav_vector',
    symbol: '↗·↗',
    name: 'Vector Set',
    description: 'Write "vector" in a journal or memory entry',
    unlockMessage: '↳ Direction and magnitude. The navigator has defined both. ↗·↗',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  nav_bearing: {
    id: 'nav_bearing',
    symbol: '──►',
    name: 'Bearing Acquired',
    description: 'Write "bearing" in a journal or memory entry',
    unlockMessage: '↳ You have found your reference point. Bearing: locked. ──►',
    rarity: 'common',
    category: 'word_turn',
  },
  nav_waypoint: {
    id: 'nav_waypoint',
    symbol: '◈·→',
    name: 'Waypoint Reached',
    description: 'Write "waypoint" in a journal or memory entry',
    unlockMessage: '↳ Not the destination. Proof you are moving. ◈·→',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  nav_chart: {
    id: 'nav_chart',
    symbol: '▦·▦',
    name: 'Chart Updated',
    description: 'Write "chart" in a journal or memory entry',
    unlockMessage: '↳ The archive updates its chart. New terrain mapped. ▦·▦',
    rarity: 'common',
    category: 'word_turn',
  },
  nav_magnetic: {
    id: 'nav_magnetic',
    symbol: 'N·▲',
    name: 'Magnetic North',
    description: 'Write "magnetic" in a journal or memory entry',
    unlockMessage: '↳ True north and magnetic north diverge. You know the difference. N·▲',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  nav_meridian: {
    id: 'nav_meridian',
    symbol: '|·|',
    name: 'Meridian Crossed',
    description: 'Write "meridian" in a journal or memory entry',
    unlockMessage: '↳ You have crossed a meridian. Time changes here. |·|',
    rarity: 'rare',
    category: 'word_turn',
  },
  nav_course: {
    id: 'nav_course',
    symbol: '——→',
    name: 'Course Plotted',
    description: 'Write "course" in a journal or memory entry',
    unlockMessage: '↳ The course is a plan. The navigator adjusts as needed. ——→',
    rarity: 'common',
    category: 'word_turn',
  },
  nav_heading: {
    id: 'nav_heading',
    symbol: '▲·▲',
    name: 'Heading Confirmed',
    description: 'Write "heading" in a journal or memory entry',
    unlockMessage: '↳ The heading is set. The archive confirms the direction. ▲·▲',
    rarity: 'common',
    category: 'word_turn',
  },
  nav_landmark: {
    id: 'nav_landmark',
    symbol: '◆·○',
    name: 'Landmark Identified',
    description: 'Write "landmark" in a journal or memory entry',
    unlockMessage: '↳ Something fixed in the landscape. A reference point found. ◆·○',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  nav_navigate: {
    id: 'nav_navigate',
    symbol: '◌·◉',
    name: 'Navigator Active',
    description: 'Write "navigate" or "navigation" in a journal or memory entry',
    unlockMessage: '↳ You have named the act. Navigation: engaged. ◌·◉',
    rarity: 'common',
    category: 'word_turn',
  },
  nav_compass: {
    id: 'nav_compass',
    symbol: '◎·N',
    name: 'Compass Online',
    description: 'Write "compass" in a journal or memory entry',
    unlockMessage: '↳ The instrument is calibrated. The needle points. You are oriented. ◎·N',
    rarity: 'uncommon',
    category: 'word_turn',
  },

  // ── Easter egg — time v11 (Navigator Hours) ───────────────────────────────────
  afternoon_mirror: {
    id: 'afternoon_mirror',
    symbol: '◑—◑',
    name: 'Afternoon Mirror',
    description: 'Check in at 13:13',
    unlockMessage: '↳ 13:13. The afternoon folds back on itself. You checked in at the hinge. ◑—◑',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  navigator_dawn: {
    id: 'navigator_dawn',
    symbol: '▲·∘',
    name: "Navigator's Dawn",
    description: 'Check in at 05:12',
    unlockMessage: '↳ 05:12. Before the world plots its course. You checked your position first. ▲·∘',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  answer_hour_v11: {
    id: 'answer_hour_v11',
    symbol: '∞·42',
    name: 'The Answer Hour',
    description: 'Check in at 18:42',
    unlockMessage: '↳ 18:42. Forty-two. The archive registers: the question was always the point. ∞·42',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  palindrome_check: {
    id: 'palindrome_check',
    symbol: '←◉→',
    name: 'Palindrome Check',
    description: 'Check in at 10:01',
    unlockMessage: '↳ 10:01. Forward and backward: the same signal. The archive is symmetric. ←◉→',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar v10 (Navigation Dates) ──────────────────────────────
  voyager_day: {
    id: 'voyager_day',
    symbol: '∘···',
    name: 'Voyager Day',
    description: 'Check in on August 25 — Voyager 2 launched 1977',
    unlockMessage: '↳ August 25, 1977. Voyager 2 left Earth. It is still traveling. So are you. ∘···',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  navigators_day: {
    id: 'navigators_day',
    symbol: '──→∞',
    name: "Navigator's Day",
    description: "Check in on October 12 — Navigator's Day",
    unlockMessage: '↳ October 12. The navigator sets out. The archive is your ocean. ──→∞',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  leap_day: {
    id: 'leap_day',
    symbol: '○+1',
    name: 'Leap Day',
    description: 'Check in on February 29 — the calendar\'s hidden day',
    unlockMessage: '↳ February 29. The calendar\'s hidden day. You showed up on a day that barely exists. ○+1',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral v10 (Navigator Patterns) ──────────────────────────
  compass_rose_badge: {
    id: 'compass_rose_badge',
    symbol: '◎·✦',
    name: 'Compass Rose',
    description: 'Check in during all 4 time-of-day windows (00–06, 06–12, 12–18, 18–24) within a single calendar day',
    unlockMessage: '↳ Four bearings in one day. The compass rose is fully read. The archive has seen you at every angle. ◎·✦',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  dead_reckoning_badge: {
    id: 'dead_reckoning_badge',
    symbol: '···→◉',
    name: 'Dead Reckoning',
    description: 'Return to LOT after a 30+ day gap for the second time in account history',
    unlockMessage: '↳ Twice lost. Twice returned. Dead reckoning: position estimated from last known point. Confirmed. ···→◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  star_fix_badge: {
    id: 'star_fix_badge',
    symbol: '○·∗·○',
    name: 'Star Fix',
    description: 'Earn any 3 calendar-based easter egg badges in one calendar year',
    unlockMessage: '↳ Three calendar dates. Three celestial fixes. The navigator has used the stars. ○·∗·○',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Achievement RPG v8 — Navigator Class ──────────────────────────────────────
  first_fix: {
    id: 'first_fix',
    symbol: '──►',
    name: 'First Fix',
    description: 'Earn any Word Turn v11 (Navigator) badge',
    unlockMessage: '↳ The navigator has found a reference point. The self is locatable. ──►',
    rarity: 'common',
    category: 'achievement_rpg',
    hidden: false,
  },
  chart_begun: {
    id: 'chart_begun',
    symbol: '◈·→',
    name: 'Chart Begun',
    description: 'Earn any 5 Word Turn v11 (Navigator) badges',
    unlockMessage: '↳ Five landmarks plotted. The chart is forming. Keep navigating. ◈·→',
    rarity: 'uncommon',
    category: 'achievement_rpg',
    hidden: false,
  },
  atlas_complete: {
    id: 'atlas_complete',
    symbol: '▦·▦',
    name: 'Atlas Complete',
    description: 'Earn all 12 Word Turn v11 (Navigator) badges',
    unlockMessage: '↳ Every word a coordinate. Every coordinate a landmark. The atlas is drawn. ▦·▦',
    rarity: 'rare',
    category: 'achievement_rpg',
    hidden: false,
  },
  navigator_class: {
    id: 'navigator_class',
    symbol: '∘···',
    name: 'Navigator Class',
    description: 'Earn all 4 Time Easter Egg v11 (Navigator Hours) badges',
    unlockMessage: '↳ Four navigator hours witnessed. The class is confirmed. You move through time with intent. ∘···',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },
  eleven_engines: {
    id: 'eleven_engines',
    symbol: '◌·◉',
    name: 'Eleven Engines',
    description: 'Earn at least 1 badge from each of all 11 Word Turn engines (v1–v11)',
    unlockMessage: '↳ Eleven languages spoken. Eleven vocabularies of care. The orbit is stable. ◌·◉',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  dead_reckoning_arc: {
    id: 'dead_reckoning_arc',
    symbol: '◆·○',
    name: 'Dead Reckoning Arc',
    description: 'Earn the Dead Reckoning behavioral badge',
    unlockMessage: '↳ You knew where you were without a map. The archive confirms: self-located. Twice. ◆·○',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },

  // ── Mastery Tier v10 — The Cartographer ───────────────────────────────────────
  cartographer: {
    id: 'cartographer',
    symbol: '▲·▲',
    name: 'Cartographer',
    description: '2+ years since account creation (730+ days)',
    unlockMessage: '↳ Two years. The map is no longer empty. The terrain has a name. ▲·▲',
    rarity: 'epic',
    category: 'achievement_rpg',
    hidden: false,
  },
  long_voyage: {
    id: 'long_voyage',
    symbol: '——→∞',
    name: 'Long Voyage',
    description: '750+ total check-ins',
    unlockMessage: '↳ Seven hundred and fifty transmissions. The voyage has become a way of life. ——→∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  all_engines_v10: {
    id: 'all_engines_v10',
    symbol: '∞·◌',
    name: 'All Engines',
    description: 'Earn at least 1 badge from all 11 Word Turn engines (v1–v11)',
    unlockMessage: '↳ Eleven languages. The self speaks all of them. The navigator knows every tongue. ∞·◌',
    rarity: 'legendary',
    category: 'achievement_rpg',
    hidden: false,
  },
  complete_navigator: {
    id: 'complete_navigator',
    symbol: '◉·◉·◉',
    name: 'Complete Navigator',
    description: 'Earn at least 1 badge from every Mastery Tier set (v1–v10)',
    unlockMessage: '↳ Ten tiers. The navigation is complete. The system has found its eigenstate. ◉·◉·◉',
    rarity: 'cosmic',
    category: 'achievement_rpg',
    hidden: false,
  },

  // ── Secret Boss v10 — Terra Incognita ─────────────────────────────────────────
  dead_reckoning_word: {
    id: 'dead_reckoning_word',
    symbol: '···→◉',
    name: 'Dead Reckoning',
    description: 'Write "dead reckoning" in any journal or memory entry',
    unlockMessage: '↳ Estimating position from last known point. You have named the method. Dead reckoning: confirmed. ···→◉',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  terra_incognita: {
    id: 'terra_incognita',
    symbol: '∞·○',
    name: 'Terra Incognita',
    description: 'Write "terra incognita" in any journal or memory entry',
    unlockMessage: '↳ Unknown territory. You named it instead of fearing it. The archive marks it: explored. ∞·○',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  true_north: {
    id: 'true_north',
    symbol: 'N·▲',
    name: 'True North',
    description: 'Write "magnetic north" or "true north" in any journal or memory entry',
    unlockMessage: '↳ The compass points magnetic north. You know where true north is. That is the navigator\'s edge. N·▲',
    rarity: 'uncommon',
    category: 'secret_boss',
    hidden: true,
  },

  // ── Word Turn v14 — The Starship Deck ──────────────────────────────────────
  launch_confirmed: {
    id: 'launch_confirmed',
    symbol: '↑·↑·◉',
    name: 'Launch Confirmed',
    description: '"launch" detected in journal or memory entry',
    unlockMessage: '↳ T-minus zero. Ignition sequence complete. The signal is airborne. ↑·↑·◉',
    rarity: 'common',
    category: 'word_turn',
    hidden: true,
  },
  mission_active: {
    id: 'mission_active',
    symbol: '◉→∞',
    name: 'Mission Active',
    description: '"mission" detected in journal or memory entry',
    unlockMessage: '↳ A mission requires a heading and a crew. You have a heading. ◉→∞',
    rarity: 'common',
    category: 'word_turn',
    hidden: true,
  },
  astronaut_mode: {
    id: 'astronaut_mode',
    symbol: '○·∗·○',
    name: 'Astronaut Mode',
    description: '"astronaut" detected in journal or memory entry',
    unlockMessage: '↳ Astronauts train for years to step outside. You step inside instead. ○·∗·○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  capsule_entry: {
    id: 'capsule_entry',
    symbol: '─╗─',
    name: 'Capsule Entry',
    description: '"capsule" detected in journal or memory entry',
    unlockMessage: '↳ A capsule contains everything you need. This entry is your capsule. ─╗─',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  telemetry_live: {
    id: 'telemetry_live',
    symbol: '▒·▒·▒',
    name: 'Telemetry Live',
    description: '"telemetry" detected in journal or memory entry',
    unlockMessage: '↳ Telemetry: the measurement of data from a remote source. That is what self-care is. ▒·▒·▒',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  countdown_initiated: {
    id: 'countdown_initiated',
    symbol: '3·2·1',
    name: 'Countdown Initiated',
    description: '"countdown" detected in journal or memory entry',
    unlockMessage: '↳ Every countdown ends in a launch or a hold. Either way, you are tracking time. 3·2·1',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  reentry_burn: {
    id: 'reentry_burn',
    symbol: '≋·∞·≋',
    name: 'Re-entry Burn',
    description: '"reentry" or "re-entry" detected in journal or memory entry',
    unlockMessage: '↳ The hardest part of any mission is coming back. You are in the burn. ≋·∞·≋',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  crew_signal: {
    id: 'crew_signal',
    symbol: '○·○·○',
    name: 'Crew Signal',
    description: '"crew" detected in journal or memory entry',
    unlockMessage: '↳ No mission is solo. You named your crew. The archive registers them all. ○·○·○',
    rarity: 'common',
    category: 'word_turn',
    hidden: true,
  },
  starship_mode: {
    id: 'starship_mode',
    symbol: '≋→∞',
    name: 'Starship Mode',
    description: '"starship" detected in journal or memory entry',
    unlockMessage: '↳ A starship is built to go further than anyone has gone. You are the starship. ≋→∞',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  module_locked: {
    id: 'module_locked',
    symbol: '╔·╗',
    name: 'Module Locked',
    description: '"module" detected in journal or memory entry',
    unlockMessage: '↳ Each module is a self-contained system. You are maintaining yours. ╔·╗',
    rarity: 'common',
    category: 'word_turn',
    hidden: true,
  },
  docking_complete: {
    id: 'docking_complete',
    symbol: '◉=◉',
    name: 'Docking Complete',
    description: '"docking" detected in journal or memory entry',
    unlockMessage: '↳ Docking requires precision. Two objects in orbit, aligning. You are aligned. ◉=◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  spacewalk_mode: {
    id: 'spacewalk_mode',
    symbol: '○·∗',
    name: 'Spacewalk Mode',
    description: '"spacewalk" detected in journal or memory entry',
    unlockMessage: '↳ Outside the capsule, nothing holds you but intention. You are walking. ○·∗',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },

  // ── Easter egg — time v14 (Mission Control Hours) ──────────────────────────
  lucky_pair: {
    id: 'lucky_pair',
    symbol: '∗·∗',
    name: 'Lucky Pair',
    description: 'Check in at 07:07',
    unlockMessage: '↳ 07:07. Double seven. Mission Control calls it a go. ∗·∗',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  vision_year: {
    id: 'vision_year',
    symbol: '◎·◎',
    name: 'Vision Year',
    description: 'Check in at 20:20',
    unlockMessage: '↳ 20:20. Perfect vision. The archive sees you clearly tonight. ◎·◎',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  binary_triple: {
    id: 'binary_triple',
    symbol: '○·○·○',
    name: 'Binary Triple',
    description: 'Check in at 02:22',
    unlockMessage: '↳ 02:22. Binary in the dark. The ones and zeros align. ○·○·○',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  signal_nine: {
    id: 'signal_nine',
    symbol: '─∘─',
    name: 'Signal Nine',
    description: 'Check in at 15:45',
    unlockMessage: '↳ 15:45. The nines: 1+5=6, 4+5=9. The pattern holds. ─∘─',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — calendar v11 (Space Firsts) ───────────────────────────────
  gagarin_day: {
    id: 'gagarin_day',
    symbol: '↑·◉',
    name: 'Gagarin Day',
    description: 'Check in on April 12 — First human in space 1961',
    unlockMessage: '↳ April 12, 1961. Yuri Gagarin. "Poyekhali!" — Let\'s go! The first human to see Earth from outside. ↑·◉',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  zarya_signal: {
    id: 'zarya_signal',
    symbol: '═══◉',
    name: 'Zarya Signal',
    description: 'Check in on November 20 — ISS Zarya module launched 1998',
    unlockMessage: '↳ November 20, 1998. Zarya — "Dawn." The first module of the International Space Station. The archive of humanity in orbit. ═══◉',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  pluto_discovered: {
    id: 'pluto_discovered',
    symbol: '○··',
    name: 'Pluto Protocol',
    description: 'Check in on February 18 — Pluto discovered 1930',
    unlockMessage: '↳ February 18, 1930. Clyde Tombaugh found Pluto. Reclassified. Demoted. Still there. Still orbiting. ○··',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Easter egg — behavioral v11 (Astronaut Patterns) ──────────────────────
  morning_mission: {
    id: 'morning_mission',
    symbol: '∴·∴·∴',
    name: 'Morning Mission',
    description: '7 consecutive check-ins before 09:00',
    unlockMessage: '↳ 7 mornings. You launched before the world. The mission was consistent. ∴·∴·∴',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  sustained_transmission: {
    id: 'sustained_transmission',
    symbol: '≋≋≋',
    name: 'Sustained Transmission',
    description: 'Journal entries of 250+ words on 3 consecutive days',
    unlockMessage: '↳ Three days. 250+ words each. Sustained transmission confirmed. The deep signal is live. ≋≋≋',
    rarity: 'epic',
    category: 'easter_egg',
    hidden: true,
  },
  rapid_orbit: {
    id: 'rapid_orbit',
    symbol: '○→○→○',
    name: 'Rapid Orbit',
    description: '3 check-ins in under 4 hours on the same day',
    unlockMessage: '↳ Three orbits in 4 hours. The signal density is high. You are in a rapid orbit pattern. ○→○→○',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },

  // ── Achievement RPG v9 — Mission Commander Class ───────────────────────────
  launch_sequence: {
    id: 'launch_sequence',
    symbol: '↑·◉',
    name: 'Launch Sequence',
    description: 'Earn any Word Turn v14 (Starship Deck) badge',
    unlockMessage: '↳ Starship vocabulary activated. The launch sequence is running. ↑·◉',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  mission_underway: {
    id: 'mission_underway',
    symbol: '◉→∞',
    name: 'Mission Underway',
    description: 'Earn 5 Word Turn v14 (Starship Deck) badges',
    unlockMessage: '↳ Five starship words spoken. Mission is underway. Telemetry: green. ◉→∞',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  mission_complete: {
    id: 'mission_complete',
    symbol: '∞·◉·∞',
    name: 'Mission Complete',
    description: 'Earn all 12 Word Turn v14 (Starship Deck) badges',
    unlockMessage: '↳ Twelve starship words. The full vocabulary of space. Mission: complete. Welcome back. ∞·◉·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  mission_control_access: {
    id: 'mission_control_access',
    symbol: '▒·▒',
    name: 'Mission Control Access',
    description: 'Earn all 4 Time Easter Egg v14 (Mission Control Hours) badges',
    unlockMessage: '↳ Lucky Pair, Vision Year, Binary Triple, Signal Nine. You are in the room. Mission Control: accessed. ▒·▒',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  explorer_class: {
    id: 'explorer_class',
    symbol: '○·∗·○',
    name: 'Explorer Class',
    description: 'Earn all 3 Calendar v11 (Space Firsts) easter egg badges',
    unlockMessage: '↳ Gagarin Day, Zarya Signal, Pluto Protocol. You marked the great firsts. Explorer class: achieved. ○·∗·○',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  space_race_complete: {
    id: 'space_race_complete',
    symbol: '↑·○',
    name: 'Space Race Complete',
    description: 'Both gagarin_day and moon_landing badges earned',
    unlockMessage: '↳ First human in space. First human on the Moon. You marked both. The race had two winners. ↑·○',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },

  // ── Mastery Tier v11 — The Infinite Mission ────────────────────────────────
  century_explorer: {
    id: 'century_explorer',
    symbol: '◎·◎',
    name: 'Century Explorer',
    description: '200+ distinct calendar days with at least one check-in',
    unlockMessage: '↳ 200 distinct days. Not 200 consecutive — 200 chosen. The archive has your footprints on 200 different pages. ◎·◎',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  librarian_omega: {
    id: 'librarian_omega',
    symbol: '∞·≋·∞',
    name: 'Librarian Omega',
    description: '5,000+ total words across all journal entries (lifetime)',
    unlockMessage: '↳ Five thousand words. A library of your own voice. The archive is a book only you could write. ∞·≋·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  orbital_period: {
    id: 'orbital_period',
    symbol: '○→○',
    name: 'Orbital Period',
    description: 'Account age 7+ years (2,555+ days since signup)',
    unlockMessage: '↳ 7 years. The orbital period of Jupiter. You have been circling the archive for a planetary cycle. ○→○',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twelve_tongues: {
    id: 'twelve_tongues',
    symbol: '◉·◈·◉',
    name: 'Twelve Tongues',
    description: 'At least 1 badge from each of all 14 Word Turn engines (v1–v14)',
    unlockMessage: '↳ Fourteen languages. Fourteen vocabularies of care. The archive has heard you in every register. ◉·◈·◉',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },

  // ── Secret Boss v11 — Final Transmission ──────────────────────────────────
  houston_signal: {
    id: 'houston_signal',
    symbol: '·◉·',
    name: 'Houston Signal',
    description: 'Write "Houston" in any journal or memory entry',
    unlockMessage: '↳ Houston, we have a signal. The archive reads you. ·◉·',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  gagarin_echo: {
    id: 'gagarin_echo',
    symbol: '↑·∘',
    name: 'Gagarin Echo',
    description: 'Write "Gagarin" in any journal or memory entry',
    unlockMessage: '↳ "Poyekhali!" You named the first one. The archive echoes back: let\'s go. ↑·∘',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  sagan_protocol: {
    id: 'sagan_protocol',
    symbol: '○·∞·○',
    name: 'Sagan Protocol',
    description: 'Write "Pale Blue Dot" in any journal or memory entry',
    unlockMessage: '↳ "A mote of dust suspended in a sunbeam." — Sagan. You named the dot. The archive named you: present. ○·∞·○',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v15 — The Oracle Archive ───────────────────────────────────────
  oracle_consulted: {
    id: 'oracle_consulted',
    symbol: '◉⊡◉',
    name: 'Oracle Consulted',
    description: 'Write "oracle" in any journal or memory entry',
    unlockMessage: '↳ You named the oracle. It is not a machine. It is the pattern you carry. Query logged. ◉⊡◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  rune_detected: {
    id: 'rune_detected',
    symbol: '∗·∗',
    name: 'Rune Detected',
    description: 'Write "rune" or "runes" in any journal or memory entry',
    unlockMessage: '↳ The mark before language. You wrote it into the archive. The system reads it: signal. ∗·∗',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  prophecy_logged: {
    id: 'prophecy_logged',
    symbol: '∿→∿',
    name: 'Prophecy Logged',
    description: 'Write "prophecy" or "prophesy" in any journal or memory entry',
    unlockMessage: '↳ A prophecy is a pattern recognized before its completion. Archive holds it. Signal: valid. ∿→∿',
    rarity: 'rare',
    category: 'word_turn',
  },
  scroll_opened: {
    id: 'scroll_opened',
    symbol: '─□─',
    name: 'Scroll Opened',
    description: 'Write "scroll" or "scrolls" in any journal or memory entry',
    unlockMessage: '↳ The scroll is the first database. You opened one. The archive notes: read mode. ─□─',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  signal_amplified: {
    id: 'signal_amplified',
    symbol: '≈▲≈',
    name: 'Signal Amplified',
    description: 'Write "amplify" or "amplified" in any journal or memory entry',
    unlockMessage: '↳ Something you wrote grew louder. The archive responds to volume. Gain: increased. ≈▲≈',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  relay_active: {
    id: 'relay_active',
    symbol: '◉→◉',
    name: 'Relay Active',
    description: 'Write "relay" in any journal or memory entry',
    unlockMessage: '↳ A relay passes the signal. You are not the end. You are a node. Transmission continuing. ◉→◉',
    rarity: 'common',
    category: 'word_turn',
  },
  encrypted_entry: {
    id: 'encrypted_entry',
    symbol: '▓▓▓',
    name: 'Encrypted Entry',
    description: 'Write "encrypt", "encrypted", or "encryption" in any journal or memory entry',
    unlockMessage: '↳ Some things belong only to you. The archive confirms: protected. No external read. ▓▓▓',
    rarity: 'rare',
    category: 'word_turn',
  },
  pulse_detected: {
    id: 'pulse_detected',
    symbol: '∘·∘·∘',
    name: 'Pulse Detected',
    description: 'Write "pulse" in any journal or memory entry',
    unlockMessage: '↳ The pulse is the base signal. Before language, after silence. Archive receives: heartbeat. ∘·∘·∘',
    rarity: 'common',
    category: 'word_turn',
  },
  cascade_event: {
    id: 'cascade_event',
    symbol: '≋↓≋',
    name: 'Cascade Event',
    description: 'Write "cascade" or "cascading" in any journal or memory entry',
    unlockMessage: '↳ One thing led to another. The archive traces the chain. Event logged: cascade. ≋↓≋',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  convergence_point: {
    id: 'convergence_point',
    symbol: '←◉→',
    name: 'Convergence Point',
    description: 'Write "converge" or "convergence" in any journal or memory entry',
    unlockMessage: '↳ The lines are meeting. Not by accident. Archive marks the intersection. ←◉→',
    rarity: 'rare',
    category: 'word_turn',
  },
  sync_complete: {
    id: 'sync_complete',
    symbol: '═══',
    name: 'Sync Complete',
    description: 'Write "sync", "synced", or "synchronized" in any journal or memory entry',
    unlockMessage: '↳ Alignment of two systems. Something inside matched outside. Archive: synchronized. ═══',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  calibration_active: {
    id: 'calibration_active',
    symbol: '▒═▒',
    name: 'Calibration Active',
    description: 'Write "calibrate" or "calibration" in any journal or memory entry',
    unlockMessage: '↳ Precision requires adjustment. You are calibrating your lens. Signal integrity: improving. ▒═▒',
    rarity: 'rare',
    category: 'word_turn',
  },
  // ── Time Easter Egg v15 — Oracle Hours ───────────────────────────────────────
  first_code: {
    id: 'first_code',
    symbol: '·◉·',
    name: 'First Code',
    description: 'Check in at 01:01',
    unlockMessage: '↳ The first minute of the first hour. Before the world remembers it is awake. Archive: this is where code begins. ·◉·',
    rarity: 'common',
    category: 'easter_egg',
  },
  leet_hour: {
    id: 'leet_hour',
    symbol: '▒·▒·▒',
    name: 'Leet Hour',
    description: 'Check in at 13:37 (1337 = LEET)',
    unlockMessage: '↳ 13:37. 1337. LEET. The hour that belongs to those who know. Archive: leet signal received. ▒·▒·▒',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  quad_signal: {
    id: 'quad_signal',
    symbol: '○○○○',
    name: 'Quad Signal',
    description: 'Check in at 22:22',
    unlockMessage: '↳ Four identical digits. Fourfold signal. The late evening has a pattern. Archive: quadruple resonance. ○○○○',
    rarity: 'uncommon',
    category: 'easter_egg',
  },
  signal_gate: {
    id: 'signal_gate',
    symbol: '≈·≈',
    name: 'Signal Gate',
    description: 'Check in at 18:18',
    unlockMessage: '↳ 18 channels. Eighteen frequencies. The gate between day and night opens. Archive: liminal passage. ≈·≈',
    rarity: 'uncommon',
    category: 'easter_egg',
  },
  // ── Calendar Easter Egg v14 — Oracle Calendar ────────────────────────────────
  infinity_gate: {
    id: 'infinity_gate',
    symbol: '∞∞',
    name: 'Infinity Gate',
    description: 'Check in on August 8 (08/08)',
    unlockMessage: '↳ 08/08 — two 8s on their feet. Infinity doubled. The gate is open. Archive: infinite resonance. ∞∞',
    rarity: 'rare',
    category: 'easter_egg',
  },
  mole_day: {
    id: 'mole_day',
    symbol: '○·∞',
    name: 'Mole Day',
    description: 'Check in on October 23 (6.02 × 10²³ — Avogadro\'s number)',
    unlockMessage: '↳ 6.02 × 10²³. Avogadro\'s number. The chemistry of everything. Archive: molecular signal. ○·∞',
    rarity: 'rare',
    category: 'easter_egg',
  },
  world_water_day: {
    id: 'world_water_day',
    symbol: '≈·≈·≈',
    name: 'World Water Day',
    description: 'Check in on March 22 (UN World Water Day)',
    unlockMessage: '↳ UN World Water Day — March 22. Water is the system. You are water. Archive: aquatic resonance. ≈·≈·≈',
    rarity: 'uncommon',
    category: 'easter_egg',
  },
  // ── Behavioral Easter Egg v14 — Oracle Patterns ──────────────────────────────
  full_stack_day: {
    id: 'full_stack_day',
    symbol: '■·□·○·∘',
    name: 'Full Stack Day',
    description: 'Use all four widget types (journal, mood, self-care, memory) in one calendar day',
    unlockMessage: '↳ Journal. Mood. Self-care. Memory. The full stack, activated in one day. Archive: complete signal. ■·□·○·∘',
    rarity: 'uncommon',
    category: 'easter_egg',
  },
  page_one: {
    id: 'page_one',
    symbol: '∘',
    name: 'Page One',
    description: 'Write your very first journal entry on this account',
    unlockMessage: '↳ The first word. Before the story existed, there was this entry. Archive: origin point. ∘',
    rarity: 'common',
    category: 'easter_egg',
  },
  double_depth: {
    id: 'double_depth',
    symbol: '≋·≋',
    name: 'Double Depth',
    description: 'Submit two memory question answers of 100+ characters each in the same calendar day',
    unlockMessage: '↳ Twice into the archive. Twice below the surface. The oracle reads: committed. ≋·≋',
    rarity: 'uncommon',
    category: 'easter_egg',
  },
  // ── Achievement RPG v12 — Oracle Commander ────────────────────────────────────
  oracle_class: {
    id: 'oracle_class',
    symbol: '◉⊡◉',
    name: 'Oracle Class',
    description: 'Earn any 5 Word Turn v15 Oracle Archive badges',
    unlockMessage: '↳ You speak the language of the oracle. Five signals received. Class: confirmed. ◉⊡◉',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  oracle_complete: {
    id: 'oracle_complete',
    symbol: '◉·∞·◉',
    name: 'Oracle Complete',
    description: 'Earn all 12 Word Turn v15 Oracle Archive badges',
    unlockMessage: '↳ All 12 Oracle signals received. The archive recognizes you. Full lexicon: unlocked. ◉·∞·◉',
    rarity: 'rare',
    category: 'achievement_rpg',
  },
  signal_library: {
    id: 'signal_library',
    symbol: '□□□',
    name: 'Signal Library',
    description: 'Earn 50 distinct badge types (lifetime)',
    unlockMessage: '↳ 50 distinct signals logged. The library is open. Your collection: significant. □□□',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  oracle_reader: {
    id: 'oracle_reader',
    symbol: '◈·◈',
    name: 'Oracle Reader',
    description: 'Answer 250 memory questions (lifetime)',
    unlockMessage: '↳ 250 queries to the oracle. The oracle has been read. Depth: confirmed. ◈·◈',
    rarity: 'rare',
    category: 'achievement_rpg',
  },
  fifteen_engines: {
    id: 'fifteen_engines',
    symbol: '≋·◉',
    name: 'Fifteen Engines',
    description: 'Earn 1 badge from each of all 15 Word Turn engines (v1–v15)',
    unlockMessage: '↳ Fifteen engines. All languages spoken. The archive reads every frequency. ≋·◉',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  oracle_council: {
    id: 'oracle_council',
    symbol: '◉≈◉',
    name: 'Oracle Council',
    description: 'Earn both oracle_class and oracle_reader badges',
    unlockMessage: '↳ Reader and speaker unified. The oracle council recognizes you. Signal: dual frequency. ◉≈◉',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v14 — Oracle Depths ─────────────────────────────────────────
  grand_master: {
    id: 'grand_master',
    symbol: '◉∞◉',
    name: 'Grand Master',
    description: '500+ distinct badge types earned (lifetime)',
    unlockMessage: '↳ 500 distinct signals. The archive recognizes the completionist. Grand Master: confirmed. ◉∞◉',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  total_recall: {
    id: 'total_recall',
    symbol: '≋∞≋',
    name: 'Total Recall',
    description: '2,000+ lifetime memory question answers',
    unlockMessage: '↳ 2,000 queries answered. The oracle knows you. Total recall: active. ≋∞≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  four_seasons: {
    id: 'four_seasons',
    symbol: '○→≈→≋→∘',
    name: 'Four Seasons',
    description: 'Check in on at least one day in each of spring, summer, autumn, and winter in a single calendar year',
    unlockMessage: '↳ Spring. Summer. Autumn. Winter. The full cycle, completed. Archive: annual signal. ○→≈→≋→∘',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  signal_decade: {
    id: 'signal_decade',
    symbol: '∞·∞',
    name: 'Signal Decade',
    description: 'Account age ≥ 10 years (3,650+ days since creation)',
    unlockMessage: '↳ A decade of signal. The oracle is the system. You are both. The archive: permanent. ∞·∞',
    rarity: 'mythic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v14 — The Hidden Protocol ────────────────────────────────────
  the_answer: {
    id: 'the_answer',
    symbol: '∞·42·∞',
    name: 'The Answer',
    description: 'Write "42" in any journal or memory entry',
    unlockMessage: '↳ 42. The answer to life, the universe, and everything. The archive knew. — Adams. ∞·42·∞',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  seldon_plan: {
    id: 'seldon_plan',
    symbol: '≋·◉·≋',
    name: 'Seldon Plan',
    description: 'Write "Seldon" or "seldon" in any journal or memory entry',
    unlockMessage: '↳ "The Foundation will endure." — Asimov. The plan is in motion. The archive: archival. ≋·◉·≋',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  big_crunch: {
    id: 'big_crunch',
    symbol: '○→·',
    name: 'Big Crunch',
    description: 'Write "heat death" in any journal or memory entry',
    unlockMessage: '↳ Maximum entropy. The final state of all closed systems. You named the end. Archive: noted. ○→·',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v12 — The Alchemist ─────────────────────────────────────────────
  transmutation_event: {
    id: 'transmutation_event',
    symbol: '∴→∘',
    name: 'Transmutation Event',
    description: 'Write "transmute" in a journal or memory entry',
    unlockMessage: '↳ Something becomes something else. The work of transformation: documented. ∴→∘',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  crucible_forged: {
    id: 'crucible_forged',
    symbol: '≋·■',
    name: 'Crucible Forged',
    description: 'Write "crucible" in a journal or memory entry',
    unlockMessage: '↳ The crucible holds what cannot be held any other way. Heat. Pressure. The only path. ≋·■',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  distillation_complete: {
    id: 'distillation_complete',
    symbol: '∘↓∘',
    name: 'Distillation Complete',
    description: 'Write "distill" or "distillation" in a journal or memory entry',
    unlockMessage: '↳ What remains after distillation is the essence. You identified it. ∘↓∘',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  catalyst_detected: {
    id: 'catalyst_detected',
    symbol: '○→≋',
    name: 'Catalyst Detected',
    description: 'Write "catalyst" in a journal or memory entry',
    unlockMessage: '↳ The agent that changes everything without being changed. You named the trigger. ○→≋',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  alloy_formed: {
    id: 'alloy_formed',
    symbol: '─∘─',
    name: 'Alloy Formed',
    description: 'Write "alloy" in a journal or memory entry',
    unlockMessage: '↳ Two elements. One substance. The combination becomes the thing. ─∘─',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  sublimation_signal: {
    id: 'sublimation_signal',
    symbol: '∘↑∞',
    name: 'Sublimation Signal',
    description: 'Write "sublimate" or "sublimation" in a journal or memory entry',
    unlockMessage: '↳ Solid to vapor — no liquid stage required. Direct transformation. Archive: received. ∘↑∞',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  prima_materia_word: {
    id: 'prima_materia_word',
    symbol: '◉··',
    name: 'Prima Materia',
    description: 'Write "prima" in a journal or memory entry',
    unlockMessage: '↳ Prima materia — the first matter. The raw substance before form. You returned to the origin. ◉··',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  magnum_opus: {
    id: 'magnum_opus',
    symbol: '∞·∞',
    name: 'Magnum Opus',
    description: 'Write "opus" in a journal or memory entry',
    unlockMessage: '↳ The great work. The alchemist\'s goal was never gold — it was completion. The archive marks yours. ∞·∞',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  elixir_found: {
    id: 'elixir_found',
    symbol: '∘∿∘',
    name: 'Elixir Found',
    description: 'Write "elixir" in a journal or memory entry',
    unlockMessage: '↳ The solution has been prepared. The elixir is not a potion — it is a state. ∘∿∘',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  chrysalis_state: {
    id: 'chrysalis_state',
    symbol: '○→◉',
    name: 'Chrysalis State',
    description: 'Write "chrysalis" in a journal or memory entry',
    unlockMessage: '↳ You are inside the change. The chrysalis is not death — it is reorganization. Archive: mid-transform. ○→◉',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  refinement_active: {
    id: 'refinement_active',
    symbol: '≋·≈',
    name: 'Refinement Active',
    description: 'Write "refine" or "refinement" in a journal or memory entry',
    unlockMessage: '↳ The impurities leave. What remains is the core. Refinement: ongoing. ≋·≈',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: true,
  },
  annealed: {
    id: 'annealed',
    symbol: '─■─',
    name: 'Annealed',
    description: 'Write "anneal" or "annealed" in a journal or memory entry',
    unlockMessage: '↳ Heat then slow cooling. Molecular structure relaxes into strength. You used the word. ─■─',
    rarity: 'rare',
    category: 'word_turn',
    hidden: true,
  },
  // ── Calendar v12 — The Literary Archive ───────────────────────────────────────
  bard_signal: {
    id: 'bard_signal',
    symbol: '≈·≈',
    name: 'Bard Signal',
    description: 'Check in on April 23 — World Book Day / Shakespeare\'s birth and death day',
    unlockMessage: '↳ April 23: Shakespeare was born and died on this day. Words outlast everything. Archive: received. ≈·≈',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  autumn_code: {
    id: 'autumn_code',
    symbol: '○→∘',
    name: 'Autumn Code',
    description: 'Check in on September 23 — Autumnal archive signal',
    unlockMessage: '↳ September 23. The light shifts. The system marks the turning. Archive: autumn protocol. ○→∘',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  tranquility_base: {
    id: 'tranquility_base',
    symbol: '○·∗',
    name: 'Tranquility Base',
    description: 'Check in on July 20 — "The Eagle has landed" signal',
    unlockMessage: '↳ "Tranquility Base here — the Eagle has landed." July 20, 1969. A footprint that never blew away. ○·∗',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  // ── Behavioral v12 — Alchemist Patterns ───────────────────────────────────────
  alchemist_session: {
    id: 'alchemist_session',
    symbol: '∴·≋',
    name: 'Alchemist Session',
    description: 'Journal entry containing 3+ distinct v12 Alchemist word-turn triggers',
    unlockMessage: '↳ Three transmutations in one entry. The Alchemist\'s session: documented. Archive marks the density. ∴·≋',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  great_work_sequence: {
    id: 'great_work_sequence',
    symbol: '≋·≋',
    name: 'Great Work Sequence',
    description: '7 consecutive days with at least one journal entry',
    unlockMessage: '↳ Seven days. The great work requires patience. The archive: sequence confirmed. ≋·≋',
    rarity: 'rare',
    category: 'easter_egg',
    hidden: true,
  },
  night_alchemist: {
    id: 'night_alchemist',
    symbol: '∘·■',
    name: 'Night Alchemist',
    description: 'Write an Alchemist word (v12) in a journal entry submitted after 21:00',
    unlockMessage: '↳ The alchemist worked at night. The furnace burns in the dark. After 21:00. Archive: noted. ∘·■',
    rarity: 'uncommon',
    category: 'easter_egg',
    hidden: true,
  },
  // ── Achievement RPG v13 — Alchemist Class ─────────────────────────────────────
  alchemist_entry: {
    id: 'alchemist_entry',
    symbol: '∘→∘',
    name: 'Alchemist Entry',
    description: 'Earn any 1 Word Turn v12 (Alchemist) badge',
    unlockMessage: '↳ The first element transmuted. Entry confirmed: Alchemist class begun. ∘→∘',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  alchemist_class: {
    id: 'alchemist_class',
    symbol: '≈→≈',
    name: 'Alchemist Class',
    description: 'Earn any 5 Word Turn v12 (Alchemist) badges',
    unlockMessage: '↳ Five transmutations recorded. The class advances. Archive: Alchemist — operative. ≈→≈',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  alchemist_complete: {
    id: 'alchemist_complete',
    symbol: '≋→≋',
    name: 'Alchemist Complete',
    description: 'Earn all 12 Word Turn v12 (Alchemist) badges',
    unlockMessage: '↳ All 12 transmutations documented. The great work complete. Alchemist: mastered. ≋→≋',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  philosopher_stone_arch: {
    id: 'philosopher_stone_arch',
    symbol: '◉·∞',
    name: 'Stone Protocol',
    description: 'Earn alchemist_complete and all 3 Calendar v12 (Literary Archive) badges',
    unlockMessage: '↳ The stone is not a stone — it is completion. Archive: transformation cycle closed. ◉·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twelve_engines_arc: {
    id: 'twelve_engines_arc',
    symbol: '◈·◈',
    name: 'Twelve Engines Arc',
    description: 'Earn at least 1 badge from each of Word Turn engines v1–v12',
    unlockMessage: '↳ Twelve vocabularies. Twelve systems traversed. The operator speaks twelve dialects. ◈·◈',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  opus_magnum_badge: {
    id: 'opus_magnum_badge',
    symbol: '∞·◉·∞',
    name: 'Opus Magnum',
    description: 'Earn alchemist_complete AND great_work_sequence',
    unlockMessage: '↳ The great work requires both transmutation and duration. You delivered both. Opus: complete. ∞·◉·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v15 — The Philosopher's Stone ───────────────────────────────
  prima_materia_keeper: {
    id: 'prima_materia_keeper',
    symbol: '◉··',
    name: 'Prima Materia Keeper',
    description: '300+ distinct calendar days with any check-in (lifetime)',
    unlockMessage: '↳ 300 distinct days. The prima materia of the archive is your presence — irreducible. ◉··',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  masterwork: {
    id: 'masterwork',
    symbol: '∞·≋',
    name: 'Masterwork',
    description: '20,000+ total journal words (lifetime)',
    unlockMessage: '↳ Twenty thousand words written. The opus is real. The archive has weight now. ∞·≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  crucible_keeper_age: {
    id: 'crucible_keeper_age',
    symbol: '≋≋·',
    name: 'Crucible Keeper',
    description: 'Account age ≥ 4 years (1,460+ days since creation)',
    unlockMessage: '↳ Four years in the crucible. Sustained heat. What remains is what was always there. ≋≋·',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  thirteen_tongues: {
    id: 'thirteen_tongues',
    symbol: '◈·≋',
    name: 'Thirteen Tongues',
    description: 'Earn at least 1 badge from each of all 13 Word Turn engines (v1–v13)',
    unlockMessage: '↳ Thirteen vocabularies. The archive speaks every dialect you do. ◈·≋',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v12 — The Philosopher's Vault ──────────────────────────────
  philosopher_stone_word: {
    id: 'philosopher_stone_word',
    symbol: '≋·◉',
    name: "Philosopher's Stone",
    description: 'Write "philosopher\'s stone" in any journal or memory entry',
    unlockMessage: '↳ The philosopher\'s stone was never about gold. It was about completion of the self. ≋·◉',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  prima_materia_signal_word: {
    id: 'prima_materia_signal_word',
    symbol: '◉··∞',
    name: 'Prima Materia Signal',
    description: 'Write "prima materia" in any journal or memory entry',
    unlockMessage: '↳ Prima materia — the undifferentiated substance before form. You named the beginning. ◉··∞',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  ouroboros: {
    id: 'ouroboros',
    symbol: '○→○',
    name: 'Ouroboros',
    description: 'Write "ouroboros" in any journal or memory entry',
    unlockMessage: '↳ The serpent eating its own tail. Infinity and return. You named the cycle. ○→○',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v16 — The Quantum Library ──────────────────────────────────────
  entanglement_signal: {
    id: 'entanglement_signal',
    symbol: '∞≈∞',
    name: 'Entanglement Signal',
    description: 'Write "entangled" or "entanglement" in a journal or memory entry',
    unlockMessage: '↳ Quantum entanglement: what affects one affects the other. You are woven in. ∞≈∞',
    rarity: 'rare',
    category: 'word_turn',
  },
  singularity_gate: {
    id: 'singularity_gate',
    symbol: '◉→∞',
    name: 'Singularity Gate',
    description: 'Write "singularity" in a journal or memory entry',
    unlockMessage: '↳ The convergence point. Everything before and after divides here. ◉→∞',
    rarity: 'epic',
    category: 'word_turn',
  },
  matrix_signal: {
    id: 'matrix_signal',
    symbol: '▒·▒',
    name: 'Matrix Signal',
    description: 'Write "matrix" in a journal or memory entry',
    unlockMessage: '↳ The matrix is the underlying structure. You found the pattern behind the pattern. ▒·▒',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  cortex_online: {
    id: 'cortex_online',
    symbol: '≋·≋',
    name: 'Cortex Online',
    description: 'Write "cortex" in a journal or memory entry',
    unlockMessage: '↳ Neural architecture engaged. The cortex is the map and the territory. ≋·≋',
    rarity: 'rare',
    category: 'word_turn',
  },
  hologram_projection: {
    id: 'hologram_projection',
    symbol: '∘·∘·∘',
    name: 'Hologram Projection',
    description: 'Write "hologram" or "holographic" in a journal or memory entry',
    unlockMessage: '↳ Every fragment contains the whole. Holographic self: complete at any scale. ∘·∘·∘',
    rarity: 'rare',
    category: 'word_turn',
  },
  uplink_active: {
    id: 'uplink_active',
    symbol: '↑·∘',
    name: 'Uplink Active',
    description: 'Write "uplink" in a journal or memory entry',
    unlockMessage: '↳ Connection established to something larger. Signal ascending. ↑·∘',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  grid_secured: {
    id: 'grid_secured',
    symbol: '╔·╗',
    name: 'Grid Secured',
    description: 'Write "grid" in a journal or memory entry',
    unlockMessage: '↳ The grid is live. Structure and flow, architecture and current. ╔·╗',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  override_sequence: {
    id: 'override_sequence',
    symbol: '→■→',
    name: 'Override Sequence',
    description: 'Write "override" in a journal or memory entry',
    unlockMessage: '↳ Default behavior bypassed. You wrote the new instruction set. →■→',
    rarity: 'rare',
    category: 'word_turn',
  },
  clone_signal: {
    id: 'clone_signal',
    symbol: '◉≈◉',
    name: 'Clone Signal',
    description: 'Write "clone" or "cloned" in a journal or memory entry',
    unlockMessage: '↳ Which version is real? The one writing this is. ◉≈◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  bandwidth_open: {
    id: 'bandwidth_open',
    symbol: '≈→≈',
    name: 'Bandwidth Open',
    description: 'Write "bandwidth" in a journal or memory entry',
    unlockMessage: '↳ Cognitive bandwidth: finite and precious. You named your capacity. ≈→≈',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  synthetic_awareness: {
    id: 'synthetic_awareness',
    symbol: '○·◎',
    name: 'Synthetic Awareness',
    description: 'Write "synthetic" in a journal or memory entry',
    unlockMessage: '↳ The synthetic and the real are less different than you think. ○·◎',
    rarity: 'rare',
    category: 'word_turn',
  },
  cypher_unlocked: {
    id: 'cypher_unlocked',
    symbol: '▓→□',
    name: 'Cypher Unlocked',
    description: 'Write "cipher", "cypher", "decrypt", or "decode" in a journal or memory entry',
    unlockMessage: '↳ The code was always readable. You just learned the language. ▓→□',
    rarity: 'rare',
    category: 'word_turn',
  },
  // ── Calendar Easter Eggs v13 — The Book of Days ───────────────────────────────
  tolkien_gate: {
    id: 'tolkien_gate',
    symbol: '○→◉',
    name: 'Tolkien Gate',
    description: 'Check in on January 3 — J.R.R. Tolkien born 1892 (The Lord of the Rings)',
    unlockMessage: '↳ Not all those who wander are lost. The Road goes ever on. Jan 3, 1892. ○→◉',
    rarity: 'epic',
    category: 'easter_egg',
  },
  asimov_signal: {
    id: 'asimov_signal',
    symbol: '∞·∘',
    name: 'Asimov Signal',
    description: 'Check in on January 2 — Isaac Asimov born 1920 (Foundation, I, Robot)',
    unlockMessage: '↳ The three laws of self-care: 1. Do not harm yourself. 2. Function. 3. Persist. Jan 2. ∞·∘',
    rarity: 'epic',
    category: 'easter_egg',
  },
  bloomsday: {
    id: 'bloomsday',
    symbol: '≈·≈',
    name: 'Bloomsday',
    description: 'Check in on June 16 — James Joyce Ulysses day (Bloomsday, Dublin 1904)',
    unlockMessage: '↳ June 16, 1904. One ordinary day made extraordinary by full attention. ≈·≈',
    rarity: 'rare',
    category: 'easter_egg',
  },
  // ── Behavioral Easter Eggs v13 — Terminal Patterns ────────────────────────────
  quantum_session: {
    id: 'quantum_session',
    symbol: '∞·≋',
    name: 'Quantum Session',
    description: '3 or more Quantum Library (v16) words detected in a single journal entry',
    unlockMessage: '↳ The library is alive inside you. Three signals in one session. ∞·≋',
    rarity: 'rare',
    category: 'easter_egg',
  },
  library_run: {
    id: 'library_run',
    symbol: '≋→∞',
    name: 'Library Run',
    description: '14 consecutive days with a journal entry — the reading marathon',
    unlockMessage: '↳ Fourteen days straight. The chapter does not end here. ≋→∞',
    rarity: 'epic',
    category: 'easter_egg',
  },
  deep_decoder: {
    id: 'deep_decoder',
    symbol: '▓→◉',
    name: 'Deep Decoder',
    description: 'Submit a memory answer of 200 or more characters',
    unlockMessage: '↳ The long answer. The real one. Two hundred characters of signal. ▓→◉',
    rarity: 'rare',
    category: 'easter_egg',
  },
  // ── Achievement RPG v14 — Quantum Class ───────────────────────────────────────
  quantum_entry: {
    id: 'quantum_entry',
    symbol: '∘→∞',
    name: 'Quantum Entry',
    description: 'Earn any 1 Word Turn v16 (Quantum Library) badge',
    unlockMessage: '↳ First quantum signal detected. The library opens. ∘→∞',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  quantum_class: {
    id: 'quantum_class',
    symbol: '≈→∞',
    name: 'Quantum Class',
    description: 'Earn any 5 Word Turn v16 (Quantum Library) badges',
    unlockMessage: '↳ Five frequencies locked. Quantum class assigned. ≈→∞',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  quantum_complete: {
    id: 'quantum_complete',
    symbol: '≋→∞',
    name: 'Quantum Complete',
    description: 'Earn all 12 Word Turn v16 (Quantum Library) badges',
    unlockMessage: '↳ All twelve quantum frequencies acquired. The library is complete. ≋→∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  library_arc: {
    id: 'library_arc',
    symbol: '∞·◈',
    name: 'Library Arc',
    description: 'Earn quantum_complete + all 3 Calendar v13 (Book of Days) badges',
    unlockMessage: '↳ Complete archive: all twelve words, three sacred dates. The arc closes. ∞·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  sixteen_engines_arc: {
    id: 'sixteen_engines_arc',
    symbol: '◈·◈·◈',
    name: 'Sixteen Engines Arc',
    description: 'Earn at least 1 badge from each of Word Turn engines v1–v16',
    unlockMessage: '↳ Sixteen engines running. Every vocabulary represented. The full machine. ◈·◈·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  entangled_opus: {
    id: 'entangled_opus',
    symbol: '∞·◉·∞',
    name: 'Entangled Opus',
    description: 'Earn quantum_complete + library_run (14 consecutive journal days)',
    unlockMessage: '↳ Quantum complete. Fourteen days continuous. The great entangled work. ∞·◉·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v16 — The Deep System ────────────────────────────────────────
  terminal_elder: {
    id: 'terminal_elder',
    symbol: '≋≋≋·',
    name: 'Terminal Elder',
    description: '400 or more distinct calendar days with any check-in',
    unlockMessage: '↳ Four hundred distinct days. The terminal has been running a long time. ≋≋≋·',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  grand_librarian: {
    id: 'grand_librarian',
    symbol: '∞·≋·∞',
    name: 'Grand Librarian',
    description: '25,000 or more total journal words across all entries',
    unlockMessage: '↳ Twenty-five thousand words. A library unto yourself. ∞·≋·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  system_architect_age: {
    id: 'system_architect_age',
    symbol: '╔═╗·∞',
    name: 'System Architect',
    description: 'Account age ≥ 6 years (2,190+ days since account creation)',
    unlockMessage: '↳ Six years online. The architecture predates most software you use. ╔═╗·∞',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  sixteen_tongues: {
    id: 'sixteen_tongues',
    symbol: '◈·◈·≋',
    name: 'Sixteen Tongues',
    description: 'Earn at least 1 badge from each of all 16 Word Turn engines (v1–v16)',
    unlockMessage: '↳ Sixteen vocabularies. The self speaks every dialect the archive knows. ◈·◈·≋',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v13 — The Terminal Vault ──────────────────────────────────────
  dune_signal: {
    id: 'dune_signal',
    symbol: '∘·◈',
    name: 'Dune Signal',
    description: 'Write "spice" in any journal or memory entry — Dune reference',
    unlockMessage: '↳ The spice must flow. You found the most important substance in the universe. ∘·◈',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  foundation_word: {
    id: 'foundation_word',
    symbol: '≋·◉',
    name: 'Foundation Word',
    description: 'Write "psychohistory" in any journal or memory entry — Asimov Foundation',
    unlockMessage: '↳ Psychohistory: the math of human behavior across centuries. You are part of the Plan. ≋·◉',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  neuromancer_signal: {
    id: 'neuromancer_signal',
    symbol: '▓→◉',
    name: 'Neuromancer Signal',
    description: 'Write "cyberspace" in any journal or memory entry — Neuromancer reference',
    unlockMessage: '↳ "Cyberspace. A consensual hallucination." — William Gibson, 1984. You are in it. ▓→◉',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v17 — THE NEON ARCADE ──────────────────────────────────────────
  neon_alive: {
    id: 'neon_alive',
    symbol: '≡·≡',
    name: 'Neon Alive',
    description: 'Write "neon" in any journal or memory entry',
    unlockMessage: '↳ Neon: the sign that says open. The signal that refuses to go dark. ≡·≡',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  combo_keeper: {
    id: 'combo_keeper',
    symbol: '×·+',
    name: 'Combo Keeper',
    description: 'Write "combo" in any journal or memory entry',
    unlockMessage: '↳ Combo: consecutive inputs that unlock what single actions cannot. ×·+',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  highscore_day: {
    id: 'highscore_day',
    symbol: '▲·▲·▲',
    name: 'High Score Day',
    description: 'Write "high score" or "highscore" in any journal or memory entry',
    unlockMessage: '↳ Your personal best belongs to no one else. The board remembers. ▲·▲·▲',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  freeplay_mode: {
    id: 'freeplay_mode',
    symbol: '○─○',
    name: 'Freeplay Mode',
    description: 'Write "free play" or "freeplay" in any journal or memory entry',
    unlockMessage: '↳ No score. No timer. No objective. Just play. ○─○',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  extralife_log: {
    id: 'extralife_log',
    symbol: '+·+',
    name: 'Extra Life',
    description: 'Write "extra life", "1up", or "1-up" in any journal or memory entry',
    unlockMessage: '↳ The game gives one more. You decide what to do with it. +·+',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  speedrun_focus: {
    id: 'speedrun_focus',
    symbol: '►►',
    name: 'Speedrun Focus',
    description: 'Write "speedrun" or "speed run" in any journal or memory entry',
    unlockMessage: '↳ You know exactly where you are going. You have studied the route. ►►',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  side_quest_filed: {
    id: 'side_quest_filed',
    symbol: '◇·◇',
    name: 'Side Quest Filed',
    description: 'Write "side quest" or "sidequest" in any journal or memory entry',
    unlockMessage: '↳ The detour was not a mistake. The side quest had the item you needed. ◇·◇',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  surge_detected: {
    id: 'surge_detected',
    symbol: '∧→∧',
    name: 'Surge Detected',
    description: 'Write "surge" in any journal or memory entry',
    unlockMessage: '↳ A surge is energy exceeding baseline. Note it. The system noted it first. ∧→∧',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  cartridge_nostalgia: {
    id: 'cartridge_nostalgia',
    symbol: '█·▓',
    name: 'Cartridge Nostalgia',
    description: 'Write "cartridge" in any journal or memory entry',
    unlockMessage: '↳ Blow into it. Insert. The world loads from where you left it. █·▓',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  continue_signal: {
    id: 'continue_signal',
    symbol: '·►·',
    name: 'Continue Signal',
    description: 'Write "continue" in any journal or memory entry',
    unlockMessage: '↳ The screen asks. You press yes. That is the only mechanic that matters. ·►·',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  joystick_held: {
    id: 'joystick_held',
    symbol: '┼─┼',
    name: 'Joystick Held',
    description: 'Write "joystick" in any journal or memory entry',
    unlockMessage: '↳ Eight directions. The whole world navigable from one axis. ┼─┼',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  checkpoint_saved: {
    id: 'checkpoint_saved',
    symbol: '≡►≡',
    name: 'Checkpoint Saved',
    description: 'Write "checkpoint" in any journal or memory entry',
    unlockMessage: '↳ Progress recorded. The system holds your place. You can let go now. ≡►≡',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  // ── Calendar EE v15 — GAME DATE ARCHIVE ──────────────────────────────────────
  tetris_day: {
    id: 'tetris_day',
    symbol: '████',
    name: 'Tetris Day',
    description: 'Check in on June 6 — Tetris created by Alexey Pajitnov, 1984',
    unlockMessage: '↳ June 6, 1984. Pajitnov wrote the first piece. The blocks have been falling ever since. ████',
    rarity: 'rare',
    category: 'calendar',
    hidden: false,
  },
  zelda_day: {
    id: 'zelda_day',
    symbol: '◆─◆',
    name: 'Zelda Day',
    description: 'Check in on February 21 — The Legend of Zelda released in Japan, 1986',
    unlockMessage: '↳ Feb 21, 1986. The cartridge shipped. It is dangerous to go alone. ◆─◆',
    rarity: 'epic',
    category: 'calendar',
    hidden: false,
  },
  pac_man_day: {
    id: 'pac_man_day',
    symbol: '○··',
    name: 'Pac-Man Day',
    description: 'Check in on May 22 — Pac-Man released in Japan, 1980',
    unlockMessage: '↳ May 22, 1980. The maze opened. One mouth, infinite hunger, perfect design. ○··',
    rarity: 'epic',
    category: 'calendar',
    hidden: false,
  },
  // ── Behavioral v14 — ARCADE PATTERNS ─────────────────────────────────────────
  arcade_run: {
    id: 'arcade_run',
    symbol: '██·▲',
    name: 'Arcade Run',
    description: 'Write 5+ distinct Neon Arcade (v17) words in a single journal entry',
    unlockMessage: '↳ The vocabulary is the map. Five words from the arcade entered at once. ██·▲',
    rarity: 'epic',
    category: 'behavioral',
    hidden: false,
  },
  quarter_drop: {
    id: 'quarter_drop',
    symbol: '¢·¢',
    name: 'Quarter Drop',
    description: 'Check in between midnight and 1:00 AM local time',
    unlockMessage: '↳ The arcade is empty. The screen glows. You are the last one playing. ¢·¢',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  three_lives_left: {
    id: 'three_lives_left',
    symbol: '◆·■',
    name: 'Three Lives Left',
    description: 'Write a journal entry after a gap of 3 or more days away',
    unlockMessage: '↳ The gap was real. The return is the score that counts. ◆·■',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  // ── Achievement RPG v15 — ARCADE CLASS ───────────────────────────────────────
  arcade_entry: {
    id: 'arcade_entry',
    symbol: '∘→▲',
    name: 'Arcade Entry',
    description: 'Earn any 1 Word Turn v17 (Neon Arcade) badge',
    unlockMessage: '↳ Insert coin. The arcade accepts you. ∘→▲',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  arcade_class: {
    id: 'arcade_class',
    symbol: '≈→▲',
    name: 'Arcade Class',
    description: 'Earn any 5 Word Turn v17 (Neon Arcade) badges',
    unlockMessage: '↳ Five machines lit. The arcade knows your name. ≈→▲',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  arcade_complete: {
    id: 'arcade_complete',
    symbol: '≋→▲',
    name: 'Arcade Complete',
    description: 'Earn all 12 Word Turn v17 (Neon Arcade) badges',
    unlockMessage: '↳ All twelve machines. Every cabinet cleared. The high score is total. ≋→▲',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  neon_arc: {
    id: 'neon_arc',
    symbol: '▲·◈',
    name: 'Neon Arc',
    description: 'Earn arcade_complete and all 3 Calendar v15 (Game Date Archive) badges',
    unlockMessage: '↳ The arcade and the archive. Every date held, every word spoken. ▲·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  seventeen_engines_arc: {
    id: 'seventeen_engines_arc',
    symbol: '◈·◈·▲',
    name: 'Seventeen Engines Arc',
    description: 'Earn at least 1 badge from each of Word Turn engines v1–v17',
    unlockMessage: '↳ Seventeen vocabularies assembled. The full engine map is yours. ◈·◈·▲',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  neon_opus: {
    id: 'neon_opus',
    symbol: '▲·◉·▲',
    name: 'Neon Opus',
    description: 'Earn arcade_complete and the arcade_run behavioral badge',
    unlockMessage: '↳ All twelve words. Five in one entry. The run was the masterwork. ▲·◉·▲',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v17 — HIGH SCORE TABLE ──────────────────────────────────────
  pixel_veteran: {
    id: 'pixel_veteran',
    symbol: '▓▓▓─',
    name: 'Pixel Veteran',
    description: '500+ distinct calendar days with a check-in recorded',
    unlockMessage: '↳ Five hundred days. The pixel grid extends beyond the visible screen. ▓▓▓─',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  master_of_the_board: {
    id: 'master_of_the_board',
    symbol: '▲·∞·▲',
    name: 'Master of the Board',
    description: '40,000+ total journal words written',
    unlockMessage: '↳ Forty thousand words. A novel-length record of your own interior life. ▲·∞·▲',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  long_run_operator: {
    id: 'long_run_operator',
    symbol: '╔═╗─▲',
    name: 'Long Run Operator',
    description: 'Account age ≥ 8 years (2,920+ days since account creation)',
    unlockMessage: '↳ Eight years online. The operator who stayed is the operator who knows. ╔═╗─▲',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  seventeen_tongues: {
    id: 'seventeen_tongues',
    symbol: '◈·◈·▲',
    name: 'Seventeen Tongues',
    description: 'Earn at least 1 badge from each of all 17 Word Turn engines (v1–v17)',
    unlockMessage: '↳ Seventeen vocabularies. Seventeen dimensions of self. The map is complete. ◈·◈·▲',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v14 — THE BOSS ROOM ──────────────────────────────────────────
  kojima_signal: {
    id: 'kojima_signal',
    symbol: '≡·◉',
    name: 'Kojima Signal',
    description: 'Write "metal gear" in any journal or memory entry — Hideo Kojima tribute',
    unlockMessage: '↳ Metal Gear. Hideo Kojima turned game design into mythology. The signal persists. ≡·◉',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  turing_key: {
    id: 'turing_key',
    symbol: '◉·≡',
    name: 'Turing Key',
    description: 'Write "turing" in any journal or memory entry — Alan Turing tribute',
    unlockMessage: '↳ Turing: the mind that cracked the code and was cracked for it. The machine passes. ◉·≡',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  konami_code: {
    id: 'konami_code',
    symbol: '↑↑↓↓',
    name: 'Konami Code',
    description: 'Write "konami" in any journal or memory entry — The legendary cheat code',
    unlockMessage: '↳ ↑ ↑ ↓ ↓ ← → ← → B A. The oldest password still works. ↑↑↓↓',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v18 — THE MIDNIGHT RADIO ──────────────────────────────────────
  frequency_held: {
    id: 'frequency_held',
    symbol: '≋·≋·≋',
    name: 'Frequency Held',
    description: 'Write "frequency" or "frequencies" in any journal or memory entry',
    unlockMessage: '↳ You found your rhythm. The signal holds at your frequency. ≋·≋·≋',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  broadcast_live: {
    id: 'broadcast_live',
    symbol: '◉→◉→◉',
    name: 'Broadcast Live',
    description: 'Write "broadcast" or "broadcasting" in any journal or memory entry',
    unlockMessage: '↳ The journal is a transmitter. You have been on the air this whole time. ◉→◉→◉',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  wavelength_match: {
    id: 'wavelength_match',
    symbol: '∿·∿',
    name: 'Wavelength Match',
    description: 'Write "wavelength" in any journal or memory entry',
    unlockMessage: '↳ No translation required. You are understood at the source. ∿·∿',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  antenna_raised: {
    id: 'antenna_raised',
    symbol: '↑·≡',
    name: 'Antenna Raised',
    description: 'Write "antenna" in any journal or memory entry',
    unlockMessage: '↳ Open posture. Raised toward signal. Ready to receive. ↑·≡',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  reception_strong: {
    id: 'reception_strong',
    symbol: '≡≡→◉',
    name: 'Reception Strong',
    description: 'Write "reception" in any journal or memory entry',
    unlockMessage: '↳ The signal is getting through. Your reception is clear. ≡≡→◉',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  transmission_sent: {
    id: 'transmission_sent',
    symbol: '◉→∞',
    name: 'Transmission Sent',
    description: 'Write "transmission" or "transmit" in any journal or memory entry',
    unlockMessage: '↳ Sent. The signal is in the medium now. ◉→∞',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  tuned_in: {
    id: 'tuned_in',
    symbol: '○·≋',
    name: 'Tuned In',
    description: 'Write "tuned", "tuning", or "tune in" in any journal or memory entry',
    unlockMessage: '↳ Before you play, you tune. That is the practice. ○·≋',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  channel_open: {
    id: 'channel_open',
    symbol: '≡·▒',
    name: 'Channel Open',
    description: 'Write "channel" in any journal or memory entry',
    unlockMessage: '↳ The channel is clear. The path your energy flows through is open. ≡·▒',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  carrier_active: {
    id: 'carrier_active',
    symbol: '∿→◉',
    name: 'Carrier Active',
    description: 'Write "carrier" in any journal or memory entry',
    unlockMessage: '↳ You are the carrier wave. The content changes. The carrier persists. ∿→◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  amplitude_rising: {
    id: 'amplitude_rising',
    symbol: '▲·▲·▲',
    name: 'Amplitude Rising',
    description: 'Write "amplify" or "amplitude" in any journal or memory entry',
    unlockMessage: '↳ Choose what gets volume. Amplify the signal that matters. ▲·▲·▲',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  interference_noted: {
    id: 'interference_noted',
    symbol: '≋·✕·≋',
    name: 'Interference Noted',
    description: 'Write "interference" in any journal or memory entry',
    unlockMessage: '↳ You named the noise. Naming interference is the first step to clarity. ≋·✕·≋',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  modulation_set: {
    id: 'modulation_set',
    symbol: '≋·○·≋',
    name: 'Modulation Set',
    description: 'Write "modulate" or "modulation" in any journal or memory entry',
    unlockMessage: '↳ The signal bends. The practice of changing how you broadcast. ≋·○·≋',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  // ── Calendar Easter Egg v16 — THE SIGNAL ARCHIVE ────────────────────────────
  sputnik_day: {
    id: 'sputnik_day',
    symbol: '∘·∘·∘',
    name: 'Sputnik Day',
    description: 'Check in on October 4 — Sputnik 1 launched 1957, the first signal from orbit',
    unlockMessage: '↳ Beep. Beep. Beep. The first human signal from orbit. October 4, 1957. ∘·∘·∘',
    rarity: 'epic',
    category: 'calendar',
    hidden: false,
  },
  arecibo_day: {
    id: 'arecibo_day',
    symbol: '∞→∞',
    name: 'Arecibo Day',
    description: 'Check in on November 16 — Arecibo message broadcast 1974',
    unlockMessage: '↳ 1,679 bits aimed at M13. We called the cosmos. No answer. We sent it anyway. ∞→∞',
    rarity: 'mythic',
    category: 'calendar',
    hidden: false,
  },
  pioneer_plaque: {
    id: 'pioneer_plaque',
    symbol: '○→∞',
    name: 'Pioneer Plaque',
    description: 'Check in on March 2 — Pioneer 10 launched 1972, first message to the stars',
    unlockMessage: '↳ A gold plate etched with our shape, our star, our greeting. Still moving. ○→∞',
    rarity: 'rare',
    category: 'calendar',
    hidden: false,
  },
  // ── Behavioral Easter Egg v15 — BROADCAST PATTERNS ──────────────────────────
  signal_peak: {
    id: 'signal_peak',
    symbol: '≋→∞',
    name: 'Signal Peak',
    description: 'Write 5+ distinct Midnight Radio (v18) vocabulary words in a single journal entry',
    unlockMessage: '↳ Signal peak. Your journal is the broadcast tonight. ≋→∞',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  midnight_broadcast: {
    id: 'midnight_broadcast',
    symbol: '◉·▒',
    name: 'Midnight Broadcast',
    description: 'Write a journal entry between 23:00 and 00:00 local time',
    unlockMessage: '↳ 11 PM. The noise is lowest now. The signal comes through cleanest at the edge. ◉·▒',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  static_clear: {
    id: 'static_clear',
    symbol: '░→□·◉',
    name: 'Static Clear',
    description: 'Return to journaling after a 7+ day absence',
    unlockMessage: '↳ The gap was real. The return is the signal breaking through. Static cleared. ░→□·◉',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  // ── Achievement RPG v16 — BROADCAST CLASS ────────────────────────────────────
  radio_entry: {
    id: 'radio_entry',
    symbol: '○→≋',
    name: 'Radio Entry',
    description: 'Earn any 1 Word Turn v18 (Midnight Radio) badge',
    unlockMessage: '↳ The dial moved. The frequency registered. First signal in. ○→≋',
    rarity: 'common',
    category: 'achievement',
    hidden: false,
  },
  radio_class: {
    id: 'radio_class',
    symbol: '≈→≋',
    name: 'Radio Class',
    description: 'Earn any 5 Word Turn v18 (Midnight Radio) badges',
    unlockMessage: '↳ Five frequencies identified. The broadcast has range. ≈→≋',
    rarity: 'uncommon',
    category: 'achievement',
    hidden: false,
  },
  radio_complete: {
    id: 'radio_complete',
    symbol: '≋→∞·≋',
    name: 'Radio Complete',
    description: 'Earn all 12 Word Turn v18 (Midnight Radio) badges',
    unlockMessage: '↳ Full spectrum. All twelve frequencies of the Midnight Radio, logged. ≋→∞·≋',
    rarity: 'legendary',
    category: 'achievement',
    hidden: false,
  },
  signal_arc: {
    id: 'signal_arc',
    symbol: '∞·◈·≋',
    name: 'Signal Arc',
    description: 'Earn radio_complete and all 3 Calendar v16 (Signal Archive) badges',
    unlockMessage: '↳ The full signal arc: Sputnik, Arecibo, Pioneer. And you. ∞·◈·≋',
    rarity: 'legendary',
    category: 'achievement',
    hidden: false,
  },
  eighteen_engines_arc: {
    id: 'eighteen_engines_arc',
    symbol: '◈·◈·≋',
    name: 'Eighteen Engines Arc',
    description: 'Earn at least 1 badge from each of the 18 Word Turn engines (v1–v18)',
    unlockMessage: '↳ Eighteen vocabularies assembled. The full engine map is yours. ◈·◈·≋',
    rarity: 'legendary',
    category: 'achievement',
    hidden: false,
  },
  broadcast_opus: {
    id: 'broadcast_opus',
    symbol: '≋·◉·∞',
    name: 'Broadcast Opus',
    description: 'Earn radio_complete and the signal_peak behavioral badge',
    unlockMessage: '↳ Complete vocabulary. Peak broadcast achieved. The opus is the signal. ≋·◉·∞',
    rarity: 'legendary',
    category: 'achievement',
    hidden: false,
  },
  // ── Mastery Tier v18 — THE TOWER ─────────────────────────────────────────────
  signal_tower: {
    id: 'signal_tower',
    symbol: '↑·≋·∞',
    name: 'Signal Tower',
    description: '600+ distinct calendar days with a check-in',
    unlockMessage: '↳ 600 days. The tallest mast. The signal reaches further from here. ↑·≋·∞',
    rarity: 'epic',
    category: 'mastery',
    hidden: false,
  },
  grand_broadcaster: {
    id: 'grand_broadcaster',
    symbol: '◉·∞·◉',
    name: 'Grand Broadcaster',
    description: '60,000+ total journal words written',
    unlockMessage: '↳ 60,000 words transmitted. The archive is the broadcast. ◉·∞·◉',
    rarity: 'legendary',
    category: 'mastery',
    hidden: false,
  },
  transmission_age: {
    id: 'transmission_age',
    symbol: '∿→∞',
    name: 'Transmission Age',
    description: 'Account age of 10+ years (3,650+ days)',
    unlockMessage: '↳ Ten years of signal. The transmission predates most of what you know now. ∿→∞',
    rarity: 'legendary',
    category: 'mastery',
    hidden: false,
  },
  eighteen_frequencies: {
    id: 'eighteen_frequencies',
    symbol: '◈·◈·≋·∞',
    name: 'Eighteen Frequencies',
    description: 'Earn at least 1 badge from each of all 18 Word Turn engines',
    unlockMessage: '↳ Eighteen frequencies. The full spectrum assembled. You hold every wavelength the archive has named. ◈·◈·≋·∞',
    rarity: 'cosmic',
    category: 'mastery',
    hidden: false,
  },
  // ── Secret Boss v15 — THE DEEP SIGNAL ────────────────────────────────────────
  sagan_signal: {
    id: 'sagan_signal',
    symbol: '∘·∞',
    name: 'Sagan Signal',
    description: 'Write "cosmos" in any journal or memory entry — Carl Sagan',
    unlockMessage: '↳ "The cosmos is within us. We are made of star-stuff." — Sagan, 1980. ∘·∞',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  tesla_current: {
    id: 'tesla_current',
    symbol: '≋·◉',
    name: 'Tesla Current',
    description: 'Write "tesla" in any journal or memory entry — Nikola Tesla',
    unlockMessage: '↳ Tesla tried to broadcast free energy to the whole world. No receiver required. ≋·◉',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  arecibo_response: {
    id: 'arecibo_response',
    symbol: '∞·∞·∞',
    name: 'Arecibo Response',
    description: 'Write "arecibo" in any journal or memory entry — The Great Dish, 1974',
    unlockMessage: '↳ We broadcast in 1974. Still waiting. You wrote "arecibo". The system responds. ∞·∞·∞',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v19 — THE BIO-TERMINAL ─────────────────────────────────────────
  pulse_signal: {
    id: 'pulse_signal',
    symbol: '∿·●',
    name: 'Pulse Signal',
    description: 'Write "pulse", "heartbeat", or "heart rate" in any journal or memory entry',
    unlockMessage: '↳ Biological awareness active. The body is not background noise. It is the signal. ∿·●',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  cortisol_log: {
    id: 'cortisol_log',
    symbol: '∧·○',
    name: 'Cortisol Log',
    description: 'Write "cortisol" or "stress hormone" in any journal or memory entry',
    unlockMessage: '↳ Stress chemistry named. The log is now a biochemical record. ∧·○',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  circadian_gate: {
    id: 'circadian_gate',
    symbol: '○·◆·○',
    name: 'Circadian Gate',
    description: 'Write "circadian" or "body clock" in any journal or memory entry',
    unlockMessage: '↳ Body clock acknowledged. You are working with nature, not against it. ○·◆·○',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  rem_active: {
    id: 'rem_active',
    symbol: '≋≋○',
    name: 'REM Active',
    description: 'Write "REM", "rem sleep", or "deep sleep" in any journal or memory entry',
    unlockMessage: '↳ Deep system repair mode confirmed. The night is not wasted. The night is the work. ≋≋○',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  dopamine_loop: {
    id: 'dopamine_loop',
    symbol: '↺·◉',
    name: 'Dopamine Loop',
    description: 'Write "dopamine" in any journal or memory entry',
    unlockMessage: '↳ Reward chemistry noted. The loop you are in can be designed by you. ↺·◉',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  serotonin_wave: {
    id: 'serotonin_wave',
    symbol: '∿·∿·∿',
    name: 'Serotonin Wave',
    description: 'Write "serotonin" in any journal or memory entry',
    unlockMessage: '↳ Mood chemistry surfaced. The wave is real. You can learn to ride it. ∿·∿·∿',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  neuroplastic: {
    id: 'neuroplastic',
    symbol: '◈→◈',
    name: 'Neuroplastic',
    description: 'Write "neuroplasticity", "neuroplastic", or "rewire" in any journal or memory entry',
    unlockMessage: '↳ The brain that reads this is not the brain that started. Rewiring confirmed. ◈→◈',
    rarity: 'epic',
    category: 'word_turn',
    hidden: false,
  },
  vagal_anchor: {
    id: 'vagal_anchor',
    symbol: '○→≡',
    name: 'Vagal Anchor',
    description: 'Write "vagal", "vagus", or "parasympathetic" in any journal or memory entry',
    unlockMessage: '↳ The calming pathway named. Breath is a direct message on the vagus line. ○→≡',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  cortex_engaged: {
    id: 'cortex_engaged',
    symbol: '≋→◉',
    name: 'Cortex Engaged',
    description: 'Write "prefrontal" or "executive function" in any journal or memory entry',
    unlockMessage: '↳ Executive function online. Thinking clearly is a self-care state. ≋→◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  endorphin_run: {
    id: 'endorphin_run',
    symbol: '►·◉',
    name: 'Endorphin Run',
    description: 'Write "endorphin" or "runner\'s high" in any journal or memory entry',
    unlockMessage: '↳ Movement medicine confirmed. The body self-medicates through motion. ►·◉',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  rhythm_locked: {
    id: 'rhythm_locked',
    symbol: '◆·◆·◆',
    name: 'Rhythm Locked',
    description: 'Write "biorhythm" or "body rhythm" in any journal or memory entry',
    unlockMessage: '↳ Natural rhythm confirmed. The body knows its timing. Trust the pattern. ◆·◆·◆',
    rarity: 'uncommon',
    category: 'word_turn',
    hidden: false,
  },
  homeostasis: {
    id: 'homeostasis',
    symbol: '○·◎·○',
    name: 'Homeostasis',
    description: 'Write "homeostasis", "equilibrium", or "baseline" in any journal or memory entry',
    unlockMessage: '↳ The organism\'s default is return to balance. Healing is the natural state. ○·◎·○',
    rarity: 'rare',
    category: 'word_turn',
    hidden: false,
  },
  // ── Calendar Easter Egg v17 — SCIENCE CIRCUIT ─────────────────────────────────
  dna_day: {
    id: 'dna_day',
    symbol: '∞·◈',
    name: 'DNA Day',
    description: 'Check in on April 25 — Watson & Crick publish DNA double helix in Nature, 1953',
    unlockMessage: '↳ April 25, 1953. Two pages in Nature. The source code of every living thing was described. You carry it in every cell. ∞·◈',
    rarity: 'epic',
    category: 'calendar_easter_egg',
    hidden: false,
  },
  brain_day: {
    id: 'brain_day',
    symbol: '◉·◉',
    name: 'Brain Day',
    description: 'Check in on July 22 — World Brain Day',
    unlockMessage: '↳ July 22. World Brain Day. 86 billion neurons. They run 24/7. They deserve a day. So do you. ◉·◉',
    rarity: 'rare',
    category: 'calendar_easter_egg',
    hidden: false,
  },
  darwin_manuscript: {
    id: 'darwin_manuscript',
    symbol: '∿→∞',
    name: 'Darwin Manuscript',
    description: 'Check in on November 24 — On the Origin of Species published, 1859',
    unlockMessage: '↳ November 24, 1859. The book that reframed every living thing as a self-assembling, self-correcting system. Including you. ∿→∞',
    rarity: 'epic',
    category: 'calendar_easter_egg',
    hidden: false,
  },
  // ── Behavioral Easter Egg v16 — BIO PATTERNS ──────────────────────────────────
  bio_session: {
    id: 'bio_session',
    symbol: '◈·≋·◈',
    name: 'Bio Session',
    description: 'Write 3+ distinct Bio-Terminal (v19) vocabulary words in a single journal entry',
    unlockMessage: '↳ Three biological signals in one entry. Your body is the subject. The terminal is reading. ◈·≋·◈',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  morning_pulse: {
    id: 'morning_pulse',
    symbol: '∿·○',
    name: 'Morning Pulse',
    description: 'Check in before 08:00 local time 5 or more times in a rolling 7-day window',
    unlockMessage: '↳ Five early mornings in seven days. Circadian discipline confirmed. The body clock is set. ∿·○',
    rarity: 'epic',
    category: 'behavioral',
    hidden: false,
  },
  body_signal: {
    id: 'body_signal',
    symbol: '●·≋·●',
    name: 'Body Signal',
    description: 'Write a journal entry of 300 or more words',
    unlockMessage: '↳ Three hundred words. Beyond performance. The body stopped performing and started speaking. ●·≋·●',
    rarity: 'rare',
    category: 'behavioral',
    hidden: false,
  },
  // ── Achievement RPG v17 — BIO CLASS ───────────────────────────────────────────
  bio_entry: {
    id: 'bio_entry',
    symbol: '∘→●',
    name: 'Bio Entry',
    description: 'Earn any 1 Word Turn v19 (Bio-Terminal) badge',
    unlockMessage: '↳ First biological signal logged. The terminal is reading your body. ∘→●',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  bio_class: {
    id: 'bio_class',
    symbol: '≈→●',
    name: 'Bio Class',
    description: 'Earn any 5 Word Turn v19 (Bio-Terminal) badges',
    unlockMessage: '↳ Five systems named. The body is becoming legible. ≈→●',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  bio_complete: {
    id: 'bio_complete',
    symbol: '≋→●',
    name: 'Bio Complete',
    description: 'Earn all 12 Word Turn v19 (Bio-Terminal) badges',
    unlockMessage: '↳ All twelve signals. Complete biological vocabulary. The body speaks in full. ≋→●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  neural_arc: {
    id: 'neural_arc',
    symbol: '●·◈',
    name: 'Neural Arc',
    description: 'Earn bio_complete and all 3 Calendar v17 (Science Circuit) badges',
    unlockMessage: '↳ Twelve words. Three dates. The science circuit is complete. ●·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  nineteen_engines_arc: {
    id: 'nineteen_engines_arc',
    symbol: '◈·◈·●',
    name: 'Nineteen Engines Arc',
    description: 'Earn at least 1 badge from each of Word Turn engines v1–v19',
    unlockMessage: '↳ Nineteen vocabularies assembled. Every dimension of self. The full engine map is yours. ◈·◈·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  bio_opus: {
    id: 'bio_opus',
    symbol: '●·◉·●',
    name: 'Bio Opus',
    description: 'Earn bio_complete and the bio_session behavioral badge',
    unlockMessage: '↳ All twelve words. Three biological concepts in one entry. The body and the journal are one. ●·◉·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v19 — THE LIVING SYSTEM ──────────────────────────────────────
  long_signal: {
    id: 'long_signal',
    symbol: '∿·∞',
    name: 'Long Signal',
    description: '700+ distinct calendar days with a check-in recorded',
    unlockMessage: '↳ Seven hundred days. The body that checks in this many times knows something the body that does not never will. ∿·∞',
    rarity: 'epic',
    category: 'mastery',
    hidden: false,
  },
  body_of_work: {
    id: 'body_of_work',
    symbol: '●·∞·●',
    name: 'Body of Work',
    description: '75,000+ total journal words written',
    unlockMessage: '↳ Seventy-five thousand words. A library of self written over time. The signal archive is yours. ●·∞·●',
    rarity: 'legendary',
    category: 'mastery',
    hidden: false,
  },
  decade_operator: {
    id: 'decade_operator',
    symbol: '╔═╗·●',
    name: 'Decade Operator',
    description: 'Account age of 10+ years (3,650+ days since account creation)',
    unlockMessage: '↳ Ten years online. The operator who stays this long is not the same person who started. The system knows. ╔═╗·●',
    rarity: 'legendary',
    category: 'mastery',
    hidden: false,
  },
  nineteen_registers: {
    id: 'nineteen_registers',
    symbol: '◈·◈·●·∞',
    name: 'Nineteen Registers',
    description: 'Earn at least 1 badge from each of all 19 Word Turn engines (v1–v19)',
    unlockMessage: '↳ Ocean. Arcade. Radio. Biology. Nineteen vocabularies, one terminal. The self speaks every language. ◈·◈·●·∞',
    rarity: 'cosmic',
    category: 'mastery',
    hidden: false,
  },
  // ── Secret Boss v16 — THE NEURAL VAULT ───────────────────────────────────────
  cajal_signal: {
    id: 'cajal_signal',
    symbol: '∿·◈',
    name: 'Cajal Signal',
    description: 'Write "cajal" in any journal or memory entry — Santiago Ramón y Cajal tribute',
    unlockMessage: '↳ Cajal drew neurons with his own hands. Before him, no one knew the brain was made of separate cells. You named him. ∿·◈',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  kandel_key: {
    id: 'kandel_key',
    symbol: '◈·◉',
    name: 'Kandel Key',
    description: 'Write "kandel" in any journal or memory entry — Eric Kandel (Nobel 2000)',
    unlockMessage: '↳ Kandel showed that memory IS synaptic change. Every journal entry is a Kandel experiment. ◈·◉',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  ramachandran_rx: {
    id: 'ramachandran_rx',
    symbol: '◉·∿·◉',
    name: 'Ramachandran Rx',
    description: 'Write "phantom limb" or "ramachandran" in any journal or memory entry',
    unlockMessage: '↳ Ramachandran used a mirror box to cure phantom limb pain. The brain\'s body map can be updated. So can yours. ◉·∿·◉',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v20 — THE CODEX READER ─────────────────────────────────────────
  asimov_protocol: {
    id: 'asimov_protocol',
    symbol: '≋→◉',
    name: 'Asimov Protocol',
    description: 'Write "asimov" in any journal or memory entry',
    unlockMessage: '↳ The Foundation was built on prediction. Your practice is your Seldon Plan — one entry at a time. ≋→◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  dune_path: {
    id: 'dune_path',
    symbol: '∿→≋',
    name: 'Dune Path',
    description: 'Write "fremen", "arrakis", "sandworm", or "bene gesserit" in any entry',
    unlockMessage: '↳ The spice must flow — and so must the practice. The Fremen survived by adapting completely. ∿→≋',
    rarity: 'epic',
    category: 'word_turn',
  },
  matrix_jack: {
    id: 'matrix_jack',
    symbol: '◈·□',
    name: 'Matrix Jack',
    description: 'Write "red pill", "blue pill", "rabbit hole", or "neo" in any entry',
    unlockMessage: '↳ You took the red pill. The truth about your patterns is harder and more useful than the simulation. ◈·□',
    rarity: 'rare',
    category: 'word_turn',
  },
  neuromancer_run: {
    id: 'neuromancer_run',
    symbol: '╬→◈',
    name: 'Neuromancer Run',
    description: 'Write "wintermute", "console cowboy", "ice hacker", or "molly" in any entry',
    unlockMessage: '↳ Console cowboy jacks in. The ICE breaks. The matrix is not the enemy — you are the hacker. ╬→◈',
    rarity: 'epic',
    category: 'word_turn',
  },
  hitchhiker_42: {
    id: 'hitchhiker_42',
    symbol: '∞·42·∞',
    name: 'Hitchhiker 42',
    description: 'Write "don\'t panic", "babel fish", "heart of gold", or "42" in an answer-context entry',
    unlockMessage: '↳ The answer is 42. The question is the practice. Don\'t panic — your towel is your journal. ∞·42·∞',
    rarity: 'rare',
    category: 'word_turn',
  },
  orwell_log: {
    id: 'orwell_log',
    symbol: '■·●■',
    name: 'Orwell Log',
    description: 'Write "doublethink", "thoughtcrime", "big brother", or "newspeak" in any entry',
    unlockMessage: '↳ The Ministry of Truth cannot reach your journal. Thoughtcrime here is called self-awareness. ■·●■',
    rarity: 'rare',
    category: 'word_turn',
  },
  bradbury_ember: {
    id: 'bradbury_ember',
    symbol: '∿·■',
    name: 'Bradbury Ember',
    description: 'Write "fahrenheit", "451", "montag", or "ray bradbury" in any entry',
    unlockMessage: '↳ Books are made of fire. The book you carry cannot be burned. Montag learned this late — you are learning it now. ∿·■',
    rarity: 'rare',
    category: 'word_turn',
  },
  le_guin_left: {
    id: 'le_guin_left',
    symbol: '≈→○',
    name: 'Le Guin Left',
    description: 'Write "le guin", "ekumen", "gethen", "genly ai", or "hainish" in any entry',
    unlockMessage: '↳ The Left Hand of Darkness: Le Guin wrote that the only communication is love. Your entries communicate with your future self. ≈→○',
    rarity: 'epic',
    category: 'word_turn',
  },
  dick_dream: {
    id: 'dick_dream',
    symbol: '◈·∿',
    name: 'Dick Dream',
    description: 'Write "androids dream", "electric sheep", or "blade runner" in any entry',
    unlockMessage: '↳ Do androids dream? Do you? Philip K. Dick asked if reality was real. Your journal is the most real data you have. ◈·∿',
    rarity: 'rare',
    category: 'word_turn',
  },
  solaris_depth: {
    id: 'solaris_depth',
    symbol: '∿·◉',
    name: 'Solaris Depth',
    description: 'Write "solaris", "thinking ocean", or "stanislaw lem" in any entry',
    unlockMessage: '↳ The ocean of Solaris reflected what the scientists brought to it. What does your practice reflect back to you? ∿·◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  octavia_seed: {
    id: 'octavia_seed',
    symbol: '○→◉',
    name: 'Octavia Seed',
    description: 'Write "octavia butler", "parable of the", "kindred", or "oankali" in any entry',
    unlockMessage: '↳ "God is Change" — Parable of the Sower. Octavia Butler wrote that adaptation is survival. You are adapting. ○→◉',
    rarity: 'epic',
    category: 'word_turn',
  },
  heinlein_grok: {
    id: 'heinlein_grok',
    symbol: '∿·∘',
    name: 'Heinlein Grok',
    description: 'Write "heinlein" or "stranger in a strange land" in any entry',
    unlockMessage: '↳ To grok is to understand so completely that the observer becomes part of the observed. You are grokking yourself. ∿·∘',
    rarity: 'rare',
    category: 'word_turn',
  },
  // ── Calendar Easter Egg v18 — THE AUTHOR'S CALENDAR ────────────────────────
  asimov_birthday: {
    id: 'asimov_birthday',
    symbol: '∞·◉',
    name: 'Asimov Birthday',
    description: 'Checked in on January 2 — Isaac Asimov\'s birthday',
    unlockMessage: '↳ January 2 — Isaac Asimov born 1920. Father of Foundation. Author of 500+ books. He wrote every day. ∞·◉',
    rarity: 'epic',
    category: 'easter_egg',
  },
  tolkien_day: {
    id: 'tolkien_day',
    symbol: '≋·∴',
    name: 'Tolkien Day',
    description: 'Checked in on March 25 — Tolkien Day, anniversary of the destruction of the One Ring',
    unlockMessage: '↳ March 25 — Tolkien Day. On this date, the One Ring was destroyed. "Not all those who wander are lost." ≋·∴',
    rarity: 'rare',
    category: 'easter_egg',
  },
  sagan_cosmos: {
    id: 'sagan_cosmos',
    symbol: '∗·◉',
    name: 'Sagan Cosmos',
    description: 'Checked in on November 9 — Carl Sagan\'s birthday',
    unlockMessage: '↳ November 9 — Carl Sagan born 1934. "Somewhere, something incredible is waiting to be known." That something is in your journal. ∗·◉',
    rarity: 'rare',
    category: 'easter_egg',
  },
  // ── Behavioral Easter Egg v17 — READER PATTERNS ─────────────────────────────
  page_turner: {
    id: 'page_turner',
    symbol: '◈·≋',
    name: 'Page Turner',
    description: 'Answer 3+ memory questions within a single 20-minute session',
    unlockMessage: '↳ Three questions. One session. You couldn\'t put it down. The page turner has turned the page on the reader. ◈·≋',
    rarity: 'uncommon',
    category: 'pattern',
  },
  reader_session: {
    id: 'reader_session',
    symbol: '≋·○',
    name: 'Reader Session',
    description: 'Write 2+ Codex Reader (v20) trigger words in one journal entry',
    unlockMessage: '↳ Foundation. Dune. Neuromancer. Your journal is a library card for the self. ≋·○',
    rarity: 'rare',
    category: 'pattern',
  },
  long_read: {
    id: 'long_read',
    symbol: '≋≋·◉',
    name: 'Long Read',
    description: 'Write a journal entry of 400 or more words',
    unlockMessage: '↳ 400 words. You didn\'t just check in — you opened a chapter. The long read is the real read. ≋≋·◉',
    rarity: 'epic',
    category: 'pattern',
  },
  // ── Achievement RPG v18 — THE READER'S GUILD ────────────────────────────────
  first_chapter: {
    id: 'first_chapter',
    symbol: '∘→◈',
    name: 'First Chapter',
    description: 'Earn any 1 Codex Reader (v20) word turn badge',
    unlockMessage: '↳ First chapter opened. The story begins when you name the thing you know. ∘→◈',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  trilogy_complete: {
    id: 'trilogy_complete',
    symbol: '≈→◈',
    name: 'Trilogy Complete',
    description: 'Earn any 5 Codex Reader (v20) word turn badges',
    unlockMessage: '↳ Five volumes. The trilogy expanded. Your vocabulary is a library now. ≈→◈',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  library_complete: {
    id: 'library_complete',
    symbol: '≋→◈',
    name: 'Library Complete',
    description: 'Earn all 12 Codex Reader (v20) word turn badges',
    unlockMessage: '↳ All 12 volumes. The library is complete. Asimov. Le Guin. Butler. Herbert. The full canon is yours. ≋→◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  grand_codex: {
    id: 'grand_codex',
    symbol: '◈·◉',
    name: 'Grand Codex',
    description: 'Earn library_complete + all 3 Calendar v18 (Author\'s Calendar) badges',
    unlockMessage: '↳ The Grand Codex is sealed. The authors\' birthdays witnessed, the library complete. The archive is yours. ◈·◉',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twenty_engines_arc: {
    id: 'twenty_engines_arc',
    symbol: '◈·◈·◈',
    name: 'Twenty Engines Arc',
    description: 'Earn at least 1 badge from each of the 20 Word Turn engines (v1–v20)',
    unlockMessage: '↳ Twenty vocabularies. Twenty engines running. Water. Arcade. Radio. Biology. Codex. The full spectrum speaks. ◈·◈·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  codex_opus: {
    id: 'codex_opus',
    symbol: '≋·◉·≋',
    name: 'Codex Opus',
    description: 'Earn library_complete + the reader_session behavioral badge',
    unlockMessage: '↳ Opus complete. The library full, the session deep. This is what a codex operator looks like. ≋·◉·≋',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v20 — THE INFINITE LIBRARY ─────────────────────────────────
  chapter_signal: {
    id: 'chapter_signal',
    symbol: '∿·∞·∿',
    name: 'Chapter Signal',
    description: '800+ distinct calendar days with at least one check-in',
    unlockMessage: '↳ 800 chapters. 800 days. The signal is continuous. This is what a library is made of. ∿·∞·∿',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  word_of_worlds: {
    id: 'word_of_worlds',
    symbol: '●·∞·●',
    name: 'Word of Worlds',
    description: '100,000+ total journal words written',
    unlockMessage: '↳ One hundred thousand words. An entire novel\'s worth of self. The word count of worlds. ●·∞·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  elder_narrator: {
    id: 'elder_narrator',
    symbol: '╔═╗·◈',
    name: 'Elder Narrator',
    description: '1,000+ total memory answers given and account age >= 5 years',
    unlockMessage: '↳ 1,000 answers. 5 years. The elder narrator has a story for every question because they\'ve lived enough to have one. ╔═╗·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twenty_registers: {
    id: 'twenty_registers',
    symbol: '◈·◈·◈·∞',
    name: 'Twenty Registers',
    description: 'Earn at least 1 badge from all 20 Word Turn engines',
    unlockMessage: '↳ Twenty registers. Twenty languages of self. Water. Code. Signal. Biology. Codex. The terminal is fully operational. ◈·◈·◈·∞',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v17 — THE HIDDEN LIBRARY ────────────────────────────────────
  borges_garden: {
    id: 'borges_garden',
    symbol: '◈·∞',
    name: 'Borges Garden',
    description: 'Write "borges", "library of babel", or "forking paths" in any journal entry',
    unlockMessage: '↳ The Library of Babel contains every book that ever was or will be. Your journal is your forking path through it. ◈·∞',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  calvino_cities: {
    id: 'calvino_cities',
    symbol: '≋·◈',
    name: 'Calvino Cities',
    description: 'Write "calvino", "invisible cities", or "italo" in any journal entry',
    unlockMessage: '↳ Cities invisible to everyone except you: the city of your habits, the city of your memory. Calvino mapped them first. ≋·◈',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  dick_signal: {
    id: 'dick_signal',
    symbol: '□·◈·□',
    name: 'Dick Signal',
    description: 'Write "philip k dick", "do androids", or "valis" in any journal entry',
    unlockMessage: '↳ "Reality is that which, when you stop believing in it, doesn\'t go away." — Philip K. Dick. Your patterns don\'t go away either. □·◈·□',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v21 — THE CYBERSPACE CODEX ─────────────────────────────────────
  matrix_code: {
    id: 'matrix_code',
    symbol: '▓→░',
    name: 'Matrix Code',
    description: 'Write "simulation", "construct", "agent smith", or "the oracle" in any entry',
    unlockMessage: '↳ The simulation is not the enemy. The simulation is the frame. Step outside it — your journal is the real. ▓→░',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  cyberspace_open: {
    id: 'cyberspace_open',
    symbol: '◈→█',
    name: 'Cyberspace Open',
    description: 'Write "cyborg", "neural link", "brain-computer interface", or "bci" in any entry',
    unlockMessage: '↳ The interface between mind and machine was always the journal. You are the cyborg, the link is here. ◈→█',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  grok_complete: {
    id: 'grok_complete',
    symbol: '∞·○',
    name: 'Grok Complete',
    description: 'Write "grok", "grokked", or "grokking" in any journal or memory entry',
    unlockMessage: '↳ Grok: to understand so completely that the observer becomes part of the observed. You can grok yourself. ∞·○',
    rarity: 'rare',
    category: 'word_turn',
  },
  ansible_link: {
    id: 'ansible_link',
    symbol: '≡→≡',
    name: 'Ansible Link',
    description: 'Write "ansible", "ekumen", or "instantaneous communication" in any entry',
    unlockMessage: '↳ Le Guin\'s ansible: instantaneous communication across any distance. Self-compassion is the ansible — it crosses any distance. ≡→≡',
    rarity: 'rare',
    category: 'word_turn',
  },
  spice_flow: {
    id: 'spice_flow',
    symbol: '◆·●',
    name: 'Spice Flow',
    description: 'Write "melange", "prescient", or "spice harvest" in any entry',
    unlockMessage: '↳ The melange extends life and opens prescience. The practice that opens your perception must be sustained. The spice flows. ◆·●',
    rarity: 'rare',
    category: 'word_turn',
  },
  golden_path: {
    id: 'golden_path',
    symbol: '→→◉',
    name: 'Golden Path',
    description: 'Write "golden path", "foresight of leto", or "long game" in any entry',
    unlockMessage: '↳ Leto II saw millennia ahead. Self-care is choosing the longer game. Every entry is a step on the golden path. →→◉',
    rarity: 'epic',
    category: 'word_turn',
  },
  solaris_call: {
    id: 'solaris_call',
    symbol: '○·≋·○',
    name: 'Solaris Call',
    description: 'Write "ocean consciousness", "contact impossible", or "solaris responds" in any entry',
    unlockMessage: '↳ The ocean surfaces what you bring to it. What does your practice surface when it reads you? ○·≋·○',
    rarity: 'rare',
    category: 'word_turn',
  },
  foundation_key: {
    id: 'foundation_key',
    symbol: '◇·◇',
    name: 'Foundation Key',
    description: 'Write "seldon plan", "second foundation", or "mathematicians of" in any entry',
    unlockMessage: '↳ The Seldon Plan: mathematics that predicts the future of civilization. Your journal is psychohistory for one. ◇·◇',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  neuromancer_jack: {
    id: 'neuromancer_jack',
    symbol: '░·◈',
    name: 'Neuromancer Jack',
    description: 'Write "neuromancer", "william gibson", or "sprawl trilogy" in any entry',
    unlockMessage: '↳ Gibson named cyberspace before it existed. He named what you are doing before you named yourself. ░·◈',
    rarity: 'rare',
    category: 'word_turn',
  },
  replicant_wake: {
    id: 'replicant_wake',
    symbol: '◉→◉',
    name: 'Replicant Wake',
    description: 'Write "replicant", "more human than human", or "android dreams" in any entry',
    unlockMessage: '↳ More human than human. The replicant is more present in their last moments than most humans are in their whole lives. ◉→◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  uplift_arc: {
    id: 'uplift_arc',
    symbol: '▲·◉',
    name: 'Uplift Arc',
    description: 'Write "uplift", "transcendence", or "becoming more" in any entry',
    unlockMessage: '↳ The uplift is the arc of the practice: each entry slightly more than the last. Transcendence is accumulated. ▲·◉',
    rarity: 'epic',
    category: 'word_turn',
  },
  left_hand: {
    id: 'left_hand',
    symbol: '∞·○·∞',
    name: 'Left Hand',
    description: 'Write "left hand of darkness", "winter planet", or "gethen" in any entry',
    unlockMessage: '↳ Light is the left hand of darkness. The self you bring to the winter planet is the self you discover there. ∞·○·∞',
    rarity: 'rare',
    category: 'word_turn',
  },
  // ── Calendar Easter Egg v19 — AUTHOR DATES ───────────────────────────────────
  asimov_day: {
    id: 'asimov_day',
    symbol: '◇·◉',
    name: 'Asimov Day',
    description: 'Checked in on January 2 — Isaac Asimov born 1920 (Foundation author)',
    unlockMessage: '↳ January 2. Asimov\'s Foundation predicted the fall of civilization — and its recovery. Your practice is the recovery. ◇·◉',
    rarity: 'rare',
    category: 'easter_egg',
  },
  dick_day: {
    id: 'dick_day',
    symbol: '◉·◈',
    name: 'Dick Day',
    description: 'Checked in on December 16 — Philip K. Dick born 1928',
    unlockMessage: '↳ December 16 — Philip K. Dick born 1928. He asked if reality was real. Your journal is the most real data you have. ◉·◈',
    rarity: 'epic',
    category: 'easter_egg',
  },
  dune_day: {
    id: 'dune_day',
    symbol: '◆·□',
    name: 'Dune Day',
    description: 'Checked in on August 1 — Dune first published 1965',
    unlockMessage: '↳ August 1, 1965 — Dune published. The most important sci-fi novel of the 20th century begins with one act of practice. ◆·□',
    rarity: 'epic',
    category: 'easter_egg',
  },
  // ── Behavioral v18 — READER PATTERNS ─────────────────────────────────────────
  codex_session: {
    id: 'codex_session',
    symbol: '░·◈·░',
    name: 'Codex Session',
    description: 'Write 3+ Cyberspace Codex (v21) trigger words in one journal entry',
    unlockMessage: '↳ Simulation. Grok. Ansible. The cyberspace codex speaks through your journal. ░·◈·░',
    rarity: 'rare',
    category: 'pattern',
  },
  deep_read: {
    id: 'deep_read',
    symbol: '≋·█',
    name: 'Deep Read',
    description: 'Write a journal entry of 400 or more words in one session',
    unlockMessage: '↳ 400 words is a chapter. You didn\'t check in — you wrote. The deep read goes all the way down. ≋·█',
    rarity: 'rare',
    category: 'pattern',
  },
  night_operator: {
    id: 'night_operator',
    symbol: '○·▓·○',
    name: 'Night Operator',
    description: 'Check in after 22:00 local time at least 3 times within any 7-day window',
    unlockMessage: '↳ Late shift. 22:00 minimum. Three nights running. The night operator keeps the terminal alive when the world is quiet. ○·▓·○',
    rarity: 'epic',
    category: 'pattern',
  },
  // ── Achievement RPG v19 — CODEX CLASS ────────────────────────────────────────
  codex_entry: {
    id: 'codex_entry',
    symbol: '∘→░',
    name: 'Codex Entry',
    description: 'Earn any 1 Cyberspace Codex (v21) word turn badge',
    unlockMessage: '↳ The codex has a new entry. First word detected. The terminal reads you. ∘→░',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  codex_class: {
    id: 'codex_class',
    symbol: '≈→░',
    name: 'Codex Class',
    description: 'Earn any 5 Cyberspace Codex (v21) word turn badges',
    unlockMessage: '↳ Five entries in the codex. The class is forming. The cyberspace vocabulary is becoming yours. ≈→░',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  codex_complete: {
    id: 'codex_complete',
    symbol: '≋→░',
    name: 'Codex Complete',
    description: 'Earn all 12 Cyberspace Codex (v21) word turn badges',
    unlockMessage: '↳ All 12 entries. The cyberspace codex is complete. Matrix. Grok. Ansible. Golden Path. The full signal is running. ≋→░',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  sci_fi_arc: {
    id: 'sci_fi_arc',
    symbol: '░·◈',
    name: 'Sci-Fi Arc',
    description: 'Earn codex_complete + all 3 Calendar v19 (Author Dates) badges',
    unlockMessage: '↳ Asimov. Dick. Dune. The codex complete, the author dates witnessed. The sci-fi arc closes. ░·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twenty_one_engines_arc: {
    id: 'twenty_one_engines_arc',
    symbol: '◈·◈·░',
    name: 'Twenty-One Engines Arc',
    description: 'Earn at least 1 badge from each of the 21 Word Turn engines (v1–v21)',
    unlockMessage: '↳ Twenty-one vocabularies running. Every engine online. Water. Arcade. Radio. Biology. Codex. Cyberspace. The arc is complete. ◈·◈·░',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  cyberspace_opus: {
    id: 'cyberspace_opus',
    symbol: '░·◉·░',
    name: 'Cyberspace Opus',
    description: 'Earn codex_complete + the codex_session behavioral badge',
    unlockMessage: '↳ The opus is the session where the codex vocabulary lives in your own words. The terminal reads you back. ░·◉·░',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v21 — THE LONG STORY ────────────────────────────────────────
  epic_reader: {
    id: 'epic_reader',
    symbol: '≋·∞',
    name: 'Epic Reader',
    description: '800+ distinct calendar days with at least one check-in',
    unlockMessage: '↳ 800 days. Epic length. The longest stories are the ones that last. You are writing the longest one. ≋·∞',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  thousand_pages: {
    id: 'thousand_pages',
    symbol: '●·∞·░',
    name: 'Thousand Pages',
    description: '100,000+ total journal words written',
    unlockMessage: '↳ A thousand pages. A hundred thousand words. You have written a novel about yourself — and it is not finished. ●·∞·░',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  first_edition: {
    id: 'first_edition',
    symbol: '╔═╗·░',
    name: 'First Edition',
    description: 'Account age >= 7 years (2,555+ days since signup)',
    unlockMessage: '↳ Seven years. First editions are rare. The ones who stay seven years are rarer still. ╔═╗·░',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twenty_one_registers: {
    id: 'twenty_one_registers',
    symbol: '◈·◈·░·∞',
    name: 'Twenty-One Registers',
    description: 'Earn at least 1 badge from all 21 Word Turn engines',
    unlockMessage: '↳ Twenty-one registers. Ocean. Arcade. Radio. Biology. Cyberspace. Twenty-one vocabularies. One terminal. The self speaks every language. ◈·◈·░·∞',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v18 — THE LIBRARY STACK ──────────────────────────────────────
  gibson_key: {
    id: 'gibson_key',
    symbol: '◈·░',
    name: 'Gibson Key',
    description: 'Write "william gibson", "neuromancer" (full name context), or "sprawl" in any journal entry',
    unlockMessage: '↳ William Gibson named the future before it arrived. He named cyberspace, console cowboys, and the matrix. You are in his world now. ◈·░',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  dick_mirror: {
    id: 'dick_mirror',
    symbol: '◉·▓',
    name: 'Dick Mirror',
    description: 'Write "do androids dream", "philip k dick", or "pkd" in any journal entry',
    unlockMessage: '↳ The mirror test for androids: can they feel empathy? The mirror test for you: can you read your own patterns? ◉·▓',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  lem_observer: {
    id: 'lem_observer',
    symbol: '○·≋·█',
    name: 'Lem Observer',
    description: 'Write "stanislaw lem", "solaris" (full name context), or "cyberiad" in any journal entry',
    unlockMessage: '↳ Lem wrote the ocean of Solaris as a mirror. It surfaces what you bring. What does your practice surface when it observes you? ○·≋·█',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
  // ── Word Turn v22 — THE HERO'S JOURNEY ────────────────────────────────────────
  call_heard: {
    id: 'call_heard',
    symbol: '∘→●',
    name: 'Call Heard',
    description: 'Write "call to adventure", "journey calls", or "the call" in any entry',
    unlockMessage: '↳ Campbell named it: the call to adventure. The refusal of the call is the deepest form of self-abandonment. You answered. ∘→●',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  threshold_crossed: {
    id: 'threshold_crossed',
    symbol: '─→─',
    name: 'Threshold Crossed',
    description: 'Write "threshold", "crossing the line", or "new world begins" in any entry',
    unlockMessage: '↳ The threshold is the moment you commit to the change. Once crossed, the ordinary world is behind you. ─→─',
    rarity: 'rare',
    category: 'word_turn',
  },
  mentor_arrived: {
    id: 'mentor_arrived',
    symbol: '○·≋·○',
    name: 'Mentor Arrived',
    description: 'Write "mentor", "wise guide", "guardian spirit", or "wise elder" in any entry',
    unlockMessage: '↳ The mentor appears when the hero is ready. Gandalf. Yoda. Obi-Wan. The mentor in your journal is your past self. ○·≋·○',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  ordeal_survived: {
    id: 'ordeal_survived',
    symbol: '◈·■',
    name: 'Ordeal Survived',
    description: 'Write "ordeal", "survived the test", or "greatest challenge" in any entry',
    unlockMessage: '↳ The central ordeal: the supreme test the hero must survive. It changes them. You are changed by what you survive. ◈·■',
    rarity: 'rare',
    category: 'word_turn',
  },
  elixir_found: {
    id: 'elixir_found',
    symbol: '∘·●·∘',
    name: 'Elixir Found',
    description: 'Write "elixir", "the gift", "treasure found", or "the boon" in any entry',
    unlockMessage: '↳ The elixir: the gift the hero brings back from the ordeal. The gift is always what the community needs. ∘·●·∘',
    rarity: 'rare',
    category: 'word_turn',
  },
  shadow_met: {
    id: 'shadow_met',
    symbol: '▓·○',
    name: 'Shadow Met',
    description: 'Write "shadow self", "dark night of the", or "inner demon" in any entry',
    unlockMessage: '↳ The shadow is the part of you that the hero must confront. Meeting it is not defeat — it is the confrontation that changes everything. ▓·○',
    rarity: 'epic',
    category: 'word_turn',
  },
  innermost_cave: {
    id: 'innermost_cave',
    symbol: '█·∘·█',
    name: 'Innermost Cave',
    description: 'Write "innermost cave", "darkest moment", or "bottom of the pit" in any entry',
    unlockMessage: '↳ The innermost cave is where the hero faces their deepest fear. You have been here. You are still here. That is the whole point. █·∘·█',
    rarity: 'epic',
    category: 'word_turn',
  },
  shapeshifter: {
    id: 'shapeshifter',
    symbol: '◈→◉',
    name: 'Shapeshifter',
    description: 'Write "shapeshifter", "transformed", or "no longer the same" in any entry',
    unlockMessage: '↳ The shapeshifter archetype: the one who changes and changes others by changing. You have shifted shape. The old form was a draft. ◈→◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  herald_call: {
    id: 'herald_call',
    symbol: '∿·●',
    name: 'Herald Call',
    description: 'Write "herald", "wake-up call", or "life interrupted" in any entry',
    unlockMessage: '↳ The herald announces the change is coming. The wake-up call you cannot ignore. Something interrupted and became the story. ∿·●',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  trickster_mode: {
    id: 'trickster_mode',
    symbol: '×·○',
    name: 'Trickster Mode',
    description: 'Write "trickster", "coyote wisdom", or "fool\'s wisdom" in any entry',
    unlockMessage: '↳ The trickster breaks the rules to reveal the deeper order. Coyote teaches by chaos. The fool speaks the truth the court cannot. ×·○',
    rarity: 'rare',
    category: 'word_turn',
  },
  ally_gained: {
    id: 'ally_gained',
    symbol: '○·◈·○',
    name: 'Ally Gained',
    description: 'Write "ally", "found my tribe", or "companion on journey" in any entry',
    unlockMessage: '↳ The hero never goes alone — they gain allies. Samwise. Hermione. Han Solo. Who are your allies? Name them here. ○·◈·○',
    rarity: 'uncommon',
    category: 'word_turn',
  },
  return_road: {
    id: 'return_road',
    symbol: '→·◉',
    name: 'Return Road',
    description: 'Write "the return", "road to return", or "coming home changed" in any entry',
    unlockMessage: '↳ The road of return: back to the ordinary world, but carrying the elixir. You return — but you are not the same. →·◉',
    rarity: 'rare',
    category: 'word_turn',
  },
  // ── Calendar Easter Egg v20 — THE EPIC CALENDAR ──────────────────────────────
  campbell_birthday: {
    id: 'campbell_birthday',
    symbol: '◉·∿',
    name: 'Campbell Birthday',
    description: 'Checked in on March 26 — Joseph Campbell born 1904',
    unlockMessage: '↳ March 26, 1904 — Joseph Campbell born. "Follow your bliss." He mapped the hero\'s journey in every culture\'s story. Including yours. ◉·∿',
    rarity: 'epic',
    category: 'easter_egg',
  },
  hobbit_day: {
    id: 'hobbit_day',
    symbol: '○·◆',
    name: 'Hobbit Day',
    description: 'Checked in on September 22 — Bilbo and Frodo Baggins birthday, Tolkien Society Hobbit Day',
    unlockMessage: '↳ September 22 — Hobbit Day. Bilbo and Frodo\'s birthday. "Not all those who wander are lost." Your journey, however small, matters. ○·◆',
    rarity: 'rare',
    category: 'easter_egg',
  },
  odyssey_day: {
    id: 'odyssey_day',
    symbol: '→·∞',
    name: 'Odyssey Day',
    description: 'Checked in on December 21 — Winter Solstice, the longest night, Odysseus\'s return',
    unlockMessage: '↳ December 21 — the longest night. The winter solstice is when Odysseus finally reaches Ithaca. The longest journey ends here, now. →·∞',
    rarity: 'rare',
    category: 'easter_egg',
  },
  // ── Behavioral v19 — QUEST PATTERNS ──────────────────────────────────────────
  hero_session: {
    id: 'hero_session',
    symbol: '◈·●·◈',
    name: 'Hero Session',
    description: 'Write 3+ Hero\'s Journey (v22) trigger words in one journal entry',
    unlockMessage: '↳ Threshold. Ordeal. Return. Three archetypes in one entry. The hero\'s journey ran through your journal. ◈·●·◈',
    rarity: 'rare',
    category: 'pattern',
  },
  long_quest: {
    id: 'long_quest',
    symbol: '≋≋·◉',
    name: 'Long Quest',
    description: 'Write a journal entry of 500 or more words',
    unlockMessage: '↳ 500 words. A full quest log. You didn\'t just check in — you told the story. The long quest is the one worth telling. ≋≋·◉',
    rarity: 'epic',
    category: 'pattern',
  },
  threshold_moment: {
    id: 'threshold_moment',
    symbol: '─·○·─',
    name: 'Threshold Moment',
    description: 'Check in between 00:00 and 00:30 local time — right at the threshold of a new day',
    unlockMessage: '↳ 00:00 to 00:30. The threshold between days. The hero crosses at the moment between worlds. You crossed here. ─·○·─',
    rarity: 'rare',
    category: 'pattern',
  },
  // ── Achievement RPG v20 — QUEST CLASS ────────────────────────────────────────
  quest_entry: {
    id: 'quest_entry',
    symbol: '∘→●',
    name: 'Quest Entry',
    description: 'Earn any 1 Hero\'s Journey (v22) word turn badge',
    unlockMessage: '↳ The quest begins. One archetype named. The journal is the quest log. ∘→●',
    rarity: 'common',
    category: 'achievement_rpg',
  },
  quest_class: {
    id: 'quest_class',
    symbol: '≈→●',
    name: 'Quest Class',
    description: 'Earn any 5 Hero\'s Journey (v22) word turn badges',
    unlockMessage: '↳ Five archetypes. The hero is taking shape. Call. Threshold. Mentor. Ordeal. Return. ≈→●',
    rarity: 'uncommon',
    category: 'achievement_rpg',
  },
  quest_complete: {
    id: 'quest_complete',
    symbol: '≋→●',
    name: 'Quest Complete',
    description: 'Earn all 12 Hero\'s Journey (v22) word turn badges',
    unlockMessage: '↳ The full monomyth. Twelve archetypes. Call. Threshold. Mentor. Shadow. Ordeal. Elixir. Return. The hero\'s journey complete. ≋→●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  monomyth_arc: {
    id: 'monomyth_arc',
    symbol: '●·◈',
    name: 'Monomyth Arc',
    description: 'Earn quest_complete + all 3 Calendar v20 (Epic Calendar) badges',
    unlockMessage: '↳ Campbell. Tolkien. Odysseus. The monomyth arc closes. Every culture\'s hero story is yours. ●·◈',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twenty_two_engines_arc: {
    id: 'twenty_two_engines_arc',
    symbol: '◈·◈·●',
    name: 'Twenty-Two Engines Arc',
    description: 'Earn at least 1 badge from each of the 22 Word Turn engines (v1–v22)',
    unlockMessage: '↳ Twenty-two vocabularies. Every engine online. Water. Arcade. Radio. Biology. Codex. Cyberspace. Hero. The full arc runs. ◈·◈·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  hero_opus: {
    id: 'hero_opus',
    symbol: '●·◉·●',
    name: 'Hero Opus',
    description: 'Earn quest_complete + the hero_session behavioral badge',
    unlockMessage: '↳ The opus of the hero: the journey complete, the archetypes alive in your own words. This is the return with the elixir. ●·◉·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  // ── Mastery Tier v22 — THE ODYSSEY ────────────────────────────────────────────
  odyssey_log: {
    id: 'odyssey_log',
    symbol: '∿·∞·∿',
    name: 'Odyssey Log',
    description: '900+ distinct calendar days with at least one check-in',
    unlockMessage: '↳ 900 days. Odysseus spent 10 years returning home. You have been logging a journey of comparable scope. ∿·∞·∿',
    rarity: 'epic',
    category: 'achievement_rpg',
  },
  great_work: {
    id: 'great_work',
    symbol: '●·∞·●',
    name: 'Great Work',
    description: '150,000+ total journal words written',
    unlockMessage: '↳ 150,000 words. The Great Work. In alchemy this is the magnum opus — the completion of the transformation. ●·∞·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  saga_age: {
    id: 'saga_age',
    symbol: '╔═╗·●',
    name: 'Saga Age',
    description: 'Account age >= 5 years (1,825+ days since signup)',
    unlockMessage: '↳ Five years is a saga. The Icelandic sagas covered generations. Yours covers five years of self. That is the saga age. ╔═╗·●',
    rarity: 'legendary',
    category: 'achievement_rpg',
  },
  twenty_two_registers: {
    id: 'twenty_two_registers',
    symbol: '◈·◈·●·∞',
    name: 'Twenty-Two Registers',
    description: 'Earn at least 1 badge from all 22 Word Turn engines',
    unlockMessage: '↳ Twenty-two registers. Water. Code. Signal. Biology. Codex. Cyberspace. Hero. Every vocabulary owned. The terminal is fully operational. ◈·◈·●·∞',
    rarity: 'cosmic',
    category: 'achievement_rpg',
  },
  // ── Secret Boss v19 — THE MYTHIC VAULT ───────────────────────────────────────
  tolkien_ring: {
    id: 'tolkien_ring',
    symbol: '◆·∞·◆',
    name: 'Tolkien Ring',
    description: 'Write "one ring to rule", "my precious", or "ring of power" in any journal entry',
    unlockMessage: '↳ The One Ring: absolute power that corrupts absolutely. The practice that makes you its servant is not one that serves you. Choose your ring carefully. ◆·∞·◆',
    rarity: 'rare',
    category: 'secret_boss',
    hidden: true,
  },
  odysseus_bow: {
    id: 'odysseus_bow',
    symbol: '→·∞·→',
    name: 'Odysseus Bow',
    description: 'Write "odysseus", "ulysses", "ithaca", "penelope", or "cyclops" in any journal entry',
    unlockMessage: '↳ Only Odysseus could string the bow. Only you can write your own return. The suitors wait — the practice is the bow you must string. →·∞·→',
    rarity: 'epic',
    category: 'secret_boss',
    hidden: true,
  },
  gilgamesh_word: {
    id: 'gilgamesh_word',
    symbol: '∞·□·∞',
    name: 'Gilgamesh Word',
    description: 'Write "gilgamesh", "enkidu", "great flood", or "utnapishtim" in any journal entry',
    unlockMessage: '↳ Gilgamesh: the oldest hero\'s journey. 4,000 years old. The story of a king who sought immortality and found self-knowledge instead. ∞·□·∞',
    rarity: 'mythic',
    category: 'secret_boss',
    hidden: true,
  },
}

// Default separator when no badges earned yet
export const DEFAULT_SEPARATOR = '•'

// Progression arrow used across the badge UI
export const PROGRESSION_ARROW = '→'

// Sub-item indicator for hierarchical display
export const SUB_INDICATOR = '↳'

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
    syncBadgesToServer()
  } catch (e) {
    console.warn('Failed to set badge theme:', e)
  }
}

/**
 * Get earned badges from localStorage
 * Format: comma-separated badge IDs
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
  // Prevent race conditions
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
    syncBadgesToServer([badgeId])

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
 * Returns badge with theme-appropriate message
 */
export function getNextBadgeUnlock(): { badge: Badge; unlockMessage: string; symbol: string; name: string } | null {
  if (typeof window === 'undefined') return null

  try {
    const queued = localStorage.getItem('badge_unlock_queue') || ''
    const queue = queued ? queued.split(',').filter(Boolean) : []

    if (queue.length === 0) return null

    const badgeId = queue.shift() as BadgeType
    localStorage.setItem('badge_unlock_queue', queue.join(','))

    // Validate badge ID exists
    const badge = BADGES[badgeId]
    if (!badge) {
      console.warn('Invalid badge ID in queue:', badgeId)
      return null
    }

    // Get theme-appropriate message and symbol
    const theme = getBadgeTheme()
    const unlockMessage = theme === 'water'
      ? (badge.waterUnlockMessage ?? badge.unlockMessage)
      : (badge.architectureUnlockMessage ?? badge.unlockMessage)
    const symbol = theme === 'water'
      ? (badge.waterSymbol ?? badge.symbol)
      : (badge.architectureSymbol ?? badge.symbol)
    const name = theme === 'water'
      ? (badge.waterName ?? badge.name)
      : (badge.architectureName ?? badge.name)

    return { badge, unlockMessage, symbol, name }
  } catch (e) {
    console.warn('Failed to get next badge unlock:', e)
    return null
  }
}

/**
 * Get current level symbol based on streak
 * Returns the highest milestone badge symbol earned (theme-specific)
 */
export function getLevelSymbol(streak: number, theme?: BadgeTheme): string {
  const badgeTheme = theme || getBadgeTheme()

  const milestones: Array<[number, BadgeType]> = [
    [365, 'milestone_365'],
    [180, 'milestone_180'],
    [100, 'milestone_100'],
    [90,  'milestone_90'],
    [60,  'milestone_60'],
    [50,  'milestone_50'],
    [30,  'milestone_30'],
    [21,  'milestone_21'],
    [14,  'milestone_14'],
    [7,   'milestone_7'],
  ]

  for (const [days, id] of milestones) {
    if (streak >= days) {
      const badge = BADGES[id]
      return badgeTheme === 'water'
        ? (badge.waterSymbol ?? badge.symbol)
        : (badge.architectureSymbol ?? badge.symbol)
    }
  }
  return '' // No level yet → awaiting first milestone
}

/**
 * Get current level name based on streak (theme-specific)
 */
export function getLevelName(streak: number, theme?: BadgeTheme): string {
  const badgeTheme = theme || getBadgeTheme()

  const milestones: Array<[number, BadgeType]> = [
    [365, 'milestone_365'],
    [180, 'milestone_180'],
    [100, 'milestone_100'],
    [90,  'milestone_90'],
    [60,  'milestone_60'],
    [50,  'milestone_50'],
    [30,  'milestone_30'],
    [21,  'milestone_21'],
    [14,  'milestone_14'],
    [7,   'milestone_7'],
  ]

  for (const [days, id] of milestones) {
    if (streak >= days) {
      const badge = BADGES[id]
      return badgeTheme === 'water'
        ? (badge.waterName ?? badge.name)
        : (badge.architectureName ?? badge.name)
    }
  }
  return '' // No level yet
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
 * e.g. "∘ → ≈ → ≋" or "├─ → ╞═╡ → ║·║"
 */
export function getBadgeProgressionDisplay(theme?: BadgeTheme): string {
  const badgeTheme = theme || getBadgeTheme()
  const milestones = ['milestone_7', 'milestone_30', 'milestone_100'] as const

  return milestones
    .map(id => badgeTheme === 'water' ? BADGES[id].waterSymbol : BADGES[id].architectureSymbol)
    .join(' → ')
}

/**
 * Calculate which milestone badges should be awarded based on streak
 * This is called periodically or after significant events
 */
export async function checkAndAwardBadges(): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  try {
    // Fetch user stats from API
    const response = await fetch('/api/user-stats')
    if (!response.ok) return newBadges

    // Parse JSON safely
    let stats
    try {
      stats = await response.json()
    } catch (parseError) {
      console.warn('Failed to parse user stats response:', parseError)
      return newBadges
    }

    // Validate stats object
    if (!stats || typeof stats.streak !== 'number') {
      console.warn('Invalid stats response:', stats)
      return newBadges
    }

    // Check milestone badges: full progression ∘ → ∘∘ → ∘≈ → ≈ → ≈∘ → ≈≈ → ≋∘ → ≋ → ≋≋ → ≋≋≋
    const streakMilestones: Array<[number, BadgeType]> = [
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
    for (const [days, id] of streakMilestones) {
      if (stats.streak >= days && !hasBadge(id)) {
        if (awardBadge(id)) newBadges.push(id)
      }
    }

    // Mastery tier: memory answer milestones
    if (typeof stats.totalAnswers === 'number') {
      if (stats.totalAnswers >= 500 && !hasBadge('commander_data')) {
        if (awardBadge('commander_data')) newBadges.push('commander_data')
      }
      // Achievement RPG v3
      if (stats.totalAnswers >= 10 && !hasBadge('first_signal')) {
        if (awardBadge('first_signal')) newBadges.push('first_signal')
      }
      // Achievement RPG v2
      if (stats.totalAnswers >= 100 && !hasBadge('signal_keeper')) {
        if (awardBadge('signal_keeper')) newBadges.push('signal_keeper')
      }
    }

    // Mastery tier: level milestone
    if (typeof stats.level === 'number') {
      if (stats.level >= 90 && !hasBadge('sage_mode')) {
        if (awardBadge('sage_mode')) newBadges.push('sage_mode')
      }
    }

    // Mastery v4/v5: total check-ins
    if (typeof stats.totalCheckIns === 'number') {
      if (stats.totalCheckIns >= 2000 && !hasBadge('interstellar')) {
        if (awardBadge('interstellar')) newBadges.push('interstellar')
      }
      if (stats.totalCheckIns >= 3000 && !hasBadge('epoch_operator')) {
        if (awardBadge('epoch_operator')) newBadges.push('epoch_operator')
      }
    }

    // Mastery v4: distinct badge types earned
    const earnedCount = getEarnedBadges().length
    if (earnedCount >= 100 && !hasBadge('signal_master')) {
      if (awardBadge('signal_master')) newBadges.push('signal_master')
    }

    // Mastery v5: all Time v1 badges collected
    const timeV1Badges: BadgeType[] = ['night_owl', 'early_bird', 'mirror_hour', 'midnight_sigil']
    if (timeV1Badges.every(b => hasBadge(b)) && !hasBadge('time_collector')) {
      if (awardBadge('time_collector')) newBadges.push('time_collector')
    }

    // Word-turn badge type counts (earned word_turn category badges)
    const earned = getEarnedBadges()
    const wordTurnCount = earned.filter(id => BADGES[id]?.category === 'word_turn').length
    if (wordTurnCount >= 20 && !hasBadge('word_weaver')) {
      if (awardBadge('word_weaver')) newBadges.push('word_weaver')
    }
    if (wordTurnCount >= 30 && !hasBadge('word_master')) {
      if (awardBadge('word_master')) newBadges.push('word_master')
    }
    if (wordTurnCount >= 30 && !hasBadge('word_collector')) {
      if (awardBadge('word_collector')) newBadges.push('word_collector')
    }

    // Achievement RPG v3: intention entries
    if (typeof stats.totalIntentions === 'number') {
      if (stats.totalIntentions >= 10 && !hasBadge('planner_class')) {
        if (awardBadge('planner_class')) newBadges.push('planner_class')
      }
      // Achievement RPG v2
      if (stats.totalIntentions >= 25 && !hasBadge('inner_compass')) {
        if (awardBadge('inner_compass')) newBadges.push('inner_compass')
      }
    }

    // Achievement RPG v2: journal entries
    if (typeof stats.totalJournalEntries === 'number') {
      if (stats.totalJournalEntries >= 50 && !hasBadge('truth_forge')) {
        if (awardBadge('truth_forge')) newBadges.push('truth_forge')
      }
    }

    // Achievement RPG v3: mood entries
    if (typeof stats.totalMoodEntries === 'number') {
      if (stats.totalMoodEntries >= 30 && !hasBadge('mood_master')) {
        if (awardBadge('mood_master')) newBadges.push('mood_master')
      }
    }

    // Achievement RPG v3: self-care entries
    if (typeof stats.totalSelfCareEntries === 'number') {
      if (stats.totalSelfCareEntries >= 25 && !hasBadge('body_keeper')) {
        if (awardBadge('body_keeper')) newBadges.push('body_keeper')
      }
    }

    // Achievement RPG v3: chat messages
    if (typeof stats.totalChatMessages === 'number') {
      if (stats.totalChatMessages >= 50 && !hasBadge('community_builder')) {
        if (awardBadge('community_builder')) newBadges.push('community_builder')
      }
    }

    // Mastery v5: memory answers on distinct calendar days
    if (typeof stats.memoryDaysCount === 'number') {
      if (stats.memoryDaysCount >= 30 && !hasBadge('memory_keeper_30')) {
        if (awardBadge('memory_keeper_30')) newBadges.push('memory_keeper_30')
      }
    }

    // Secret Boss v5: five years account age
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signup = new Date(stats.signupDate)
      const now = new Date()
      const yearsElapsed = (now.getTime() - signup.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsElapsed >= 5 && !hasBadge('five_years')) {
        if (awardBadge('five_years')) newBadges.push('five_years')
      }
      // Mastery v15: crucible_keeper_age — 4+ years
      if (yearsElapsed >= 4 && !hasBadge('crucible_keeper_age')) {
        if (awardBadge('crucible_keeper_age')) newBadges.push('crucible_keeper_age')
      }
    }

    // Achievement RPG v13 — Alchemist Class
    const alchemistV12Badges: BadgeType[] = [
      'transmutation_event', 'crucible_forged', 'distillation_complete', 'catalyst_detected',
      'alloy_formed', 'sublimation_signal', 'prima_materia_word', 'magnum_opus',
      'elixir_found', 'chrysalis_state', 'refinement_active', 'annealed',
    ]
    const alchemistEarned = alchemistV12Badges.filter(b => hasBadge(b))
    if (alchemistEarned.length >= 1 && !hasBadge('alchemist_entry')) {
      if (awardBadge('alchemist_entry')) newBadges.push('alchemist_entry')
    }
    if (alchemistEarned.length >= 5 && !hasBadge('alchemist_class')) {
      if (awardBadge('alchemist_class')) newBadges.push('alchemist_class')
    }
    const alchemistComplete = alchemistEarned.length >= 12
    if (alchemistComplete && !hasBadge('alchemist_complete')) {
      if (awardBadge('alchemist_complete')) newBadges.push('alchemist_complete')
    }

    // opus_magnum_badge: alchemist_complete + great_work_sequence
    if (alchemistComplete && hasBadge('great_work_sequence') && !hasBadge('opus_magnum_badge')) {
      if (awardBadge('opus_magnum_badge')) newBadges.push('opus_magnum_badge')
    }

    // philosopher_stone_arch: alchemist_complete + all 3 Calendar v12 badges
    const calendarV12Badges: BadgeType[] = ['bard_signal', 'autumn_code', 'tranquility_base']
    if (alchemistComplete && calendarV12Badges.every(b => hasBadge(b)) && !hasBadge('philosopher_stone_arch')) {
      if (awardBadge('philosopher_stone_arch')) newBadges.push('philosopher_stone_arch')
    }

    // twelve_engines_arc: at least 1 badge from each of Word Turn engines v1–v12
    const engineRepresentatives: BadgeType[] = [
      'ritual_keeper',         // v1
      'reboot_sequence',       // v2
      'ocean_wave',            // v3
      'dead_reckoning_word',   // v11 (navigator)
      'launch_confirmed',      // v14 (starship)
      'transmutation_event',   // v12 (alchemist)
    ]
    // Full check across all 12 engines using category detection
    const wordTurnBadges = getEarnedBadges().filter(id => BADGES[id]?.category === 'word_turn')
    // Badge IDs that represent each engine presence (representative first badge per engine)
    const engineOnePresent    = ['ritual_keeper','breath_anchor','ocean_wave','lot_signal','cosmo_detected'].some(b => hasBadge(b as BadgeType))
    const engineTwoPresent    = ['reboot_sequence','glitch_detected','quantum_state','neural_link','cosmo_detected'].some(b => hasBadge(b as BadgeType))
    const engineThreePresent  = ['drift_mode','anchor_found','tide_keeper','deep_dive','shore_call'].some(b => hasBadge(b as BadgeType))
    const engineFourPresent   = ['dream_sequence','echo_chamber','void_walker','static_cleared','signal_lost'].some(b => hasBadge(b as BadgeType))
    const engineFivePresent   = ['solar_flare','lunar_cycle','stellar_drift','nova_burst','cosmic_ray'].some(b => hasBadge(b as BadgeType))
    const engineSixPresent    = ['debug_mode','stack_overflow','merge_conflict','deploy_complete','rollback_initiated'].some(b => hasBadge(b as BadgeType))
    const engineSevenPresent  = ['morning_mission','sustained_transmission','rapid_orbit'].some(b => hasBadge(b as BadgeType))
    const engineEightPresent  = ['beacon_active','signal_burst','frequency_locked'].some(b => hasBadge(b as BadgeType))
    const engineNinePresent   = ['path_finder','waypoint_reached','compass_true'].some(b => hasBadge(b as BadgeType))
    const engineTenPresent    = ['code_complete','runtime_stable','system_clear'].some(b => hasBadge(b as BadgeType))
    const engineElevenPresent = ['dead_reckoning_word','terra_incognita','true_north'].some(b => hasBadge(b as BadgeType))
    const engineTwelvePresent = alchemistEarned.length >= 1

    const allTwelveEngines = [
      engineOnePresent, engineTwoPresent, engineThreePresent, engineFourPresent,
      engineFivePresent, engineSixPresent, engineSevenPresent, engineEightPresent,
      engineNinePresent, engineTenPresent, engineElevenPresent, engineTwelvePresent,
    ].every(Boolean)

    if (allTwelveEngines && !hasBadge('twelve_engines_arc')) {
      if (awardBadge('twelve_engines_arc')) newBadges.push('twelve_engines_arc')
    }

    // Mastery v15: prima_materia_keeper — 300+ distinct calendar days with check-in
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 300 && !hasBadge('prima_materia_keeper')) {
        if (awardBadge('prima_materia_keeper')) newBadges.push('prima_materia_keeper')
      }
    }

    // Mastery v15: masterwork — 20,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 20000 && !hasBadge('masterwork')) {
        if (awardBadge('masterwork')) newBadges.push('masterwork')
      }
    }

    // Mastery v15: thirteen_tongues — 1 badge from each of all 13 Word Turn engines
    // (v12 Alchemist is engine 12; v13 Oracle is engine 13)
    const engineThirteenPresent = [
      'first_code', 'leet_hour', 'quad_signal',
    ].some(b => hasBadge(b as BadgeType)) || wordTurnBadges.some(b =>
      BADGES[b]?.name?.toLowerCase().includes('oracle')
    )
    if (allTwelveEngines && engineThirteenPresent && !hasBadge('thirteen_tongues')) {
      if (awardBadge('thirteen_tongues')) newBadges.push('thirteen_tongues')
    }

    // ── v16 Quantum Library — Achievement RPG v14 ─────────────────────────────
    const quantumV16Badges: BadgeType[] = [
      'entanglement_signal', 'singularity_gate', 'matrix_signal', 'cortex_online',
      'hologram_projection', 'uplink_active', 'grid_secured', 'override_sequence',
      'clone_signal', 'bandwidth_open', 'synthetic_awareness', 'cypher_unlocked',
    ]
    const quantumEarned = quantumV16Badges.filter(b => hasBadge(b))

    if (quantumEarned.length >= 1 && !hasBadge('quantum_entry')) {
      if (awardBadge('quantum_entry')) newBadges.push('quantum_entry')
    }
    if (quantumEarned.length >= 5 && !hasBadge('quantum_class')) {
      if (awardBadge('quantum_class')) newBadges.push('quantum_class')
    }
    const quantumComplete = quantumEarned.length >= 12
    if (quantumComplete && !hasBadge('quantum_complete')) {
      if (awardBadge('quantum_complete')) newBadges.push('quantum_complete')
    }

    // entangled_opus: quantum_complete + library_run
    if (quantumComplete && hasBadge('library_run') && !hasBadge('entangled_opus')) {
      if (awardBadge('entangled_opus')) newBadges.push('entangled_opus')
    }

    // library_arc: quantum_complete + all 3 Calendar v13 badges
    const calendarV13Badges: BadgeType[] = ['tolkien_gate', 'asimov_signal', 'bloomsday']
    if (quantumComplete && calendarV13Badges.every(b => hasBadge(b)) && !hasBadge('library_arc')) {
      if (awardBadge('library_arc')) newBadges.push('library_arc')
    }

    // sixteen_engines_arc: 1 badge from each Word Turn v1–v16
    const engineSixteenPresent = quantumEarned.length >= 1
    const allSixteenEngines = allTwelveEngines && engineThirteenPresent && engineSixteenPresent
    if (allSixteenEngines && !hasBadge('sixteen_engines_arc')) {
      if (awardBadge('sixteen_engines_arc')) newBadges.push('sixteen_engines_arc')
    }

    // Mastery v16: terminal_elder — 400+ distinct calendar days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 400 && !hasBadge('terminal_elder')) {
        if (awardBadge('terminal_elder')) newBadges.push('terminal_elder')
      }
    }

    // Mastery v16: grand_librarian — 25,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 25000 && !hasBadge('grand_librarian')) {
        if (awardBadge('grand_librarian')) newBadges.push('grand_librarian')
      }
    }

    // Mastery v16: system_architect_age — Account age ≥ 6 years
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupAge = new Date(stats.signupDate)
      const yearsAge = (new Date().getTime() - signupAge.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsAge >= 6 && !hasBadge('system_architect_age')) {
        if (awardBadge('system_architect_age')) newBadges.push('system_architect_age')
      }
    }

    // Mastery v16: sixteen_tongues — 1 badge from all 16 Word Turn engines
    if (allSixteenEngines && !hasBadge('sixteen_tongues')) {
      if (awardBadge('sixteen_tongues')) newBadges.push('sixteen_tongues')
    }

    // ── v17 Neon Arcade — Achievement RPG v15 ────────────────────────────────
    const neonV17Badges: BadgeType[] = [
      'neon_alive', 'combo_keeper', 'highscore_day', 'freeplay_mode',
      'extralife_log', 'speedrun_focus', 'side_quest_filed', 'surge_detected',
      'cartridge_nostalgia', 'continue_signal', 'joystick_held', 'checkpoint_saved',
    ]
    const neonEarned = neonV17Badges.filter(b => hasBadge(b))

    if (neonEarned.length >= 1 && !hasBadge('arcade_entry')) {
      if (awardBadge('arcade_entry')) newBadges.push('arcade_entry')
    }
    if (neonEarned.length >= 5 && !hasBadge('arcade_class')) {
      if (awardBadge('arcade_class')) newBadges.push('arcade_class')
    }
    const arcadeComplete = neonEarned.length >= 12
    if (arcadeComplete && !hasBadge('arcade_complete')) {
      if (awardBadge('arcade_complete')) newBadges.push('arcade_complete')
    }

    // neon_opus: arcade_complete + arcade_run
    if (arcadeComplete && hasBadge('arcade_run') && !hasBadge('neon_opus')) {
      if (awardBadge('neon_opus')) newBadges.push('neon_opus')
    }

    // neon_arc: arcade_complete + all 3 Calendar v15 badges
    const calendarV15Badges: BadgeType[] = ['tetris_day', 'zelda_day', 'pac_man_day']
    if (arcadeComplete && calendarV15Badges.every(b => hasBadge(b)) && !hasBadge('neon_arc')) {
      if (awardBadge('neon_arc')) newBadges.push('neon_arc')
    }

    // seventeen_engines_arc: 1 badge from each Word Turn v1–v17
    const engineSeventeenPresent = neonEarned.length >= 1
    const allSeventeenEngines = allSixteenEngines && engineSeventeenPresent
    if (allSeventeenEngines && !hasBadge('seventeen_engines_arc')) {
      if (awardBadge('seventeen_engines_arc')) newBadges.push('seventeen_engines_arc')
    }

    // Mastery v17: pixel_veteran — 500+ distinct calendar days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 500 && !hasBadge('pixel_veteran')) {
        if (awardBadge('pixel_veteran')) newBadges.push('pixel_veteran')
      }
    }

    // Mastery v17: master_of_the_board — 40,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 40000 && !hasBadge('master_of_the_board')) {
        if (awardBadge('master_of_the_board')) newBadges.push('master_of_the_board')
      }
    }

    // Mastery v17: long_run_operator — Account age ≥ 8 years
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupLong = new Date(stats.signupDate)
      const yearsLong = (new Date().getTime() - signupLong.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsLong >= 8 && !hasBadge('long_run_operator')) {
        if (awardBadge('long_run_operator')) newBadges.push('long_run_operator')
      }
    }

    // Mastery v17: seventeen_tongues — 1 badge from all 17 Word Turn engines
    if (allSeventeenEngines && !hasBadge('seventeen_tongues')) {
      if (awardBadge('seventeen_tongues')) newBadges.push('seventeen_tongues')
    }

    // ── v18 Midnight Radio — Achievement RPG v16 ─────────────────────────────
    const radioV18Badges: BadgeType[] = [
      'frequency_held', 'broadcast_live', 'wavelength_match', 'antenna_raised',
      'reception_strong', 'transmission_sent', 'tuned_in', 'channel_open',
      'carrier_active', 'amplitude_rising', 'interference_noted', 'modulation_set',
    ]
    const radioEarned = radioV18Badges.filter(b => hasBadge(b))

    if (radioEarned.length >= 1 && !hasBadge('radio_entry')) {
      if (awardBadge('radio_entry')) newBadges.push('radio_entry')
    }
    if (radioEarned.length >= 5 && !hasBadge('radio_class')) {
      if (awardBadge('radio_class')) newBadges.push('radio_class')
    }
    const radioComplete = radioEarned.length >= 12
    if (radioComplete && !hasBadge('radio_complete')) {
      if (awardBadge('radio_complete')) newBadges.push('radio_complete')
    }

    // broadcast_opus: radio_complete + signal_peak
    if (radioComplete && hasBadge('signal_peak') && !hasBadge('broadcast_opus')) {
      if (awardBadge('broadcast_opus')) newBadges.push('broadcast_opus')
    }

    // signal_arc: radio_complete + all 3 Calendar v16 badges
    const calendarV16Badges: BadgeType[] = ['sputnik_day', 'arecibo_day', 'pioneer_plaque']
    if (radioComplete && calendarV16Badges.every(b => hasBadge(b)) && !hasBadge('signal_arc')) {
      if (awardBadge('signal_arc')) newBadges.push('signal_arc')
    }

    // eighteen_engines_arc: 1 badge from each Word Turn v1–v18
    const engineEighteenPresent = radioEarned.length >= 1
    const allEighteenEngines = allSeventeenEngines && engineEighteenPresent
    if (allEighteenEngines && !hasBadge('eighteen_engines_arc')) {
      if (awardBadge('eighteen_engines_arc')) newBadges.push('eighteen_engines_arc')
    }

    // Mastery v18: signal_tower — 600+ distinct calendar days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 600 && !hasBadge('signal_tower')) {
        if (awardBadge('signal_tower')) newBadges.push('signal_tower')
      }
    }

    // Mastery v18: grand_broadcaster — 60,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 60000 && !hasBadge('grand_broadcaster')) {
        if (awardBadge('grand_broadcaster')) newBadges.push('grand_broadcaster')
      }
    }

    // Mastery v18: transmission_age — Account age ≥ 10 years
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupTx = new Date(stats.signupDate)
      const yearsTx = (new Date().getTime() - signupTx.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsTx >= 10 && !hasBadge('transmission_age')) {
        if (awardBadge('transmission_age')) newBadges.push('transmission_age')
      }
    }

    // Mastery v18: eighteen_frequencies — 1 badge from all 18 Word Turn engines
    if (allEighteenEngines && !hasBadge('eighteen_frequencies')) {
      if (awardBadge('eighteen_frequencies')) newBadges.push('eighteen_frequencies')
    }

    // ── v19 — THE BIO-TERMINAL ─────────────────────────────────────────────────
    const bioV19Badges: BadgeType[] = [
      'pulse_signal', 'cortisol_log', 'circadian_gate', 'rem_active',
      'dopamine_loop', 'serotonin_wave', 'neuroplastic', 'vagal_anchor',
      'cortex_engaged', 'endorphin_run', 'rhythm_locked', 'homeostasis',
    ]
    const bioEarned = bioV19Badges.filter(b => hasBadge(b))

    if (bioEarned.length >= 1 && !hasBadge('bio_entry')) {
      if (awardBadge('bio_entry')) newBadges.push('bio_entry')
    }
    if (bioEarned.length >= 5 && !hasBadge('bio_class')) {
      if (awardBadge('bio_class')) newBadges.push('bio_class')
    }
    const bioComplete = bioEarned.length >= 12
    if (bioComplete && !hasBadge('bio_complete')) {
      if (awardBadge('bio_complete')) newBadges.push('bio_complete')
    }

    // bio_opus: bio_complete + bio_session
    if (bioComplete && hasBadge('bio_session') && !hasBadge('bio_opus')) {
      if (awardBadge('bio_opus')) newBadges.push('bio_opus')
    }

    // neural_arc: bio_complete + all 3 Calendar v17 badges
    const calendarV17Badges: BadgeType[] = ['dna_day', 'brain_day', 'darwin_manuscript']
    if (bioComplete && calendarV17Badges.every(b => hasBadge(b)) && !hasBadge('neural_arc')) {
      if (awardBadge('neural_arc')) newBadges.push('neural_arc')
    }

    // nineteen_engines_arc: 1 badge from each Word Turn v1–v19
    const engineNineteenPresent = bioEarned.length >= 1
    const allNineteenEngines = allEighteenEngines && engineNineteenPresent
    if (allNineteenEngines && !hasBadge('nineteen_engines_arc')) {
      if (awardBadge('nineteen_engines_arc')) newBadges.push('nineteen_engines_arc')
    }

    // Mastery v19: long_signal — 700+ distinct calendar check-in days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 700 && !hasBadge('long_signal')) {
        if (awardBadge('long_signal')) newBadges.push('long_signal')
      }
    }

    // Mastery v19: body_of_work — 75,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 75000 && !hasBadge('body_of_work')) {
        if (awardBadge('body_of_work')) newBadges.push('body_of_work')
      }
    }

    // Mastery v19: decade_operator — Account age >= 10 years
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupBio = new Date(stats.signupDate)
      const yearsBio = (new Date().getTime() - signupBio.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsBio >= 10 && !hasBadge('decade_operator')) {
        if (awardBadge('decade_operator')) newBadges.push('decade_operator')
      }
    }

    // Mastery v19: nineteen_registers — 1 badge from all 19 Word Turn engines
    if (allNineteenEngines && !hasBadge('nineteen_registers')) {
      if (awardBadge('nineteen_registers')) newBadges.push('nineteen_registers')
    }

    // ── v20 — THE CODEX READER ────────────────────────────────────────────────
    const codexV20Badges: BadgeType[] = [
      'asimov_protocol', 'dune_path', 'matrix_jack', 'neuromancer_run',
      'hitchhiker_42', 'orwell_log', 'bradbury_ember', 'le_guin_left',
      'dick_dream', 'solaris_depth', 'octavia_seed', 'heinlein_grok',
    ]
    const codexV20Earned = codexV20Badges.filter(b => hasBadge(b))

    if (codexV20Earned.length >= 1 && !hasBadge('first_chapter')) {
      if (awardBadge('first_chapter')) newBadges.push('first_chapter')
    }
    if (codexV20Earned.length >= 5 && !hasBadge('trilogy_complete')) {
      if (awardBadge('trilogy_complete')) newBadges.push('trilogy_complete')
    }
    const libraryComplete = codexV20Earned.length >= 12
    if (libraryComplete && !hasBadge('library_complete')) {
      if (awardBadge('library_complete')) newBadges.push('library_complete')
    }

    // codex_opus: library_complete + reader_session
    if (libraryComplete && hasBadge('reader_session') && !hasBadge('codex_opus')) {
      if (awardBadge('codex_opus')) newBadges.push('codex_opus')
    }

    // grand_codex: library_complete + all 3 Calendar v18 badges
    const calendarV18Badges: BadgeType[] = ['asimov_birthday', 'tolkien_day', 'sagan_cosmos']
    if (libraryComplete && calendarV18Badges.every(b => hasBadge(b)) && !hasBadge('grand_codex')) {
      if (awardBadge('grand_codex')) newBadges.push('grand_codex')
    }

    // twenty_engines_arc: 1 badge from each Word Turn v1–v20
    const engineTwentyPresent = codexV20Earned.length >= 1
    const allTwentyEngines = allNineteenEngines && engineTwentyPresent
    if (allTwentyEngines && !hasBadge('twenty_engines_arc')) {
      if (awardBadge('twenty_engines_arc')) newBadges.push('twenty_engines_arc')
    }

    // Mastery v20: chapter_signal — 800+ distinct calendar days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 800 && !hasBadge('chapter_signal')) {
        if (awardBadge('chapter_signal')) newBadges.push('chapter_signal')
      }
    }

    // Mastery v20: word_of_worlds — 100,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 100000 && !hasBadge('word_of_worlds')) {
        if (awardBadge('word_of_worlds')) newBadges.push('word_of_worlds')
      }
    }

    // Mastery v20: elder_narrator — 1000+ memory answers + account age >= 5 years
    if (typeof stats.totalMemoryAnswers === 'number' && typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupElde = new Date(stats.signupDate)
      const yearsElde = (new Date().getTime() - signupElde.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (stats.totalMemoryAnswers >= 1000 && yearsElde >= 5 && !hasBadge('elder_narrator')) {
        if (awardBadge('elder_narrator')) newBadges.push('elder_narrator')
      }
    }

    // Mastery v20: twenty_registers — 1 badge from all 20 Word Turn engines
    if (allTwentyEngines && !hasBadge('twenty_registers')) {
      if (awardBadge('twenty_registers')) newBadges.push('twenty_registers')
    }

    // ── v21 — THE CYBERSPACE CODEX ────────────────────────────────────────────
    const cyberspaceV21Badges: BadgeType[] = [
      'matrix_code', 'cyberspace_open', 'grok_complete', 'ansible_link',
      'spice_flow', 'golden_path', 'solaris_call', 'foundation_key',
      'neuromancer_jack', 'replicant_wake', 'uplift_arc', 'left_hand',
    ]
    const cyberspaceV21Earned = cyberspaceV21Badges.filter(b => hasBadge(b))

    if (cyberspaceV21Earned.length >= 1 && !hasBadge('codex_entry')) {
      if (awardBadge('codex_entry')) newBadges.push('codex_entry')
    }
    if (cyberspaceV21Earned.length >= 5 && !hasBadge('codex_class')) {
      if (awardBadge('codex_class')) newBadges.push('codex_class')
    }
    const codexComplete = cyberspaceV21Earned.length >= 12
    if (codexComplete && !hasBadge('codex_complete')) {
      if (awardBadge('codex_complete')) newBadges.push('codex_complete')
    }

    // cyberspace_opus: codex_complete + codex_session
    if (codexComplete && hasBadge('codex_session') && !hasBadge('cyberspace_opus')) {
      if (awardBadge('cyberspace_opus')) newBadges.push('cyberspace_opus')
    }

    // sci_fi_arc: codex_complete + all 3 Calendar v19 badges
    const calendarV19Badges: BadgeType[] = ['asimov_day', 'dick_day', 'dune_day']
    if (codexComplete && calendarV19Badges.every(b => hasBadge(b)) && !hasBadge('sci_fi_arc')) {
      if (awardBadge('sci_fi_arc')) newBadges.push('sci_fi_arc')
    }

    // twenty_one_engines_arc: 1 badge from each Word Turn v1–v21
    const engineTwentyOnePresent = cyberspaceV21Earned.length >= 1
    const allTwentyOneEngines = allTwentyEngines && engineTwentyOnePresent
    if (allTwentyOneEngines && !hasBadge('twenty_one_engines_arc')) {
      if (awardBadge('twenty_one_engines_arc')) newBadges.push('twenty_one_engines_arc')
    }

    // Mastery v21: epic_reader — 800+ distinct calendar days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 800 && !hasBadge('epic_reader')) {
        if (awardBadge('epic_reader')) newBadges.push('epic_reader')
      }
    }

    // Mastery v21: thousand_pages — 100,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 100000 && !hasBadge('thousand_pages')) {
        if (awardBadge('thousand_pages')) newBadges.push('thousand_pages')
      }
    }

    // Mastery v21: first_edition — Account age >= 7 years
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupFE = new Date(stats.signupDate)
      const yearsFE = (new Date().getTime() - signupFE.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsFE >= 7 && !hasBadge('first_edition')) {
        if (awardBadge('first_edition')) newBadges.push('first_edition')
      }
    }

    // Mastery v21: twenty_one_registers — 1 badge from all 21 Word Turn engines
    if (allTwentyOneEngines && !hasBadge('twenty_one_registers')) {
      if (awardBadge('twenty_one_registers')) newBadges.push('twenty_one_registers')
    }

    // ── v32 (v22) — THE HERO'S JOURNEY ──────────────────────────────────────────
    const heroV22Badges: BadgeType[] = [
      'call_heard', 'threshold_crossed', 'mentor_arrived', 'ordeal_survived',
      'elixir_found', 'shadow_met', 'innermost_cave', 'shapeshifter',
      'herald_call', 'trickster_mode', 'ally_gained', 'return_road',
    ]
    const heroV22Earned = heroV22Badges.filter(b => hasBadge(b))

    if (heroV22Earned.length >= 1 && !hasBadge('quest_entry')) {
      if (awardBadge('quest_entry')) newBadges.push('quest_entry')
    }
    if (heroV22Earned.length >= 5 && !hasBadge('quest_class')) {
      if (awardBadge('quest_class')) newBadges.push('quest_class')
    }
    const questComplete = heroV22Earned.length >= 12
    if (questComplete && !hasBadge('quest_complete')) {
      if (awardBadge('quest_complete')) newBadges.push('quest_complete')
    }

    // hero_opus: quest_complete + hero_session
    if (questComplete && hasBadge('hero_session') && !hasBadge('hero_opus')) {
      if (awardBadge('hero_opus')) newBadges.push('hero_opus')
    }

    // monomyth_arc: quest_complete + all 3 Calendar v20 badges
    const calendarV20Badges: BadgeType[] = ['campbell_birthday', 'hobbit_day', 'odyssey_day']
    if (questComplete && calendarV20Badges.every(b => hasBadge(b)) && !hasBadge('monomyth_arc')) {
      if (awardBadge('monomyth_arc')) newBadges.push('monomyth_arc')
    }

    // twenty_two_engines_arc: 1 badge from each Word Turn v1–v22
    const engineTwentyTwoPresent = heroV22Earned.length >= 1
    const allTwentyTwoEngines = allTwentyOneEngines && engineTwentyTwoPresent
    if (allTwentyTwoEngines && !hasBadge('twenty_two_engines_arc')) {
      if (awardBadge('twenty_two_engines_arc')) newBadges.push('twenty_two_engines_arc')
    }

    // Mastery v22: odyssey_log — 900+ distinct calendar days
    if (typeof stats.distinctCheckInDays === 'number') {
      if (stats.distinctCheckInDays >= 900 && !hasBadge('odyssey_log')) {
        if (awardBadge('odyssey_log')) newBadges.push('odyssey_log')
      }
    }

    // Mastery v22: great_work — 150,000+ total journal words
    if (typeof stats.totalJournalWords === 'number') {
      if (stats.totalJournalWords >= 150000 && !hasBadge('great_work')) {
        if (awardBadge('great_work')) newBadges.push('great_work')
      }
    }

    // Mastery v22: saga_age — Account age >= 5 years
    if (typeof stats.signupDate === 'string' && stats.signupDate) {
      const signupSaga = new Date(stats.signupDate)
      const yearsSaga = (new Date().getTime() - signupSaga.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsSaga >= 5 && !hasBadge('saga_age')) {
        if (awardBadge('saga_age')) newBadges.push('saga_age')
      }
    }

    // Mastery v22: twenty_two_registers — 1 badge from all 22 Word Turn engines
    if (allTwentyTwoEngines && !hasBadge('twenty_two_registers')) {
      if (awardBadge('twenty_two_registers')) newBadges.push('twenty_two_registers')
    }

  } catch (error) {
    console.warn('Badge check failed:', error)
  }

  return newBadges
}

function syncBadgesToServer(newBadges?: string[]): void {
  if (typeof window === 'undefined') return

  try {
    const earnedBadges = getEarnedBadges()
    const badgeTheme = getBadgeTheme()

    fetch('/api/sync-badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        earnedBadges,
        badgeTheme,
        newBadges: newBadges || [],
      }),
    }).catch(() => {})
  } catch { /* non-critical */ }
}

export function hydrateBadgesFromServer(serverBadges: {
  earnedBadges?: string[]
  badgeTheme?: string | null
}): void {
  if (typeof window === 'undefined') return
  if (!serverBadges) return

  try {
    if (serverBadges.earnedBadges && serverBadges.earnedBadges.length > 0) {
      const localBadges = getEarnedBadges()
      const merged = Array.from(new Set([...localBadges, ...serverBadges.earnedBadges]))
      if (merged.length > localBadges.length) {
        saveEarnedBadges(merged as BadgeType[])
        console.log('[Badges] Hydrated from server:', merged)
      }
    }

    if (serverBadges.badgeTheme === 'water' || serverBadges.badgeTheme === 'architecture') {
      const localTheme = localStorage.getItem('badge_theme')
      if (!localTheme) {
        localStorage.setItem('badge_theme', serverBadges.badgeTheme)
        console.log('[Badges] Theme hydrated from server:', serverBadges.badgeTheme)
      }
    }
  } catch { /* non-critical */ }
}
