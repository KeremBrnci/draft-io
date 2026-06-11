import { describe, expect, it } from 'vitest';

import { createParticipantDraftState, swapSlotAssignments } from './participant-draft-state.js';

describe('swapSlotAssignments', () => {
  it('swaps two filled slots and updates deployed positions', () => {
    const state = {
      ...createParticipantDraftState({ participantId: 'p1' }),
      draftedCardIds: ['card-a', 'card-b'],
      pickCount: 2,
      slotAssignments: [
        {
          slotIndex: 1,
          cardId: 'card-a',
          positionCode: 'ST',
          slotLabel: 'ST',
        },
        {
          slotIndex: 2,
          cardId: 'card-b',
          positionCode: 'LW',
          slotLabel: 'LW',
        },
      ],
    };

    const swapped = swapSlotAssignments(state, {
      fromSlotIndex: 1,
      toSlotIndex: 2,
      toSlotMetadata: { positionCode: 'LW', slotLabel: 'LW' },
      fromSlotMetadata: { positionCode: 'ST', slotLabel: 'ST' },
    });

    expect(swapped.slotAssignments).toEqual([
      {
        slotIndex: 2,
        cardId: 'card-a',
        positionCode: 'LW',
        slotLabel: 'LW',
      },
      {
        slotIndex: 1,
        cardId: 'card-b',
        positionCode: 'ST',
        slotLabel: 'ST',
      },
    ]);
  });
});
