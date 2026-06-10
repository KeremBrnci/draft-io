import type { FormationSummaryDto } from '../formations/formation-summary.js';
import type { LobbySummaryDto } from '../lobbies/lobby-summary.js';

import type { ParticipantPhaseStatusDto, RoomPhaseDto } from './room-phase.js';

export interface FormationSelectionParticipantDto {
  readonly id: string;
  readonly displayName: string;
  readonly isHost: boolean;
  readonly phaseStatus: ParticipantPhaseStatusDto;
  readonly selectedFormationId: string | null;
}

export interface FormationSelectionStateDto {
  readonly lobby: LobbySummaryDto;
  readonly phase: RoomPhaseDto;
  readonly formationSelectionStartedAt: string | null;
  readonly formationSelectionDeadline: string | null;
  readonly formationSelectedCount: number;
  readonly allFormationsSelected: boolean;
  readonly participants: readonly FormationSelectionParticipantDto[];
  readonly myFormationOptions: readonly FormationSummaryDto[];
  readonly mySelectedFormationId: string | null;
  readonly canStartDraft: boolean;
}

export interface SelectFormationCommandDto {
  readonly sessionToken: string;
  readonly formationId: string;
}

export interface StartFormationSelectionResultDto {
  readonly lobby: LobbySummaryDto;
}

export interface StartDraftResultDto {
  readonly lobby: LobbySummaryDto;
  readonly draftSessionId: string;
}
