import type { CoachSelectionStateDto } from '@draft-io/shared-types';

import type { CoachBrowserItem } from '../../../coaches/application/read-models/coach-browser-item';
import { toCoachBrowserItemDto } from '../../../coaches/presentation/mappers/coach-browser-response.mapper';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import { toLobbySummary } from './lobby-response.mapper';

export function toCoachSelectionState(
  lobby: Lobby,
  participant: LobbyParticipant | null,
  myCoachOptions: readonly CoachBrowserItem[],
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
    myCoachOptions: myCoachOptions.map(toCoachBrowserItemDto),
    mySelectedCoachId: participant?.selectedCoachId ?? null,
  };
}
