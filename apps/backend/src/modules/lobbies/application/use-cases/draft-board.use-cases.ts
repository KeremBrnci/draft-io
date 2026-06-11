import type { DraftCardFaceDto, DraftPickOptionsDto } from '@draft-io/shared-types';

import { type ApplyDraftPickUseCase } from '../../../draft/application/use-cases/apply-draft-pick.use-case';
import { type CalculateTeamStrengthUseCase } from '../../../draft/application/use-cases/calculate-team-strength.use-case';
import { type GeneratePickOptionsUseCase } from '../../../draft/application/use-cases/generate-pick-options.use-case';
import { type GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { InvalidDraftPickError } from '../../../draft/domain/errors/draft.errors';
import {
  findNextEmptySlotIndex,
  picksRemaining,
} from '../../../draft/domain/models/participant-draft-state';
import type { DraftPoolRepository } from '../../../draft/domain/repositories/draft-pool.repository';
import { toDraftCardFace } from '../../../draft/infrastructure/mappers/draft-card-face.mapper';
import type { Formation } from '../../../formations/domain/entities/formation.entity';
import type { FormationRepository } from '../../../formations/domain/repositories/formation.repository';
import { computePitchCoordinates } from '../../../formations/domain/services/formation-pitch-layout.service';
import type { CheckDraftCompletionUseCase } from '../../../matches/application/use-cases/room-league.use-cases';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import type { Lobby } from '../../domain/entities/lobby.entity';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import { InvalidLobbySessionError, LobbyNotFoundError } from '../../domain/errors/lobby.errors';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';

export interface DraftBoardQuery {
  readonly code: string;
  readonly sessionToken: string;
}

export interface DraftBoardState {
  readonly lobby: Lobby;
  readonly participant: LobbyParticipant;
  readonly formation: Formation;
  readonly draftedCardIds: readonly string[];
  readonly slotAssignments: readonly {
    readonly slotIndex: number;
    readonly cardId: string;
    readonly positionCode: string;
    readonly slotLabel: string;
  }[];
  readonly rosterSize: number;
  readonly pickCount: number;
  readonly nextSlotIndex: number | null;
  readonly teamAverageOverall: number;
  readonly chemistry: Awaited<ReturnType<CalculateTeamStrengthUseCase['execute']>>['chemistry'];
  readonly matchPower: Awaited<ReturnType<CalculateTeamStrengthUseCase['execute']>>['matchPower'];
  readonly cardFacesById: ReadonlyMap<string, DraftCardFaceDto>;
  readonly participantReadiness: readonly {
    readonly participantId: string;
    readonly displayName: string;
    readonly isReady: boolean;
    readonly isRosterComplete: boolean;
  }[];
}

export class GetDraftBoardUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly draftPoolRepository: DraftPoolRepository,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly calculateTeamStrengthUseCase: CalculateTeamStrengthUseCase,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: DraftBoardQuery): Promise<DraftBoardState> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(query.code));
    if (lobby.phase !== RoomPhase.DRAFT) {
      throw new InvalidDraftPickError('Lobby is not in draft phase');
    }

    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(query.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    if (participant.selectedFormationId === null) {
      throw new InvalidDraftPickError('Participant has no selected formation');
    }

    const formation = await this.formationRepository.findById(participant.selectedFormationId);
    if (formation === null) {
      throw new LobbyNotFoundError(participant.selectedFormationId);
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      throw new InvalidDraftPickError('Draft session not found');
    }

    const draftState = session.participants.find((entry) => entry.participantId === participant.id);
    if (draftState === undefined) {
      throw new InvalidDraftPickError('Participant draft state not found');
    }

    const draftedCards = await this.draftPoolRepository.findByIds(draftState.draftedCardIds);
    const cardFacesById = new Map(
      draftedCards.map((card) => {
        const assignment = draftState.slotAssignments.find((entry) => entry.cardId === card.cardId);
        const positionCode = assignment?.positionCode ?? card.positions[0]?.positionCode ?? 'CM';
        return [card.cardId, toDraftCardFace(card, positionCode)];
      }),
    );

    const strength =
      draftState.draftedCardIds.length === 0
        ? {
            chemistry: {
              teamChemistry: 0,
              breakdown: { club: 0, nation: 0, league: 0 },
              players: [],
            },
            matchPower: {
              teamAverageOverall: 0,
              teamChemistry: 0,
              chemistryMultiplier: 1,
              matchPower: 0,
            },
          }
        : await this.calculateTeamStrengthUseCase.execute({
            cardIds: draftState.draftedCardIds,
            coachId: participant.selectedCoachId,
          });

    const slotIndexes = formation.slots.map((slot) => slot.index);
    const nextSlotIndex = findNextEmptySlotIndex(slotIndexes, draftState.slotAssignments);

    const participantReadiness = lobby.participants.map((entry) => {
      const entryDraftState = session.participants.find(
        (state) => state.participantId === entry.id,
      );
      const isRosterComplete =
        entryDraftState !== undefined && picksRemaining(entryDraftState, session.rosterSize) <= 0;

      return {
        participantId: entry.id,
        displayName: entry.displayName.value,
        isReady: entry.isReady,
        isRosterComplete,
      };
    });

    return {
      lobby,
      participant,
      formation,
      draftedCardIds: draftState.draftedCardIds,
      slotAssignments: draftState.slotAssignments,
      rosterSize: session.rosterSize,
      pickCount: draftState.pickCount,
      nextSlotIndex,
      teamAverageOverall: strength.matchPower.teamAverageOverall,
      chemistry: strength.chemistry,
      matchPower: strength.matchPower,
      cardFacesById,
      participantReadiness,
    };
  }
}

