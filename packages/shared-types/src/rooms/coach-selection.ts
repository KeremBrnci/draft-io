import type { CoachBrowserItemDto } from '../coaches/coach-browser.js';
import type { LobbySummaryDto } from '../lobbies/lobby-summary.js';

import type { ParticipantPhaseStatusDto, RoomPhaseDto } from './room-phase.js';

export interface CoachSelectionOptionDto extends CoachBrowserItemDto {
  readonly projectedTeamChemistry: number;
  readonly chemistryBonus: number;
}

export interface CoachSelectionParticipantDto {
  readonly id: string;
  readonly displayName: string;
  readonly isHost: boolean;
  readonly phaseStatus: ParticipantPhaseStatusDto;
  readonly selectedCoachId: string | null;
}

export interface CoachSelectionStateDto {
  readonly lobby: LobbySummaryDto;
  readonly phase: RoomPhaseDto;
  readonly coachSelectedCount: number;
  readonly allCoachesSelected: boolean;
  readonly participants: readonly CoachSelectionParticipantDto[];
  readonly myCoachOptions: readonly CoachSelectionOptionDto[];
  readonly mySelectedCoachId: string | null;
}

export interface SelectCoachCommandDto {
  readonly sessionToken: string;
  readonly coachId: string;
}
