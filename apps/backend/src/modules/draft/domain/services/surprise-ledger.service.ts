import type { DraftBalanceConfigDto } from '@draft-io/shared-types';

import type { DraftPoolCard } from '../models/draft-pool-card';
import type { ParticipantDraftState } from '../models/participant-draft-state';

export class SurpriseLedgerService {
  constructor(private readonly config: DraftBalanceConfigDto) {}

  eliteDebtAmount(tierCode: string): number {
    if (tierCode === 'S') {
      return 12;
    }
    if (tierCode === 'A') {
      return 8;
    }
    return 0;
  }

  eliteCreditAmount(): number {
    return 4;
  }

  eliteOfferWeight(state: ParticipantDraftState, tierCode: string): number {
    if (!this.config.eliteTierCodes.includes(tierCode as 'S' | 'A')) {
      return 1;
    }

    let weight = 1;
    weight -= state.surpriseDebt * 0.08;
    weight += state.surpriseCredit * 0.06;
    weight -= state.elitePicksTaken * 0.12;

    return Math.max(0.15, Math.min(1.5, weight));
  }

  shouldOfferWildcard(state: ParticipantDraftState, randomValue: number): boolean {
    const adjustedProbability =
      this.config.wildcardProbability + state.surpriseCredit * 0.01 - state.surpriseDebt * 0.005;

    return randomValue < Math.max(0.02, Math.min(0.2, adjustedProbability));
  }

  accrueLateLuckCredit(
    state: ParticipantDraftState,
    draftedCards: readonly DraftPoolCard[],
  ): ParticipantDraftState {
    if (state.pickCount < Math.floor(this.config.rosterSize / 2)) {
      return state;
    }

    const averageOverall =
      draftedCards.length === 0
        ? 0
        : draftedCards.reduce((sum, card) => sum + card.overall, 0) / draftedCards.length;

    if (averageOverall >= this.config.targetTeamAverageOverall - 1) {
      return state;
    }

    return {
      ...state,
      surpriseCredit: state.surpriseCredit + 1,
    };
  }
}
