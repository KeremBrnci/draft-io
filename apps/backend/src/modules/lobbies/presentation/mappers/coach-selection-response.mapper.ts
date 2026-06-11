import type { CoachSelectionStateDto } from '@draft-io/shared-types';

import type { CoachSelectionOption } from '../../application/read-models/coach-selection-option';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import type { Lobby } from '../../domain/entities/lobby.entity';

import { toLobbySummary } from './lobby-response.mapper';

export function toCoachSelectionState(
  lobby: Lobby,
  participant: LobbyParticipant | null,
  myCoachOptions: readonly CoachSelectionOption[],
): CoachSelectionStateDto {
  return {
    lobby: toLobbySummary(lobby),
    phase: lobby.phase,
    coachSelectedCount: lobby.coachSelectedCount,
    allCoachesSelected: lobby.allCoachesSelected,
    participants: lobby.participants.map((entry) => ({
      id: entry.id,
      displayName: entry.displayName.value,
      isHost: entry.isHost,
      phaseStatus: entry.phaseStatus,
      selectedCoachId: entry.selectedCoachId,
    })),
    myCoachOptions: myCoachOptions.map(toCoachSelectionOptionDto),
    mySelectedCoachId: participant?.selectedCoachId ?? null,
  };
}

function toCoachSelectionOptionDto(option: CoachSelectionOption) {
  return {
    id: option.id,
    displayName: option.displayName,
    imageUrl: option.imageUrl,
    role: option.role,
    nationality: option.nationality,
    nationalityFlagUrl: option.nationalityFlagUrl,
    age: option.age,
    appointedDate: option.appointedDate,
    contractExpires: option.contractExpires,
    teamId: option.teamId,
    teamName: option.teamName,
    teamLogoUrl: option.teamLogoUrl,
    leagueId: option.leagueId,
    leagueName: option.leagueName,
    leagueLogoUrl: option.leagueLogoUrl,
    projectedTeamChemistry: option.projectedTeamChemistry,
    chemistryBonus: option.chemistryBonus,
  };
}
