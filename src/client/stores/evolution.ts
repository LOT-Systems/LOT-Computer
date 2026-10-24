/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Evolution Store
 *
 * Manages interface evolution state reactively using nanostores.
 * Syncs with achievements, badges, and user progression to
 * subtly evolve the interface over time.
 *
 * Evolution is not something you can fork from a repo.
 * It's earned through presence. LOT Systems — the original evolution.
 */

import { atom, computed } from 'nanostores';
import type {
  EvolutionState,
  VisualEvolutionEffects,
  FeatureUnlocks,
  Achievement,
  LayoutDensity
} from '../utils/interfaceEvolution';
import {
  calculateEvolutionState,
  getVisualEffects,
  getFeatureUnlocks,
  getEvolutionMilestone,
  getEvolutionCSSProperties,
  getLayoutDensity,
  DEFAULT_LAYOUT_DENSITY
} from '../utils/interfaceEvolution';
import {
  getThemeEvolutionEffects,
  getThemeEvolutionCSS,
  getEvolutionBackgroundPattern,
  getThemeAnimationCSS
} from '../utils/themeEvolution';

// Raw evolution state
export const $evolutionState = atom<EvolutionState | null>(null);

// Derived computed stores
export const $visualEffects = computed($evolutionState, (state) =>
  state ? getVisualEffects(state) : null
);

export const $featureUnlocks = computed($evolutionState, (state) =>
  state ? getFeatureUnlocks(state) : null
);

export const $evolutionCSS = computed($evolutionState, (state) =>
  state ? getEvolutionCSSProperties(state) : {}
);

// Layout density — progressive condensation from breathable to instrument
export const $layoutDensity = computed($evolutionState, (state): LayoutDensity =>
  state ? getLayoutDensity(state) : DEFAULT_LAYOUT_DENSITY
);

// Track previous state for milestone detection
let previousEvolutionState: EvolutionState | null = null;

/**
 * Update evolution state from user data
 */
export function updateEvolutionState(params: {
  achievements: Achievement[];
  level: number;
  streak: number;
  totalEntries: number;
  badgeTheme: 'water' | 'architecture' | null;
  earnedBadges: string[];
}): string | null {
  const newState = calculateEvolutionState(
    params.achievements,
    params.level,
    params.streak,
    params.totalEntries,
    params.badgeTheme,
    params.earnedBadges
  );

  // Check for milestone
  let milestone: string | null = null;
  if (previousEvolutionState) {
    milestone = getEvolutionMilestone(previousEvolutionState, newState);
  }

  // Update state
  previousEvolutionState = $evolutionState.get();
  $evolutionState.set(newState);

  // Apply evolution CSS properties to document
  const cssProps = getEvolutionCSSProperties(newState);
  Object.entries(cssProps).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // Set density level as data attribute for CSS pattern selection
  const density = getLayoutDensity(newState);
  document.documentElement.dataset.density = density.level;

  // Apply theme evolution CSS properties
  const themeEffects = getThemeEvolutionEffects(newState);
  const themeCssProps = getThemeEvolutionCSS(themeEffects);
  Object.entries(themeCssProps).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // Apply background pattern based on badge theme
  const backgroundPattern = getEvolutionBackgroundPattern(
    newState.badgeTheme,
    newState.badgeTier
  );
  if (backgroundPattern !== 'none') {
    document.documentElement.style.setProperty('--evolution-background-pattern', backgroundPattern);
  }

  // Inject theme animation CSS if needed
  const animationCSS = getThemeAnimationCSS(newState.badgeTheme);
  if (animationCSS) {
    let styleElement = document.getElementById('theme-evolution-animations');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-evolution-animations';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = animationCSS;
  }

  return milestone;
}

/**
 * Get current feature unlock for specific feature
 */
export function isFeatureUnlocked(feature: keyof FeatureUnlocks): boolean {
  const unlocks = $featureUnlocks.get();
  return unlocks ? unlocks[feature] : false;
}

/**
 * Get current visual effect value
 */
export function getVisualEffectValue<K extends keyof VisualEvolutionEffects>(
  key: K
): VisualEvolutionEffects[K] | null {
  const effects = $visualEffects.get();
  return effects ? effects[key] : null;
}

/**
 * Get evolution progress summary (for debugging/display)
 */
export function getEvolutionSummary(): {
  maturity: number;
  refinement: number;
  unlockLevel: number;
  milestone: string;
} | null {
  const state = $evolutionState.get();
  if (!state) return null;

  const milestones = [
    'Beginning',
    'Forming',
    'Emerging',
    'Developed',
    'Advanced',
    'Masterful'
  ];

  const milestoneIndex = Math.min(5, state.featureUnlockLevel);

  return {
    maturity: Math.round(state.overallMaturity * 100),
    refinement: Math.round(state.visualRefinement * 100),
    unlockLevel: state.featureUnlockLevel,
    milestone: milestones[milestoneIndex]
  };
}

/**
 * Export for debugging in console
 */
if (typeof window !== 'undefined') {
  (window as any).__evolutionDebug = {
    getState: () => $evolutionState.get(),
    getEffects: () => $visualEffects.get(),
    getUnlocks: () => $featureUnlocks.get(),
    getDensity: () => $layoutDensity.get(),
    getSummary: getEvolutionSummary
  };
}
