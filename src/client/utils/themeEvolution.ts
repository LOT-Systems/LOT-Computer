/**
 * Theme Evolution
 *
 * Subtly evolves theme aesthetics based on badge progression and metaphor choice.
 * Water badges → more fluid, organic gradients
 * Architecture badges → more structured, geometric patterns
 */

import type { EvolutionState } from './interfaceEvolution';

export interface ThemeEvolutionEffects {
  // Water theme effects
  flowIntensity: number;        // 0-1, controls fluid animations
  organicCurve: number;         // 0-1, border radius intensity
  waveFrequency: number;        // 0-1, wave animation speed

  // Architecture theme effects
  geometricPrecision: number;   // 0-1, grid alignment strictness
  structuralDepth: number;      // 0-1, layering and elevation
  symmetryBalance: number;      // 0-1, compositional balance

  // Universal effects (both themes)
  colorFlowDirection: 'horizontal' | 'vertical' | 'radial';
  patternScale: number;         // 0.5-2, pattern size multiplier
  edgeSharpness: number;        // 0-1, border crispness
}

/**
 * Calculate theme evolution effects based on evolution state
 */
export function getThemeEvolutionEffects(state: EvolutionState): ThemeEvolutionEffects {
  const { badgeTheme, badgeTier, themeComplexity, animationIntensity } = state;

  // Base effects
  const tierMultiplier = badgeTier / 3; // 0-1 based on badge tier

  if (badgeTheme === 'water') {
    // Water theme: More fluid, organic, flowing
    return {
      // Water-specific
      flowIntensity: Math.min(1, animationIntensity * 1.3),
      organicCurve: 0.3 + (themeComplexity * 0.4), // More rounded
      waveFrequency: 0.5 + (tierMultiplier * 0.5),

      // Architecture effects (muted for water theme)
      geometricPrecision: 0.2,
      structuralDepth: 0.3,
      symmetryBalance: 0.4,

      // Universal
      colorFlowDirection: tierMultiplier > 0.66 ? 'radial' : 'vertical',
      patternScale: 0.8 + (themeComplexity * 0.6), // Smaller, more organic
      edgeSharpness: 0.3 + (themeComplexity * 0.3), // Softer edges
    };
  } else if (badgeTheme === 'architecture') {
    // Architecture theme: More structured, geometric, precise
    return {
      // Water effects (muted for architecture theme)
      flowIntensity: 0.2,
      organicCurve: 0.1,
      waveFrequency: 0.1,

      // Architecture-specific
      geometricPrecision: 0.6 + (themeComplexity * 0.4),
      structuralDepth: 0.5 + (tierMultiplier * 0.5),
      symmetryBalance: 0.7 + (themeComplexity * 0.3),

      // Universal
      colorFlowDirection: tierMultiplier > 0.66 ? 'horizontal' : 'vertical',
      patternScale: 1.0 + (themeComplexity * 0.5), // Larger, more structured
      edgeSharpness: 0.7 + (themeComplexity * 0.3), // Sharper edges
    };
  } else {
    // No badge theme yet - neutral balanced state
    return {
      flowIntensity: 0.4,
      organicCurve: 0.2,
      waveFrequency: 0.3,
      geometricPrecision: 0.4,
      structuralDepth: 0.4,
      symmetryBalance: 0.5,
      colorFlowDirection: 'vertical',
      patternScale: 1.0,
      edgeSharpness: 0.5,
    };
  }
}

/**
 * Generate CSS custom properties for theme evolution
 */
export function getThemeEvolutionCSS(effects: ThemeEvolutionEffects): Record<string, string> {
  return {
    '--theme-flow-intensity': effects.flowIntensity.toString(),
    '--theme-organic-curve': `${effects.organicCurve * 8}px`,
    '--theme-wave-frequency': `${2 + effects.waveFrequency * 4}s`,
    '--theme-geometric-precision': effects.geometricPrecision.toString(),
    '--theme-structural-depth': `${effects.structuralDepth * 4}px`,
    '--theme-symmetry-balance': effects.symmetryBalance.toString(),
    '--theme-color-flow-direction': effects.colorFlowDirection,
    '--theme-pattern-scale': effects.patternScale.toString(),
    '--theme-edge-sharpness': `${(1 - effects.edgeSharpness) * 2}px`,
  };
}

/**
 * Get background pattern based on badge theme and tier
 */
export function getEvolutionBackgroundPattern(
  badgeTheme: 'water' | 'architecture' | null,
  badgeTier: number
): string {
  if (!badgeTheme || badgeTier === 0) {
    return 'none';
  }

  if (badgeTheme === 'water') {
    // Water themes use flowing, organic patterns
    if (badgeTier === 1) {
      return 'radial-gradient(circle at 20% 50%, rgb(var(--acc-color-default) / 0.02) 0%, transparent 50%)';
    } else if (badgeTier === 2) {
      return `
        radial-gradient(circle at 20% 50%, rgb(var(--acc-color-default) / 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgb(var(--acc-color-default) / 0.02) 0%, transparent 50%)
      `;
    } else {
      return `
        radial-gradient(circle at 20% 30%, rgb(var(--acc-color-default) / 0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgb(var(--acc-color-default) / 0.03) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgb(var(--acc-color-default) / 0.02) 0%, transparent 70%)
      `;
    }
  } else {
    // Architecture themes use geometric, structured patterns
    if (badgeTier === 1) {
      return 'linear-gradient(90deg, rgb(var(--acc-color-default) / 0.02) 1px, transparent 1px)';
    } else if (badgeTier === 2) {
      return `
        linear-gradient(90deg, rgb(var(--acc-color-default) / 0.02) 1px, transparent 1px),
        linear-gradient(0deg, rgb(var(--acc-color-default) / 0.02) 1px, transparent 1px)
      `;
    } else {
      return `
        linear-gradient(90deg, rgb(var(--acc-color-default) / 0.03) 1px, transparent 1px),
        linear-gradient(0deg, rgb(var(--acc-color-default) / 0.03) 1px, transparent 1px),
        linear-gradient(45deg, rgb(var(--acc-color-default) / 0.01) 1px, transparent 1px)
      `;
    }
  }
}

/**
 * Get animation keyframes for badge theme
 */
export function getThemeAnimationCSS(badgeTheme: 'water' | 'architecture' | null): string {
  if (badgeTheme === 'water') {
    return `
      @keyframes water-flow {
        0%, 100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-2px) scale(1.01);
        }
      }

      .water-flow-animate {
        animation: water-flow var(--theme-wave-frequency) ease-in-out infinite;
      }
    `;
  } else if (badgeTheme === 'architecture') {
    return `
      @keyframes structure-pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.005);
          opacity: 0.95;
        }
      }

      .structure-pulse-animate {
        animation: structure-pulse 4s ease-in-out infinite;
      }
    `;
  }
  return '';
}
