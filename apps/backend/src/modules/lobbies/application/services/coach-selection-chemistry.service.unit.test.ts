import { describe, expect, it } from 'vitest';

import { Coach } from '../../../coaches/domain/entities/coach.entity';
import { CoachId } from '../../../coaches/domain/value-objects/coach-id.vo';
import { DEFAULT_CHEMISTRY_CONFIG } from '../../../draft/domain/config/default-draft-balance.config';
import type { DraftPoolCard } from '../../../draft/domain/models/draft-pool-card';

import { CoachSelectionChemistryService } from './coach-selection-chemistry.service';

describe('CoachSelectionChemistryService', () => {
  const service = new CoachSelectionChemistryService(DEFAULT_CHEMISTRY_CONFIG);

  const draftedCards: readonly DraftPoolCard[] = [
    {
      cardId: 'card-1',
      playerId: 'player-1',
      displayName: 'Player One',
      overall: 85,
      cardTypeCode: 'BASE',
      cardRarityCode: 'COMMON',
      positions: [{ positionCode: 'ST', isPrimary: true, sortOrder: 0 }],
      teamId: 'team-1',
      leagueId: 'league-1',
      nationality: 'TR',
      imageUrl: null,
      nationalityFlagUrl: null,
      teamName: null,
      teamLogoUrl: null,
      leagueName: null,
      leagueLogoUrl: null,
    },
  ];

  function buildCoach(
    overrides: Partial<{
      teamId: string | null;
      leagueId: string | null;
      nationality: string;
    }> = {},
  ) {
    return Coach.reconstitute({
      id: CoachId.create('coach-1'),
      provider: null,
      externalId: null,
      firstName: 'Test',
      lastName: 'Coach',
      displayName: 'Test Coach',
      role: 'Manager',
      nationality: overrides.nationality ?? 'DE',
      age: 45,
      birthDate: null,
      imageUrl: null,
      appointedDate: null,
      contractExpires: null,
      teamId: overrides.teamId ?? 'team-9',
      leagueId: overrides.leagueId ?? 'league-9',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  it('returns zero bonus when coach does not improve roster chemistry', () => {
    const projection = service.projectForCoach(draftedCards, buildCoach());

    expect(projection.chemistryBonus).toBe(0);
    expect(projection.projectedTeamChemistry).toBeGreaterThanOrEqual(0);
  });

  it('returns positive bonus when coach matches roster identity links', () => {
    const projection = service.projectForCoach(
      draftedCards,
      buildCoach({ teamId: 'team-1', leagueId: 'league-1', nationality: 'TR' }),
    );

    expect(projection.chemistryBonus).toBeGreaterThan(0);
    expect(projection.projectedTeamChemistry).toBeGreaterThanOrEqual(projection.chemistryBonus);
  });
});
