import type { RoomLeagueStateDto, TeamReviewStateDto } from '@draft-io/shared-types';

import type { Coach } from '../../../coaches/domain/entities/coach.entity';
import type { CoachRepository } from '../../../coaches/domain/repositories/coach.repository';
import { CoachId } from '../../../coaches/domain/value-objects/coach-id.vo';
import { type CalculateTeamStrengthUseCase } from '../../../draft/application/use-cases/calculate-team-strength.use-case';
import { type GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { picksRemaining } from '../../../draft/domain/models/participant-draft-state';
import type { FormationRepository } from '../../../formations/domain/repositories/formation.repository';
import { LobbyLifecycleService } from '../../../lobbies/application/services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../../../lobbies/application/services/room-events.publisher';
import { RoomPhase } from '../../../lobbies/domain/enums/room-phase.enum';
import {
  InvalidLobbySessionError,
  LobbyNotFoundError,
} from '../../../lobbies/domain/errors/lobby.errors';
import { RoomEventName } from '../../../lobbies/domain/events/room.events';
import type { LobbyRepository } from '../../../lobbies/domain/repositories/lobby.repository';
import {
  COACH_POOL_SIZE,
  CoachPoolService,
  shuffleDeterministic,
} from '../../../lobbies/domain/services/coach-pool.service';
import { LobbyCode } from '../../../lobbies/domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../../lobbies/domain/value-objects/session-token.vo';
import type { RoomLeagueRepository } from '../../domain/repositories/room-league.repository';
import {
  toRoomLeagueStateDto,
  toTeamReviewStateDto,
} from '../../presentation/mappers/room-league-response.mapper';
import type { MatchPlaybackPort } from '../ports/match-playback.port';
export class GetTeamReviewUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly coachRepository: CoachRepository,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly calculateTeamStrengthUseCase: CalculateTeamStrengthUseCase,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: {
    readonly code: string;
    readonly sessionToken: string;
  }): Promise<TeamReviewStateDto> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(query.code));
    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(query.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      throw new LobbyNotFoundError(lobby.id.value);
    }

    const entries = await Promise.all(
      lobby.participants.map(async (entry) => {
        const draftState = session.participants.find((state) => state.participantId === entry.id);
        const formationId = entry.selectedFormationId;
        if (draftState === undefined || formationId === null) {
          return {
            participantId: entry.id,
            displayName: entry.displayName.value,
            formationCode: '—',
            teamAverageOverall: 0,
            teamChemistry: 0,
            matchPower: 0,
            isRosterComplete: false,
            selectedCoachName: null,
          };
        }

        const formation = await this.formationRepository.findById(formationId);
        const strength =
          draftState.draftedCardIds.length === 0
            ? {
                matchPower: { teamAverageOverall: 0, matchPower: 0 },
                chemistry: { teamChemistry: 0 },
              }
            : await this.calculateTeamStrengthUseCase.execute({
                cardIds: draftState.draftedCardIds,
                coachId: entry.selectedCoachId,
              });

        return {
          participantId: entry.id,
          displayName: entry.displayName.value,
          formationCode: formation?.code.value ?? '—',
          teamAverageOverall: strength.matchPower.teamAverageOverall,
          teamChemistry: strength.chemistry.teamChemistry,
          matchPower: strength.matchPower.matchPower,
          isRosterComplete: picksRemaining(draftState, session.rosterSize) <= 0,
          selectedCoachName: null,
        };
      }),
    );

    const coachNames = await this.resolveCoachNames(lobby);
    const enrichedEntries = entries.map((entry) => ({
      ...entry,
      selectedCoachName: coachNames.get(entry.participantId) ?? null,
    }));

    return toTeamReviewStateDto(lobby, enrichedEntries, {
      viewerIsHost: participant.isHost,
    });
  }

  private async resolveCoachNames(
    lobby: Awaited<ReturnType<LobbyLifecycleService['requireActiveLobby']>>,
  ): Promise<Map<string, string>> {
    const names = new Map<string, string>();
    await Promise.all(
      lobby.participants.map(async (entry) => {
        if (entry.selectedCoachId === null) {
          return;
        }

        const coach = await this.coachRepository.findById(CoachId.create(entry.selectedCoachId));
        if (coach !== null) {
          names.set(entry.id, coach.displayName);
        }
      }),
    );

    return names;
  }
}

export class StartLeagueUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly roomLeagueRepository: RoomLeagueRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: {
    readonly code: string;
    readonly sessionToken: string;
  }): Promise<RoomLeagueStateDto> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    lobby.startMatches(SessionToken.reconstitute(command.sessionToken));
    await this.lobbyRepository.save(lobby);

    let league = await this.roomLeagueRepository.findByLobbyId(lobby.id.value);
    if (league === null) {
      const participantNames = new Map(
        lobby.participants.map((participant) => [participant.id, participant.displayName.value]),
      );
      league = await this.roomLeagueRepository.createLeague({
        lobbyId: lobby.id.value,
        participantIds: lobby.participants.map((participant) => participant.id),
        participantNames,
      });
    }

    await this.roomLeagueRepository.updateLeagueStatus(league.id, 'IN_PROGRESS');

    await this.roomEventsPublisher.publish(command.code, RoomEventName.LEAGUE_READY, {
      lobbyCode: command.code,
      phase: RoomPhase.MATCHES,
    });

    const fixtures = await this.roomLeagueRepository.listFixtures(league.id);
    const standings = await this.roomLeagueRepository.listStandings(league.id);
    const currentMatch = await this.roomLeagueRepository.findCurrentMatch(league.id);
    const completedMatchCount = await this.roomLeagueRepository.countCompletedMatches(league.id);

    return toRoomLeagueStateDto({
      league,
      lobbyCode: command.code,
      fixtures,
      standings,
      currentMatch,
      completedMatchCount,
      participantNames: new Map(standings.map((row) => [row.participantId, row.displayName])),
    });
  }
}

