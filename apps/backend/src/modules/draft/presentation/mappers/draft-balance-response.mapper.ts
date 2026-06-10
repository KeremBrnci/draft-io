import type {
  DraftFairnessSimulationResultDto,
  DraftPickOptionsDto,
  DraftSessionSummaryDto,
  MatchPowerResultDto,
  ParticipantDraftStateDto,
  TeamChemistryResultDto,
} from '@draft-io/shared-types';

import type { TeamStrengthResult } from '../../application/use-cases/calculate-team-strength.use-case';
import type { DraftPickOptionsResult } from '../../domain/models/draft-pick-option';
import { remainingBudget } from '../../domain/models/participant-draft-state';
import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import { toDraftCardFace } from '../../infrastructure/mappers/draft-card-face.mapper';

export function toParticipantDraftStateDto(
  participant: DraftSession['participants'][number],
): ParticipantDraftStateDto {
  return {
    participantId: participant.participantId,
    powerBudget: participant.powerBudget,
    spentBudget: participant.spentBudget,
    remainingBudget: remainingBudget(participant),
    surpriseDebt: participant.surpriseDebt,
    surpriseCredit: participant.surpriseCredit,
    elitePicksTaken: participant.elitePicksTaken,
    draftedCardIds: participant.draftedCardIds,
    slotAssignments: participant.slotAssignments.map((assignment) => ({
      slotIndex: assignment.slotIndex,
      cardId: assignment.cardId,
      positionCode: assignment.positionCode,
      slotLabel: assignment.slotLabel,
    })),
    pickCount: participant.pickCount,
  };
}

export function toDraftSessionSummaryDto(session: DraftSession): DraftSessionSummaryDto {
  return {
    id: session.id,
    lobbyId: session.lobbyId,
    status: session.status,
    rosterSize: session.rosterSize,
    participants: session.participants.map(toParticipantDraftStateDto),
  };
}

export function toDraftPickOptionsDto(result: DraftPickOptionsResult): DraftPickOptionsDto {
  return {
    positionCode: result.positionCode,
    participantId: result.participantId,
    options: result.options.map((option) => ({
      cardId: option.cardId,
      playerId: option.playerId,
      displayName: option.displayName,
      overall: option.overall,
      tierCode: option.tierCode,
      cardTypeCode: option.cardTypeCode,
      cardRarityCode: option.cardRarityCode,
      kind: option.kind,
      pickCost: option.pickCost,
      projectedChemistry: option.projectedChemistry,
      positionWeight: option.positionWeight,
      isWildcard: option.isWildcard,
      face: toDraftCardFace(
        {
          cardId: option.cardId,
          playerId: option.playerId,
          displayName: option.displayName,
          overall: option.overall,
          cardTypeCode: option.cardTypeCode,
          cardRarityCode: option.cardRarityCode,
          positions: [],
          teamId: null,
          leagueId: null,
          nationality: '',
          imageUrl: null,
          nationalityFlagUrl: null,
          leagueName: null,
          leagueLogoUrl: null,
        },
        result.positionCode,
      ),
    })),
    remainingBudget: result.remainingBudget,
    picksRemaining: result.picksRemaining,
  };
}

export function toTeamStrengthDto(result: TeamStrengthResult): {
  chemistry: TeamChemistryResultDto;
  matchPower: MatchPowerResultDto;
} {
  return {
    chemistry: {
      teamChemistry: result.chemistry.teamChemistry,
      breakdown: result.chemistry.breakdown,
      players: result.chemistry.players.map((player) => ({
        cardId: player.cardId,
        chemistry: player.chemistry,
        sources: player.sources,
      })),
    },
    matchPower: {
      teamAverageOverall: result.matchPower.teamAverageOverall,
      teamChemistry: result.matchPower.teamChemistry,
      chemistryMultiplier: result.matchPower.chemistryMultiplier,
      matchPower: result.matchPower.matchPower,
    },
  };
}

export function toSimulationResultDto(
  result: DraftFairnessSimulationResultDto,
): DraftFairnessSimulationResultDto {
  return result;
}
