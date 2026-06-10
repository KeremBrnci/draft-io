import { describe, expect, it } from 'vitest';

import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../../domain/config/default-draft-balance.config';
import { PickOptionGenerator } from '../../domain/services/pick-option-generator.service';
import { SeededRandomSource } from '../../infrastructure/random/seeded-random-source';
import {
  buildTestDraftPoolCard,
  buildTestParticipantState,
  buildTestPool,
} from '../../testing/draft-test.factory';

describe('PickOptionGenerator', () => {
  it('generates five distinct option kinds when pool allows', () => {
    const generator = new PickOptionGenerator(
      DEFAULT_DRAFT_BALANCE_CONFIG,
      new SeededRandomSource(7),
    );
    const options = generator.generate({
      positionCode: 'CM',
      participantState: buildTestParticipantState(),
      pool: buildTestPool(),
      draftedRoster: [],
    });

    expect(options.length).toBe(5);
    expect(new Set(options.map((option) => option.cardId)).size).toBe(5);
    expect(new Set(options.map((option) => option.playerId)).size).toBe(5);

    const kinds = new Set(options.map((option) => option.kind));
    expect(kinds.has('STRONG')).toBe(true);
    expect(kinds.has('MEDIUM')).toBe(true);
    expect(kinds.has('RISKY')).toBe(true);
    expect(kinds.has('CHEMISTRY')).toBe(true);
  });

  it('reduces elite exposure after surprise debt accrues', () => {
    const random = new SeededRandomSource(99);
    const generator = new PickOptionGenerator(DEFAULT_DRAFT_BALANCE_CONFIG, random);
    const state = buildTestParticipantState({
      surpriseDebt: 20,
      elitePicksTaken: 2,
    });

    const options = generator.generate({
      positionCode: 'CM',
      participantState: state,
      pool: buildTestPool(),
      draftedRoster: [],
    });

    const eliteOptions = options.filter(
      (option) => option.tierCode === 'S' || option.tierCode === 'A',
    );
    expect(eliteOptions.length).toBeLessThanOrEqual(2);
  });

  it('never offers the same player twice in one pick screen', () => {
    const generator = new PickOptionGenerator(
      DEFAULT_DRAFT_BALANCE_CONFIG,
      new SeededRandomSource(11),
    );
    const pool = [
      ...buildTestPool(),
      buildTestDraftPoolCard({
        cardId: 'dup-card-2',
        playerId: 'player-s-1',
        overall: 88,
        displayName: 'Duplicate Player Alt Card',
      }),
    ];

    const options = generator.generate({
      positionCode: 'CM',
      participantState: buildTestParticipantState(),
      pool,
      draftedRoster: [],
    });

    expect(new Set(options.map((option) => option.playerId)).size).toBe(options.length);
  });

  it('excludes players already on the drafted roster', () => {
    const draftedPlayer = buildTestDraftPoolCard({
      cardId: 'drafted-1',
      playerId: 'drafted-player',
      overall: 90,
      displayName: 'Already Drafted',
    });
    const alternateCard = buildTestDraftPoolCard({
      cardId: 'drafted-1-alt',
      playerId: 'drafted-player',
      overall: 90,
      displayName: 'Already Drafted Alt',
    });
    const generator = new PickOptionGenerator(
      DEFAULT_DRAFT_BALANCE_CONFIG,
      new SeededRandomSource(3),
    );

    const options = generator.generate({
      positionCode: 'CM',
      participantState: buildTestParticipantState({
        draftedCardIds: [draftedPlayer.cardId],
        pickCount: 1,
      }),
      pool: [...buildTestPool(), alternateCard],
      draftedRoster: [draftedPlayer],
    });

    expect(options.every((option) => option.playerId !== draftedPlayer.playerId)).toBe(true);
  });

  it('offers LW players when drafting an LM slot', () => {
    const generator = new PickOptionGenerator(
      DEFAULT_DRAFT_BALANCE_CONFIG,
      new SeededRandomSource(5),
    );
    const pool = [
      buildTestDraftPoolCard({
        cardId: 'lw-1',
        playerId: 'player-lw-1',
        overall: 86,
        displayName: 'Left Winger',
        positions: [{ positionCode: 'LW', isPrimary: true, sortOrder: 0 }],
      }),
      buildTestDraftPoolCard({
        cardId: 'lw-2',
        playerId: 'player-lw-2',
        overall: 83,
        displayName: 'Wide Left',
        positions: [{ positionCode: 'LW', isPrimary: true, sortOrder: 0 }],
      }),
      buildTestDraftPoolCard({
        cardId: 'lw-3',
        playerId: 'player-lw-3',
        overall: 80,
        displayName: 'Left Wide',
        positions: [{ positionCode: 'LW', isPrimary: true, sortOrder: 0 }],
      }),
      buildTestDraftPoolCard({
        cardId: 'lw-4',
        playerId: 'player-lw-4',
        overall: 78,
        displayName: 'LM Wide',
        positions: [{ positionCode: 'LW', isPrimary: true, sortOrder: 0 }],
      }),
      buildTestDraftPoolCard({
        cardId: 'lw-5',
        playerId: 'player-lw-5',
        overall: 76,
        displayName: 'Bench Wide',
        positions: [{ positionCode: 'LW', isPrimary: true, sortOrder: 0 }],
      }),
    ];

    const options = generator.generate({
      positionCode: 'LM',
      eligiblePositionCodes: ['LM', 'LW'],
      participantState: buildTestParticipantState(),
      pool,
      draftedRoster: [],
    });

    expect(options.length).toBeGreaterThan(0);
    expect(options.every((option) => pool.some((card) => card.cardId === option.cardId))).toBe(
      true,
    );
  });
});
