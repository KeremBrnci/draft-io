import { describe, expect, it } from 'vitest';

import { DEFAULT_CHEMISTRY_CONFIG } from '../../domain/config/default-draft-balance.config';
import { ChemistryCalculator } from '../../domain/services/chemistry-calculator.service';

describe('ChemistryCalculator', () => {
  const calculator = new ChemistryCalculator(DEFAULT_CHEMISTRY_CONFIG);

  it('applies club, nation and league bonuses with per-player cap', () => {
    const result = calculator.calculatePlayerChemistry(
      {
        cardId: 'new',
        teamId: 'team-1',
        leagueId: 'league-1',
        nationality: 'TR',
      },
      [
        { cardId: 'club-mate', teamId: 'team-1', leagueId: 'league-1', nationality: 'TR' },
        { cardId: 'nation-mate', teamId: 'team-2', leagueId: 'league-2', nationality: 'TR' },
      ],
    );

    expect(result.chemistry).toBe(3);
    expect(result.sources).toContain('club');
    expect(result.sources).toContain('nation');
  });

  it('caps team chemistry at 33', () => {
    const cards = Array.from({ length: 11 }, (_, index) => ({
      cardId: `card-${index}`,
      teamId: 'team-1',
      leagueId: 'league-1',
      nationality: 'TR',
    }));

    const result = calculator.calculateTeamChemistry(cards);
    expect(result.teamChemistry).toBeLessThanOrEqual(33);
    expect(result.players).toHaveLength(11);
  });
});
