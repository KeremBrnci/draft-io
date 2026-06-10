import { type CalculateTeamStrengthUseCase } from '../../../draft/application/use-cases/calculate-team-strength.use-case';
import type { DraftPoolRepository } from '../../../draft/domain/repositories/draft-pool.repository';
import type { DraftSession } from '../../../draft/domain/repositories/draft-session.repository';
import type { Formation } from '../../../formations/domain/entities/formation.entity';
import type { LobbyParticipant } from '../../../lobbies/domain/entities/lobby-participant.entity';
import type { MatchTeamSnapshot } from '../../../simulation/domain/models/match-simulation.types';

export async function buildParticipantTeamSnapshot(input: {
  readonly participant: LobbyParticipant;
  readonly formation: Formation;
  readonly draftState: DraftSession['participants'][number];
  readonly draftPoolRepository: DraftPoolRepository;
  readonly calculateTeamStrengthUseCase: CalculateTeamStrengthUseCase;
}): Promise<MatchTeamSnapshot> {
  const cards = await input.draftPoolRepository.findByIds(input.draftState.draftedCardIds);
  const cardById = new Map(cards.map((card) => [card.cardId, card]));
  const strength = await input.calculateTeamStrengthUseCase.execute({
    cardIds: input.draftState.draftedCardIds,
  });

  const players = input.draftState.slotAssignments.map((assignment) => {
    const card = cardById.get(assignment.cardId);
    return {
      cardId: assignment.cardId,
      playerId: card?.playerId ?? assignment.cardId,
      displayName: card?.displayName ?? 'Unknown',
      positionCode: assignment.positionCode,
      overall: card?.overall ?? 70,
    };
  });

  return {
    participantId: input.participant.id,
    displayName: input.participant.displayName.value,
    formationCode: input.formation.code.value,
    teamAverageOverall: strength.matchPower.teamAverageOverall,
    teamChemistry: strength.chemistry.teamChemistry,
    matchPower: strength.matchPower.matchPower,
    players,
  };
}