export interface DraftPickOptionsForSlotQuery {
  readonly code: string;
  readonly sessionToken: string;
  readonly slotIndex: number;
}

export class GetDraftPickOptionsForSlotUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly generatePickOptionsUseCase: GeneratePickOptionsUseCase,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: DraftPickOptionsForSlotQuery): Promise<DraftPickOptionsDto> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(query.code));
    if (lobby.phase !== RoomPhase.DRAFT) {
      throw new InvalidDraftPickError('Lobby is not in draft phase');
    }

    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(query.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    if (participant.selectedFormationId === null) {
      throw new InvalidDraftPickError('Participant has no selected formation');
    }

    const formation = await this.formationRepository.findById(participant.selectedFormationId);
    if (formation === null) {
      throw new LobbyNotFoundError(participant.selectedFormationId);
    }

    const slot = formation.slots.find((entry) => entry.index === query.slotIndex);
    if (slot === undefined) {
      throw new InvalidDraftPickError('Invalid formation slot');
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      throw new InvalidDraftPickError('Draft session not found');
    }

    const draftState = session.participants.find((entry) => entry.participantId === participant.id);
    if (draftState === undefined) {
      throw new InvalidDraftPickError('Participant draft state not found');
    }

    const alreadyFilled = draftState.slotAssignments.some(
      (assignment) => assignment.slotIndex === query.slotIndex,
    );
    if (alreadyFilled) {
      throw new InvalidDraftPickError('Formation slot is already filled');
    }

    const positionCode = slot.label;
    const positionCodes =
      slot.allowedPositions.length > 0 ? [...slot.allowedPositions] : [positionCode];
    const result = await this.generatePickOptionsUseCase.execute({
      lobbyId: lobby.id.value,
      participantId: participant.id,
      positionCode,
      positionCodes,
    });

    const cardById = new Map(result.optionCards.map((card) => [card.cardId, card]));

    return {
      positionCode: result.positionCode,
      participantId: result.participantId,
      options: result.options.map((option) => {
        const card = cardById.get(option.cardId);
        const fallbackCard = {
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
          teamName: null,
          teamLogoUrl: null,
          leagueName: null,
          leagueLogoUrl: null,
        };
        return {
          cardId: option.cardId,
          playerId: option.playerId,
          displayName: option.displayName,
          overall: option.overall,
          tierCode: option.tierCode,
          cardTypeCode: option.cardTypeCode,
          cardRarityCode: option.cardRarityCode,
          kind: option.kind,
          projectedChemistry: option.projectedChemistry,
          positionWeight: option.positionWeight,
          isWildcard: option.isWildcard,
          face: toDraftCardFace(card ?? fallbackCard, positionCode),
        };
      }),
      picksRemaining: result.picksRemaining,
    };
  }
}

export interface ApplyLobbyDraftPickCommand {
  readonly code: string;
  readonly sessionToken: string;
  readonly slotIndex: number;
  readonly cardId: string;
}

export class ApplyLobbyDraftPickUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly applyDraftPickUseCase: ApplyDraftPickUseCase,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly checkDraftCompletionUseCase: CheckDraftCompletionUseCase,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: ApplyLobbyDraftPickCommand): Promise<void> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    if (lobby.phase !== RoomPhase.DRAFT) {
      throw new InvalidDraftPickError('Lobby is not in draft phase');
    }

    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(command.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    if (participant.selectedFormationId === null) {
      throw new InvalidDraftPickError('Participant has no selected formation');
    }

    const formation = await this.formationRepository.findById(participant.selectedFormationId);
    if (formation === null) {
      throw new LobbyNotFoundError(participant.selectedFormationId);
    }

    const slot = formation.slots.find((entry) => entry.index === command.slotIndex);
    if (slot === undefined) {
      throw new InvalidDraftPickError('Invalid formation slot');
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      throw new InvalidDraftPickError('Draft session not found');
    }

    const draftState = session.participants.find((entry) => entry.participantId === participant.id);
    if (draftState === undefined) {
      throw new InvalidDraftPickError('Participant draft state not found');
    }

    if (
      draftState.slotAssignments.some((assignment) => assignment.slotIndex === command.slotIndex)
    ) {
      throw new InvalidDraftPickError('Formation slot is already filled');
    }

    if (picksRemaining(draftState, session.rosterSize) <= 0) {
      throw new InvalidDraftPickError('Roster is already full');
    }

    const positionCode = slot.label;
    const positionCodes =
      slot.allowedPositions.length > 0 ? [...slot.allowedPositions] : [positionCode];
    await this.applyDraftPickUseCase.execute({
      lobbyId: lobby.id.value,
      participantId: participant.id,
      cardId: command.cardId,
      positionCode,
      positionCodes,
      slotAssignment: {
        slotIndex: command.slotIndex,
        slotLabel: slot.label,
      },
    });

    await this.checkDraftCompletionUseCase.execute({ code: command.code });
  }
}

export function buildDraftBoardSlots(
  formation: Formation,
  assignments: DraftBoardState['slotAssignments'],
  cardFacesById: ReadonlyMap<string, DraftCardFaceDto>,
) {
  return formation.slots.map((slot) => {
    const coordinates = computePitchCoordinates(formation.code.value, slot.index, slot.label);
    const assignment = assignments.find((entry) => entry.slotIndex === slot.index);
    return {
      slotIndex: slot.index,
      label: slot.label,
      pitchX: coordinates.pitchX,
      pitchY: coordinates.pitchY,
      allowedPositions: [...slot.allowedPositions],
      card: assignment === undefined ? null : (cardFacesById.get(assignment.cardId) ?? null),
    };
  });
}
