/**
 * Interface Evolution System
 *
 * Subtly evolves the LOT interface based on:
 * - Team badge progression (Water/Architecture metaphors)
 * - Spiritual/psychological achievements (7 categories)
 * - User level and story arc chapter
 * - Behavioral patterns and consistency
 *
 * Evolution is subtle and gradual, respecting user agency while
 * rewarding progression with refined aesthetics and unlocked capabilities.
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlock_date: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface EvolutionState {
  // Core progression metrics (0-1 normalized)
  exploration: number;      // Discovery & first-time experiences
  consistency: number;      // Behavioral stamina & streaks
  depth: number;           // Knowledge accumulation
  connection: number;      // Social engagement
  intimacy: number;        // Romantic vulnerability
  care: number;            // Self-compassion practices
  courage: number;         // Truth-telling & honesty

  // Badge progression
  badgeTier: 0 | 1 | 2 | 3; // 0=none, 1=first, 2=mid, 3=ultimate
  badgeTheme: 'water' | 'architecture' | null;

  // Level & chapter
  level: number;           // 1-100
  chapter: 1 | 2 | 3 | 4;  // Story arc chapter

  // Derived evolution metrics
  overallMaturity: number;  // 0-1, composite of all dimensions
  visualRefinement: number; // 0-1, controls opacity/clarity
  featureUnlockLevel: number; // 0-5, gates advanced features
  themeComplexity: number;  // 0-1, color palette depth
  animationIntensity: number; // 0-1, motion sophistication
}

export interface VisualEvolutionEffects {
  // Opacity and clarity
  baseOpacity: number;      // 0.85-1.0
  accentOpacity: number;    // 0.7-1.0
  gridOpacity: number;      // 0.15-0.5

  // Spacing and rhythm
  letterSpacing: string;    // -0.02em to 0.01em
  lineHeight: number;       // 1.4-1.6
  gridSize: number;         // 4-6px

  // Effects and polish
  glowIntensity: number;    // 0-0.3
  blurRadius: number;       // 0-8px (inverse - less blur = more refined)
  transitionSpeed: number;  // 150-400ms

  // Color depth
  paletteSteps: number;     // 5-10 color gradations
  colorSaturation: number;  // 0.8-1.2

  // Layout complexity
  maxColumns: number;       // 1-3 for grid layouts
  widgetDensity: 'sparse' | 'balanced' | 'rich';
}

export interface FeatureUnlocks {
  // Widget availability
  advancedMemory: boolean;   // Deep reflection questions
  plannerTemplates: boolean; // Custom planner templates
  communityRich: boolean;    // Rich community features
  moodPatterns: boolean;     // Mood pattern analysis
  intentionHistory: boolean; // Historical intention tracking
  achievementGallery: boolean; // Achievement showcase

  // Customization depth
  customThemes: boolean;     // Custom color themes
  badgeSelection: boolean;   // Choose badge metaphor
  widgetArrange: boolean;    // Drag-drop widget arrangement
  exportData: boolean;       // Export personal data

  // Advanced features
  narrativeReflection: boolean; // AI narrative synthesis
  patternInsights: boolean;  // Quantum intent patterns
  socialMentions: boolean;   // @ mentions in community
  privateSpaces: boolean;    // Private reflection rooms
}

/**
 * Calculate evolution state from achievements and user data
 */
