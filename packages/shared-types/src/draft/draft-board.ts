import type { FormationSummaryDto } from '../formations/formation-summary.js';
import type { RoomPhaseDto } from '../rooms/room-phase.js';

import type { TeamChemistryResultDto } from './chemistry.js';
import type { MatchPowerResultDto } from './match-power.js';

export interface DraftSlotAssignmentDto {
  readonly slotIndex: number;
  readonly cardId: string;
  readonly positionCode: string;
  readonly slotLabel: string;
}

export interface DraftCardFaceDto {
  readonly cardId: string;
  readonly playerId: string;
  readonly cardTypeCode: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly rating: number | null;
  readonly subtitle: string;
  readonly nationalityFlagUrl: string | null;
  readonly nationalityLabel?: string;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
}

export interface DraftSlotStateDto {
  readonly slotIndex: number;
  readonly label: string;
  readonly pitchX: number;
  readonly pitchY: number;
  readonly allowedPositions: readonly string[];
  readonly card: DraftCardFaceDto | null;
}

export interface DraftParticipantReadinessDto {
  readonly participantId: string;
  readonly displayName: string;
  readonly isReady: boolean;
  readonly isRosterComplete: boolean;
}

export interface DraftBoardStateDto {
  readonly lobbyId: string;
  readonly lobbyCode: string;
  readonly phase: RoomPhaseDto;
  readonly formation: FormationSummaryDto;
  readonly slots: readonly DraftSlotStateDto[];
  readonly nextSlotIndex: number | null;
  readonly rosterSize: number;
  readonly pickCount: number;
  readonly teamAverageOverall: number;
  readonly chemistry: TeamChemistryResultDto;
  readonly matchPower: MatchPowerResultDto;
  readonly isRosterComplete: boolean;
  readonly viewerIsReady: boolean;
  readonly readyCount: number;
  readonly participantCount: number;
  readonly participants: readonly DraftParticipantReadinessDto[];
}
