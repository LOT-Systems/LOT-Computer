/**
 * Interface Evolution Widget
 *
 * Displays current interface evolution state, feature unlocks,
 * and progression through spiritual/psychological dimensions.
 */

import React from 'react';
import { useStore } from '@nanostores/react';
import { Block } from '#client/components/ui';
import { $evolutionState, $featureUnlocks, $visualEffects } from '#client/stores/evolution';

type EvolutionView = 'dimensions' | 'features' | 'effects';

export function InterfaceEvolutionWidget() {
  const [view, setView] = React.useState<EvolutionView>('dimensions');
  const evolutionState = useStore($evolutionState);
  const featureUnlocks = useStore($featureUnlocks);
  const visualEffects = useStore($visualEffects);

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'dimensions': return 'features';
        case 'features': return 'effects';
        case 'effects': return 'dimensions';
        default: return 'dimensions';
      }
    });
  };

  if (!evolutionState || !featureUnlocks || !visualEffects) return null;

  const label =
    view === 'dimensions' ? 'Evolution:' :
    view === 'features' ? 'Unlocks:' :
    'Effects:';

  // Dimension data
  const dimensions = [
    { name: 'Exploration', value: evolutionState.exploration, icon: '∘' },
    { name: 'Consistency', value: evolutionState.consistency, icon: '≋' },
    { name: 'Depth', value: evolutionState.depth, icon: '⊕' },
    { name: 'Connection', value: evolutionState.connection, icon: '◊' },
    { name: 'Intimacy', value: evolutionState.intimacy, icon: '♡' },
    { name: 'Care', value: evolutionState.care, icon: '✧' },
    { name: 'Courage', value: evolutionState.courage, icon: '↑' },
  ];

  // Feature unlock categories
  const featureCategories = [
    {
      category: 'Widgets',
      features: [
        { name: 'Advanced Memory', unlocked: featureUnlocks.advancedMemory },
        { name: 'Planner Templates', unlocked: featureUnlocks.plannerTemplates },
        { name: 'Rich Community', unlocked: featureUnlocks.communityRich },
        { name: 'Mood Patterns', unlocked: featureUnlocks.moodPatterns },
        { name: 'Intention History', unlocked: featureUnlocks.intentionHistory },
      ]
    },
    {
      category: 'Customization',
      features: [
        { name: 'Custom Themes', unlocked: featureUnlocks.customThemes },
        { name: 'Badge Selection', unlocked: featureUnlocks.badgeSelection },
        { name: 'Widget Arrange', unlocked: featureUnlocks.widgetArrange },
        { name: 'Export Data', unlocked: featureUnlocks.exportData },
      ]
    },
    {
      category: 'Advanced',
      features: [
        { name: 'Narrative Reflection', unlocked: featureUnlocks.narrativeReflection },
        { name: 'Pattern Insights', unlocked: featureUnlocks.patternInsights },
        { name: 'Social Mentions', unlocked: featureUnlocks.socialMentions },
        { name: 'Private Spaces', unlocked: featureUnlocks.privateSpaces },
      ]
    }
  ];

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'dimensions' && (
        <div className="inline-block">
          {/* Overall maturity */}
          <div className="mb-12 flex items-center gap-12">
            <span className="text-[20px]">
              {Math.round(evolutionState.overallMaturity * 100)}%
            </span>
            <span>Overall Maturity</span>
          </div>

          {/* Badge tier */}
          {evolutionState.badgeTier > 0 && (
            <div className="mb-12 flex items-center gap-8">
              <span>
                {evolutionState.badgeTheme === 'water' ? '≋' : '║·║'}
              </span>
              <span>
                Tier {evolutionState.badgeTier} ({evolutionState.badgeTheme})
              </span>
            </div>
          )}

          {/* Dimensions */}
          <div className="flex flex-col gap-4">
            {dimensions.map(dim => (
              <div key={dim.name} className="flex items-center gap-8">
                <span className="w-12">{dim.icon}</span>
                <span className="w-80">{dim.name}</span>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 h-4 border border-[rgb(var(--acc-color-default)/0.2)]">
                    <div
                      className="h-full bg-[rgb(var(--acc-color-default)/var(--evolution-accent-opacity))]
                                 evolved-transition"
                      style={{ width: `${dim.value * 100}%` }}
                    />
                  </div>
                  <span className="w-32 text-right text-[12px] opacity-60">
                    {Math.round(dim.value * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'features' && (
        <div className="inline-block">
          {featureCategories.map(cat => (
            <div key={cat.category} className="mb-12 last:mb-0">
              <div className="mb-4 text-[12px] opacity-60">{cat.category}</div>
              <div className="flex flex-col gap-2">
                {cat.features.map(feature => (
                  <div key={feature.name} className="flex items-center gap-8">
                    <span className={feature.unlocked ? 'opacity-100' : 'opacity-30'}>
                      {feature.unlocked ? '✓' : '○'}
                    </span>
                    <span className={feature.unlocked ? 'opacity-100' : 'opacity-40'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'effects' && (
        <div className="inline-block">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between gap-16">
              <span>Visual Refinement</span>
              <span>{Math.round(evolutionState.visualRefinement * 100)}%</span>
            </div>
            <div className="flex justify-between gap-16">
              <span>Theme Complexity</span>
              <span>{Math.round(evolutionState.themeComplexity * 100)}%</span>
            </div>
            <div className="flex justify-between gap-16">
              <span>Animation Intensity</span>
              <span>{Math.round(evolutionState.animationIntensity * 100)}%</span>
            </div>

            <div className="mt-8 pt-8 border-t border-[rgb(var(--acc-color-default)/0.1)] text-[12px] opacity-60">
              <div className="mb-4">Current Effects:</div>
              <div className="flex flex-col gap-2">
                <div>Opacity: {visualEffects.baseOpacity.toFixed(2)}</div>
                <div>Grid: {visualEffects.gridSize}px</div>
                <div>Spacing: {visualEffects.letterSpacing}</div>
                <div>Layout: {visualEffects.widgetDensity}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Block>
  );
}
