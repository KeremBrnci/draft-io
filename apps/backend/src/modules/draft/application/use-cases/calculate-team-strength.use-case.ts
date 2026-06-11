import type { CoachRepository } from '../../../coaches/domain/repositories/coach.repository';
import { CoachId } from '../../../coaches/domain/value-objects/coach-id.vo';
import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../../domain/config/default-draft-balance.config';
import type { TeamChemistryResult } from '../../domain/models/chemistry-result';
import type { MatchPowerResult } from '../../domain/models/match-power-result';
import type { DraftPoolRepository } from '../../domain/repositories/draft-pool.repository';
import { ChemistryCalculator } from '../../domain/services/chemistry-calculator.service';
import { MatchPowerCalculator } from '../../domain/services/match-power-calculator.service';
import type { CalculateTeamStrengthCommand } from '../commands/draft-balance.commands';

export interface TeamStrengthResult {
  readonly chemistry: TeamChemistryResult;
  readonly matchPower: MatchPowerResult;
}

export class CalculateTeamStrengthUseCase {
  constructor(
    private readonly draftPoolRepository: DraftPoolRepository,
    private readonly coachRepository: CoachRepository,
  ) {}

  async execute(command: CalculateTeamStrengthCommand): Promise<TeamStrengthResult> {
    const cards = await this.draftPoolRepository.findByIds(command.cardIds);
    const config = DEFAULT_DRAFT_BALANCE_CONFIG;

    const identityLinks = cards.map((card) => ({
      cardId: card.cardId,
      teamId: card.teamId,
      leagueId: card.leagueId,
      nationality: card.nationality,
    }));

    const coach =
      command.coachId !== undefined && command.coachId !== null
        ? await this.coachRepository.findById(CoachId.create(command.coachId))
        : null;

    const chemistryCalculator = new ChemistryCalculator(config.chemistry);
    const chemistry = chemistryCalculator.calculateTeamChemistry(
      identityLinks,
      coach === null
        ? null
        : {
            teamId: coach.teamId,
            leagueId: coach.leagueId,
            nationality: coach.nationality,
          },
    );

    const teamAverageOverall =
      cards.length === 0 ? 0 : cards.reduce((sum, card) => sum + card.overall, 0) / cards.length;

    const matchPowerCalculator = new MatchPowerCalculator(config.matchPower);
    const matchPower = matchPowerCalculator.calculate(teamAverageOverall, chemistry.teamChemistry);

    return { chemistry, matchPower };
  }
}
