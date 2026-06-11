import type { FormationCodeValue } from '../../../formations/domain/value-objects/formation-code.vo';

export interface FormationMatchModifier {
  /** Attacking output multiplier (xG, shots, forward events). */
  readonly attackMultiplier: number;
  /** Defensive resistance multiplier (opponent xG suppression). */
  readonly defenseMultiplier: number;
  /** Normalized strength contribution for weighted match power (1.0 = neutral). */
  readonly strengthScore: number;
  /** Extra match events vs baseline. */
  readonly eventBias: number;
}

const NEUTRAL: FormationMatchModifier = {
  attackMultiplier: 1,
  defenseMultiplier: 1,
  strengthScore: 1,
  eventBias: 1,
};

export const FORMATION_MATCH_MODIFIERS: Readonly<
  Record<FormationCodeValue, FormationMatchModifier>
> = {
  '3-4-3': {
    attackMultiplier: 1.18,
    defenseMultiplier: 0.9,
    strengthScore: 1.06,
    eventBias: 1.12,
  },
  '4-3-3': {
    attackMultiplier: 1.12,
    defenseMultiplier: 0.95,
    strengthScore: 1.04,
    eventBias: 1.08,
  },
  '4-4-2': { ...NEUTRAL },
  '4-2-3-1': {
    attackMultiplier: 1.06,
    defenseMultiplier: 0.98,
    strengthScore: 1.02,
    eventBias: 1.04,
  },
  '3-5-2': {
    attackMultiplier: 1.08,
    defenseMultiplier: 0.92,
    strengthScore: 1.03,
    eventBias: 1.05,
  },
  '5-3-2': {
    attackMultiplier: 0.9,
    defenseMultiplier: 1.1,
    strengthScore: 0.95,
    eventBias: 0.94,
  },
  '4-5-1': {
    attackMultiplier: 0.85,
    defenseMultiplier: 1.12,
    strengthScore: 0.92,
    eventBias: 0.9,
  },
  '4-2-2-2': {
    attackMultiplier: 1.1,
    defenseMultiplier: 0.96,
    strengthScore: 1.03,
    eventBias: 1.06,
  },
  '4-1-2-1-2': {
    attackMultiplier: 1.04,
    defenseMultiplier: 0.99,
    strengthScore: 1.01,
    eventBias: 1.02,
  },
};

export function getFormationMatchModifier(formationCode: string): FormationMatchModifier {
  const modifier = FORMATION_MATCH_MODIFIERS[formationCode as FormationCodeValue];
  return modifier ?? NEUTRAL;
}