export class GetLeagueStateUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly roomLeagueRepository: RoomLeagueRepository,
    private readonly matchPlayback: MatchPlaybackPort,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: { readonly code: string }): Promise<RoomLeagueStateDto> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(query.code));
    const league = await this.roomLeagueRepository.findByLobbyId(lobby.id.value);
    if (league === null) {
      throw new LobbyNotFoundError(lobby.id.value);
    }

    const fixtures = await this.roomLeagueRepository.listFixtures(league.id);
    const standings = await this.roomLeagueRepository.listStandings(league.id);
    let currentMatch = await this.roomLeagueRepository.findCurrentMatch(league.id);

    if (currentMatch !== null) {
      await this.matchPlayback.ensurePlaybackRunning({
        matchId: currentMatch.id,
        leagueId: league.id,
        lobbyCode: query.code,
        status: currentMatch.status,
      });
      currentMatch = await this.roomLeagueRepository.findCurrentMatch(league.id);
    }
    const completedMatchCount = await this.roomLeagueRepository.countCompletedMatches(league.id);
    const currentMatchEvents =
      currentMatch === null
        ? []
        : await this.roomLeagueRepository.listMatchEvents(currentMatch.id, true);
    const currentMatchStatistics =
      currentMatch === null
        ? null
        : await this.roomLeagueRepository.findMatchStatistics(currentMatch.id);

    return toRoomLeagueStateDto({
      league,
      lobbyCode: query.code,
      fixtures,
      standings,
      currentMatch,
      completedMatchCount,
      participantNames: new Map(standings.map((row) => [row.participantId, row.displayName])),
      currentMatchEvents,
      currentMatchStatistics,
    });
  }
}

export class GetMatchStateUseCase {
  constructor(private readonly roomLeagueRepository: RoomLeagueRepository) {}

  async execute(query: { readonly matchId: string }) {
    const match = await this.roomLeagueRepository.findMatchById(query.matchId);
    if (match === null) {
      throw new LobbyNotFoundError(query.matchId);
    }

    const events = await this.roomLeagueRepository.listMatchEvents(query.matchId, true);
    const statistics = await this.roomLeagueRepository.findMatchStatistics(query.matchId);
    return { match, events, statistics };
  }
}

export class CheckDraftCompletionUseCase {
  private readonly lifecycle: LobbyLifecycleService;
  private readonly coachPoolService = new CoachPoolService();

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly coachRepository: CoachRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: { readonly code: string }): Promise<boolean> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    if (lobby.phase !== RoomPhase.DRAFT) {
      return false;
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      return false;
    }

    const allComplete = session.participants.every(
      (participant) => picksRemaining(participant, session.rosterSize) <= 0,
    );
    if (!allComplete || !lobby.allParticipantsReady) {
      return false;
    }

    const poolEntropy = `${lobby.id.value}:${Date.now()}:${Math.random()}`;
    const coachCatalog = shuffleDeterministic(
      (await this.loadCoachCatalog(lobby.draftLeagueIds)).map((coach) => ({
        id: coach.id.value,
      })),
      `${poolEntropy}:catalog`,
    );
    const pools = this.coachPoolService.assignPersonalPools(
      lobby.id.value,
      lobby.participants.map((participant) => participant.id),
      coachCatalog,
      poolEntropy,
    );

    lobby.advanceToCoachSelection(pools);
    await this.lobbyRepository.save(lobby);

    await this.roomEventsPublisher.publish(command.code, RoomEventName.DRAFT_COMPLETE, {
      lobbyCode: command.code,
      phase: RoomPhase.COACH_SELECTION,
    });
    await this.roomEventsPublisher.publish(command.code, RoomEventName.COACH_SELECTION_STARTED, {
      lobbyCode: command.code,
      phase: RoomPhase.COACH_SELECTION,
      participantCount: lobby.participants.length,
      coachSelectedCount: 0,
    });

    return true;
  }

  private async loadCoachCatalog(leagueIds: readonly string[]): Promise<readonly Coach[]> {
    const baseFilter = { hasImage: true } as const;

    if (leagueIds.length > 0) {
      const scoped = await this.coachRepository.findPaginated(
        { ...baseFilter, leagueIds: [...leagueIds] },
        { field: 'createdAt', direction: 'desc' },
        { page: 1, pageSize: 500 },
      );

      if (scoped.items.length >= COACH_POOL_SIZE) {
        return scoped.items;
      }
    }

    const catalog = await this.coachRepository.findPaginated(
      baseFilter,
      { field: 'createdAt', direction: 'desc' },
      { page: 1, pageSize: 500 },
    );

    return catalog.items;
  }
}
