import { describe, expect, it } from 'vitest';

import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../config/default-draft-balance.config';
import type { DraftPoolCard } from '../models/draft-pool-card';

import { expandDraftEligiblePositionCodes } from './expand-draft-position-codes';
import { PositionCompatibilityService } from './position-compatibility.service';

function buildWidePlayer(positionCode: 'LW' | 'RW'): DraftPoolCard {
  return {
    cardId: `card-${positionCode}`,
    playerId: `player-${positionCode}`,
    displayName: `Wide ${positionCode}`,
    overall: 84,
    cardTypeCode: 'BASE',
    cardRarityCode: 'COMMON',
    teamId: 'team-1',
    leagueId: 'league-1',
    nationality: 'TR',
    imageUrl: null,
    nationalityFlagUrl: null,
    leagueName: null,
    leagueLogoUrl: null,
    positions: [{ positionCode, isPrimary: true, sortOrder: 0 }],
  };
}

describe('expandDraftEligiblePositionCodes', () => {
  it('expands LM to include LW equivalents', () => {
    expect(expandDraftEligiblePositionCodes(['LM'])).toEqual(['LW', 'LM']);
  });

  it('expands RM to include RW equivalents', () => {
    expect(expandDraftEligiblePositionCodes(['RM'])).toEqual(['RW', 'RM']);
  });
});

describe('PositionCompatibilityService wide midfield equivalence', () => {
  const service = new PositionCompatibilityService(DEFAULT_DRAFT_BALANCE_CONFIG.positionWeights);

  it('treats LW players as eligible for LM slots', () => {
    const player = buildWidePlayer('LW');
    expect(service.isEligible(player, 'LM')).toBe(true);
    expect(service.getWeight(player, 'LM')).toBeGreaterThan(0);
  });

  it('treats RW players as eligible for RM slots', () => {
    const player = buildWidePlayer('RW');
    expect(service.isEligible(player, 'RM')).toBe(true);
    expect(service.getWeight(player, 'RM')).toBeGreaterThan(0);
  });
});
