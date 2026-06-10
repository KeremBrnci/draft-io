import type { DraftBoardStateDto } from '@draft-io/shared-types';

import { toFormationSummaryDto } from './formation-selection-response.mapper';
import { toTeamStrengthDto } from '../../../draft/presentation/mappers/draft-balance-response.mapper';
import type { DraftBoardState } from '../../application/use-cases/draft-board.use-cases';
import { buildDraftBoardSlots } from '../../application/use-cases/draft-board.use-cases';

export function toDraftBoardStateDto(state: DraftBoardState): DraftBoardStateDto {
  const strength = toTeamStrengthDto({
    chemistry: state.chemistry,
    matchPower: state.matchPower,
  });

  return {
    lobbyId: state.lobby.id.value,
    lobbyCode: state.lobby.code.value,
    phase: state.lobby.phase,
    formation: toFormationSummaryDto(state.formation),
    slots: buildDraftBoardSlots(state.formation, state.slotAssignments, state.cardFacesById),
    nextSlotIndex: state.nextSlotIndex,
    rosterSize: state.rosterSize,
    pickCount: state.pickCount,
    remainingBudget: state.remainingBudget,
    teamAverageOverall: state.teamAverageOverall,
    chemistry: strength.chemistry,
    matchPower: strength.matchPower,
    isRosterComplete: state.pickCount >= state.rosterSize,
    viewerIsReady: state.participant.isReady,
    readyCount: state.lobby.readyCount,
    participantCount: state.lobby.participants.length,
    participants: state.participantReadiness,
  };
}
