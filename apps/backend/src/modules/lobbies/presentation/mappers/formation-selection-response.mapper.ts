import type { FormationSelectionStateDto } from '@draft-io/shared-types';

import type { Formation } from '../../../formations/domain/entities/formation.entity';
import { computePitchCoordinates } from '../../../formations/domain/services/formation-pitch-layout.service';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import { toLobbySummary } from './lobby-response.mapper';

export function toFormationSummaryDto(formation: Formation) {
  return {
    id: formation.id,
    code: formation.code.value,
    slots: formation.slots.map((slot) => {
      const coordinates = computePitchCoordinates(formation.code.value, slot.index, slot.label);
      return {
        index: slot.index,
        label: slot.label,
        allowedPositions: [...slot.allowedPositions],
        pitchX: coordinates.pitchX,
        pitchY: coordinates.pitchY,
      };
    }),
  };
}

export function toFormationSelectionState(
  lobby: Lobby,
  participant: LobbyParticipant | null,
  myFormationOptions: readonly Formation[],
  canStartDraft: boolean,
): FormationSelectionStateDto {
  return {
    lobby: toLobbySummary(lobby),
    phase: lobby.phase,
    formationSelectionStartedAt: lobby.formationSelectionStartedAt?.toISOString() ?? null,
    formationSelectionDeadline: lobby.formationSelectionDeadline?.toISOString() ?? null,
    formationSelectedCount: lobby.formationSelectedCount,
    allFormationsSelected: lobby.allFormationsSelected,
    participants: lobby.participants.map((entry) => ({
      id: entry.id,
      displayName: entry.displayName.value,
      isHost: entry.isHost,
      phaseStatus: entry.phaseStatus,
      selectedFormationId: entry.selectedFormationId,
    })),
    myFormationOptions: myFormationOptions.map(toFormationSummaryDto),
    mySelectedFormationId: participant?.selectedFormationId ?? null,
    canStartDraft,
  };
}