export function calculateEvolutionState(
  achievements: Achievement[],
  level: number,
  streak: number,
  totalEntries: number,
  badgeTheme: 'water' | 'architecture' | null,
  earnedBadges: string[]
): EvolutionState {
  // Achievement category scoring (0-1 normalized)
  const exploration = calculateCategoryScore(achievements, [
    'first_breath',
    'mirror_gazer',
    'community_voice'
  ], 3);

  const consistency = calculateCategoryScore(achievements, [
    'week_warrior',
    'moon_cycle',
    'unwavering'
  ], 3);

  const depth = calculateCategoryScore(achievements, [
    'deep_diver',
    'self_scholar',
    'soul_cartographer'
  ], 3);

  const connection = calculateCategoryScore(achievements, [
    'bridge_builder'
  ], 1);

  const intimacy = calculateCategoryScore(achievements, [
    'heart_tender',
    'intimacy_keeper'
  ], 2);

  const care = calculateCategoryScore(achievements, [
    'gentle_with_self'
  ], 1);

  const courage = calculateCategoryScore(achievements, [
    'truth_speaker'
  ], 1);

  // Badge tier calculation
  const badgeTier = (earnedBadges.length === 0 ? 0 :
                     earnedBadges.length === 1 ? 1 :
                     earnedBadges.length === 2 ? 2 : 3) as 0 | 1 | 2 | 3;

  // Story arc chapter (based on level)
  const chapter = (level >= 60 ? 4 :
                   level >= 30 ? 3 :
                   level >= 10 ? 2 : 1) as 1 | 2 | 3 | 4;

  // Derived metrics
  const overallMaturity = (
    exploration * 0.15 +
    consistency * 0.25 +
    depth * 0.20 +
    connection * 0.10 +
    intimacy * 0.10 +
    care * 0.10 +
    courage * 0.10
  );

  // Visual refinement emphasizes consistency and depth
  const visualRefinement = Math.min(1, (
    consistency * 0.4 +
    depth * 0.3 +
    (level / 100) * 0.3
  ));

  // Feature unlocks are gated by exploration + overall progress
  const featureUnlockLevel = Math.floor(
    exploration * 2 +
    overallMaturity * 3
  );

  // Theme complexity grows with badge tier and maturity
  const themeComplexity = Math.min(1, (
    (badgeTier / 3) * 0.5 +
    overallMaturity * 0.5
  ));

  // Animation intensity balances badge theme preference
  const baseAnimationScore = (connection * 0.3 + intimacy * 0.3 + overallMaturity * 0.4);
  const animationIntensity = badgeTheme === 'water'
    ? Math.min(1, baseAnimationScore * 1.2) // Water = more fluid
    : badgeTheme === 'architecture'
    ? Math.min(1, baseAnimationScore * 0.8) // Architecture = more structured
    : baseAnimationScore;

  return {
    exploration,
    consistency,
    depth,
    connection,
    intimacy,
    care,
    courage,
    badgeTier,
    badgeTheme,
    level,
    chapter,
    overallMaturity,
    visualRefinement,
    featureUnlockLevel,
    themeComplexity,
    animationIntensity
  };
}

/**
 * Helper: Calculate achievement category score
 */
function calculateCategoryScore(
  achievements: Achievement[],
  targetIds: string[],
  maxCount: number
): number {
  const earned = achievements.filter(a => targetIds.includes(a.id)).length;
  return Math.min(1, earned / maxCount);
}

/**
 * Convert evolution state to visual effects
 */
export function getVisualEffects(state: EvolutionState): VisualEvolutionEffects {
  const { visualRefinement, themeComplexity, animationIntensity, badgeTheme } = state;

  // Opacity increases with refinement (clearer, more confident)
  const baseOpacity = 0.85 + (visualRefinement * 0.15);
  const accentOpacity = 0.70 + (visualRefinement * 0.30);
  const gridOpacity = 0.15 + (themeComplexity * 0.35);

  // Typography refinement (tighter spacing = more refined)
  const letterSpacing = `${-0.02 + (visualRefinement * 0.03)}em`;
  const lineHeight = 1.4 + (visualRefinement * 0.2);

  // Grid size (tighter grid = more mature)
  const gridSize = 6 - (themeComplexity * 2);

  // Effects (more glow = more achievement polish)
  const glowIntensity = themeComplexity * 0.3;
  const blurRadius = 8 - (visualRefinement * 8); // Less blur over time
  const transitionSpeed = 400 - (animationIntensity * 250);

  // Color palette depth
  const paletteSteps = Math.floor(5 + (themeComplexity * 5));
  const colorSaturation = 0.8 + (themeComplexity * 0.4);

  // Layout complexity (grows with depth achievements)
  const maxColumns = state.depth > 0.66 ? 3 : state.depth > 0.33 ? 2 : 1;
  const widgetDensity = state.depth > 0.66 ? 'rich' :
                       state.depth > 0.33 ? 'balanced' : 'sparse';

  return {
    baseOpacity,
    accentOpacity,
    gridOpacity,
    letterSpacing,
    lineHeight,
    gridSize,
    glowIntensity,
    blurRadius,
    transitionSpeed,
    paletteSteps,
    colorSaturation,
    maxColumns,
    widgetDensity
  };
}

