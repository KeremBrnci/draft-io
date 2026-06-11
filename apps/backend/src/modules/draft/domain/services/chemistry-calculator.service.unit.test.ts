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

    expect(result.chemistry).toBe(5);
    expect(result.sources).toContain('club');
    expect(result.sources).toContain('nation');
  });

  it('adds coach compatibility bonuses for matching team, nation and league', () => {
    const cards = [
      {
        cardId: 'card-1',
        teamId: 'team-1',
        leagueId: 'league-1',
        nationality: 'TR',
      },
    ];

    const result = calculator.calculateTeamChemistry(cards, {
      teamId: 'team-1',
      leagueId: 'league-1',
      nationality: 'TR',
    });

    expect(result.players[0]?.chemistry).toBe(5);
    expect(result.teamChemistry).toBe(5);
  });

  it('caps team chemistry at configured maximum', () => {
    const cards = Array.from({ length: 11 }, (_, index) => ({
      cardId: `card-${index}`,
      teamId: 'team-1',
      leagueId: 'league-1',
      nationality: 'TR',
    }));

    const result = calculator.calculateTeamChemistry(cards, {
      teamId: 'team-1',
      leagueId: 'league-1',
      nationality: 'TR',
    });

    expect(result.teamChemistry).toBeLessThanOrEqual(66);
    expect(result.players).toHaveLength(11);
  });
});
