import type { DraftPoolCard } from '../domain/models/draft-pool-card';
import { createParticipantDraftState } from '../domain/models/participant-draft-state';

export function buildTestDraftPoolCard(overrides: Partial<DraftPoolCard> = {}): DraftPoolCard {
  return {
    cardId: 'card-1',
    playerId: 'player-1',
    displayName: 'Test Player',
    overall: 87,
    cardTypeCode: 'BASE',
    cardRarityCode: 'COMMON',
    teamId: 'team-1',
    leagueId: 'league-1',
    nationality: 'TR',
    imageUrl: null,
    nationalityFlagUrl: null,
    leagueName: null,
    leagueLogoUrl: null,
    positions: [{ positionCode: 'CM', isPrimary: true, sortOrder: 0 }],
    ...overrides,
  };
}

export function buildTestParticipantState(
  overrides: Partial<ReturnType<typeof createParticipantDraftState>> = {},
) {
  return {
    ...createParticipantDraftState({
      participantId: 'participant-1',
      powerBudget: 960,
    }),
    ...overrides,
  };
}

export function buildTestPool(): readonly DraftPoolCard[] {
  return [
    buildTestDraftPoolCard({
      cardId: 's-1',
      playerId: 'player-s-1',
      overall: 93,
      displayName: 'Elite CM',
      positions: [{ positionCode: 'CM', isPrimary: true, sortOrder: 0 }],
    }),
    buildTestDraftPoolCard({
      cardId: 'a-1',
      playerId: 'player-a-1',
      overall: 89,
      displayName: 'Strong CM',
    }),
    buildTestDraftPoolCard({
      cardId: 'b-1',
      playerId: 'player-b-1',
      overall: 86,
      displayName: 'Solid CM',
    }),
    buildTestDraftPoolCard({
      cardId: 'c-1',
      playerId: 'player-c-1',
      overall: 82,
      displayName: 'Average CM',
    }),
    buildTestDraftPoolCard({
      cardId: 'd-1',
      playerId: 'player-d-1',
      overall: 77,
      displayName: 'Risk CM',
    }),
    buildTestDraftPoolCard({
      cardId: 'chem-1',
      playerId: 'player-chem-1',
      overall: 81,
      displayName: 'Club Mate',
      teamId: 'team-1',
      nationality: 'TR',
    }),
    buildTestDraftPoolCard({
      cardId: 'wild-1',
      playerId: 'player-wild-1',
      overall: 94,
      displayName: 'Legend ST',
      cardTypeCode: 'ICON',
      cardRarityCode: 'LEGENDARY',
      positions: [{ positionCode: 'ST', isPrimary: true, sortOrder: 0 }],
    }),
    buildTestDraftPoolCard({
      cardId: 'cb-1',
      playerId: 'player-cb-1',
      overall: 85,
      displayName: 'Centre Back',
      positions: [{ positionCode: 'CB', isPrimary: true, sortOrder: 0 }],
    }),
  ];
}
