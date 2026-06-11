import type { Coach } from '../../../coaches/domain/entities/coach.entity';
import type { ChemistryConfig } from '../../../draft/domain/config/default-draft-balance.config';
import type {
  CoachIdentityLink,
  PlayerIdentityLink,
} from '../../../draft/domain/models/chemistry-result';
import type { DraftPoolCard } from '../../../draft/domain/models/draft-pool-card';
import { ChemistryCalculator } from '../../../draft/domain/services/chemistry-calculator.service';

export interface CoachChemistryProjection {
  readonly projectedTeamChemistry: number;
  readonly chemistryBonus: number;
}

export class CoachSelectionChemistryService {
  private readonly calculator: ChemistryCalculator;

  constructor(chemistryConfig: ChemistryConfig) {
    this.calculator = new ChemistryCalculator(chemistryConfig);
  }

  projectForCoach(draftedCards: readonly DraftPoolCard[], coach: Coach): CoachChemistryProjection {
    const rosterLinks = draftedCards.map(toPlayerIdentityLink);
    const baseline = this.calculator.calculateTeamChemistry(rosterLinks).teamChemistry;
    const withCoach = this.calculator.calculateTeamChemistry(
      rosterLinks,
      toCoachIdentityLink(coach),
    ).teamChemistry;

    return {
      projectedTeamChemistry: withCoach,
      chemistryBonus: Math.max(0, withCoach - baseline),
    };
  }
}

function toPlayerIdentityLink(card: DraftPoolCard): PlayerIdentityLink {
  return {
    cardId: card.cardId,
    teamId: card.teamId,
    leagueId: card.leagueId,
    nationality: card.nationality,
  };
}

function toCoachIdentityLink(coach: Coach): CoachIdentityLink {
  return {
    teamId: coach.teamId,
    leagueId: coach.leagueId,
    nationality: coach.nationality,
  };
}