/**
 * Determine feature unlock state
 */
export function getFeatureUnlocks(state: EvolutionState): FeatureUnlocks {
  const {
    exploration,
    consistency,
    depth,
    connection,
    intimacy,
    care,
    courage,
    featureUnlockLevel,
    level,
    badgeTier
  } = state;

  return {
    // Widget availability (progressive unlock)
    advancedMemory: depth >= 0.33,           // Deep Diver achievement
    plannerTemplates: consistency >= 0.33,   // Week Warrior+
    communityRich: connection >= 0.5,        // Bridge Builder
    moodPatterns: care >= 0.5 || level >= 20,
    intentionHistory: level >= 15,
    achievementGallery: exploration >= 1.0,  // All exploration badges

    // Customization (early unlocks for agency)
    customThemes: level >= 5,
    badgeSelection: badgeTier >= 1,          // Any badge earned
    widgetArrange: level >= 10,
    exportData: level >= 25,

    // Advanced features (later game)
    narrativeReflection: depth >= 0.66 && level >= 30, // Self Scholar+
    patternInsights: consistency >= 0.66,    // Moon Cycle+
    socialMentions: connection >= 1.0,       // Full connection path
    privateSpaces: intimacy >= 0.5 || courage >= 1.0
  };
}

/**
 * Get evolution milestone message when user crosses threshold
 */
export function getEvolutionMilestone(
  previousState: EvolutionState,
  currentState: EvolutionState
): string | null {
  // Badge tier advancement
  if (currentState.badgeTier > previousState.badgeTier) {
    const tier = currentState.badgeTier;
    const theme = currentState.badgeTheme;

    if (theme === 'water') {
      const messages = [
        null,
        "First drops form. The interface flows with you.",
        "Waves begin to flow. Patterns deepen.",
        "Current flows strong. Everything moves as one."
      ];
      return messages[tier];
    } else if (theme === 'architecture') {
      const messages = [
        null,
        "Foundation laid. Structure begins to rise.",
        "Architecture emerges. Each piece finds its place.",
        "Mastery achieved. The system breathes with you."
      ];
      return messages[tier];
    }
  }

  // Chapter advancement
  if (currentState.chapter > previousState.chapter) {
    const chapterMessages = [
      null,
      "Awakening begins. You notice yourself.",
      "Exploration deepens. Patterns emerge.",
      "Integration flows. Meaning weaves through everything.",
      "Mastery unfolds. You architect your becoming."
    ];
    return chapterMessages[currentState.chapter];
  }

  // Major maturity milestones
  const maturityThresholds = [0.25, 0.50, 0.75, 0.95];
  for (const threshold of maturityThresholds) {
    if (previousState.overallMaturity < threshold &&
        currentState.overallMaturity >= threshold) {
      if (threshold === 0.25) return "The interface responds to your presence.";
      if (threshold === 0.50) return "Half the journey. The system knows you.";
      if (threshold === 0.75) return "Deep resonance. Interface and intention align.";
      if (threshold === 0.95) return "Near complete. You are the living operating theater.";
    }
  }

  return null;
}

/**
 * Generate CSS custom properties for evolution state
 */
export function getEvolutionCSSProperties(state: EvolutionState): Record<string, string> {
  const effects = getVisualEffects(state);

  return {
    '--evolution-base-opacity': effects.baseOpacity.toString(),
    '--evolution-accent-opacity': effects.accentOpacity.toString(),
    '--evolution-grid-opacity': effects.gridOpacity.toString(),
    '--evolution-letter-spacing': effects.letterSpacing,
    '--evolution-line-height': effects.lineHeight.toString(),
    '--evolution-grid-size': `${effects.gridSize}px`,
    '--evolution-glow-intensity': effects.glowIntensity.toString(),
    '--evolution-blur-radius': `${effects.blurRadius}px`,
    '--evolution-transition-speed': `${effects.transitionSpeed}ms`,
    '--evolution-color-saturation': effects.colorSaturation.toString(),
    '--evolution-max-columns': effects.maxColumns.toString(),
  };
}
