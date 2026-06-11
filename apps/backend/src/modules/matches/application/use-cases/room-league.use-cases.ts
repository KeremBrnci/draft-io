import type { RoomLeagueStateDto, TeamReviewStateDto } from '@draft-io/shared-types';

import type { CoachRepository } from '../../../coaches/domain/repositories/coach.repository';
import { CoachId } from '../../../coaches/domain/value-objects/coach-id.vo';
import { type CalculateTeamStrengthUseCase } from '../../../draft/application/use-cases/calculate-team-strength.use-case';
import { type GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { picksRemaining } from '../../../draft/domain/models/participant-draft-state';
import type { DraftPoolRepository } from '../../../draft/domain/repositories/draft-pool.repository';
import type { FormationRepository } from '../../../formations/domain/repositories/formation.repository';
import { LobbyLifecycleService } from '../../../lobbies/application/services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../../../lobbies/application/services/room-events.publisher';
import { RoomPhase } from '../../../lobbies/domain/enums/room-phase.enum';
import {
  InvalidLobbySessionError,
  InvalidRoomPhaseTransitionError,
  LobbyNotFoundError,
} from '../../../lobbies/domain/errors/lobby.errors';
import { RoomEventName } from '../../../lobbies/domain/events/room.events';
import type { LobbyRepository } from '../../../lobbies/domain/repositories/lobby.repository';
import { CoachPoolService } from '../../../lobbies/domain/services/coach-pool.service';
import { LobbyCode } from '../../../lobbies/domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../../lobbies/domain/value-objects/session-token.vo';
import { type MatchSimulationEngine } from '../../../simulation/domain/services/match-simulation-engine.service';
import type { RoomLeagueRepository } from '../../domain/repositories/room-league.repository';
import {
  toRoomLeagueStateDto,
  toTeamReviewStateDto,
} from '../../presentation/mappers/room-league-response.mapper';
import { type MatchPlaybackService } from '../services/match-playback.service';
import { buildParticipantTeamSnapshot } from '../services/team-snapshot.builder';

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
    const currentMatch = await this.roomLeagueRepository.findCurrentMatch(league.id);
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

export class StartNextMatchUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly draftPoolRepository: DraftPoolRepository,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly calculateTeamStrengthUseCase: CalculateTeamStrengthUseCase,
    private readonly roomLeagueRepository: RoomLeagueRepository,
    private readonly matchSimulationEngine: MatchSimulationEngine,
    private readonly matchPlaybackService: MatchPlaybackService,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: { readonly code: string }): Promise<void> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const league = await this.roomLeagueRepository.findByLobbyId(lobby.id.value);
    if (league === null) {
      throw new LobbyNotFoundError(lobby.id.value);
    }

    const live = await this.roomLeagueRepository.findLiveMatch(league.id);
    if (live !== null) {
      return;
    }

    const fixture = await this.roomLeagueRepository.findNextFixture(league.id);
    if (fixture === null) {
      return;
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      throw new LobbyNotFoundError(lobby.id.value);
    }

    const homeParticipant = lobby.participants.find(
      (entry) => entry.id === fixture.homeParticipantId,
    );
    const awayParticipant = lobby.participants.find(
      (entry) => entry.id === fixture.awayParticipantId,
    );
    if (homeParticipant === undefined || awayParticipant === undefined) {
      throw new LobbyNotFoundError(fixture.id);
    }

    const homeDraft = session.participants.find(
      (entry) => entry.participantId === homeParticipant.id,
    );
    const awayDraft = session.participants.find(
      (entry) => entry.participantId === awayParticipant.id,
    );
    if (homeDraft === undefined || awayDraft === undefined) {
      throw new LobbyNotFoundError(fixture.id);
    }

    const homeFormationId = homeParticipant.selectedFormationId;
    const awayFormationId = awayParticipant.selectedFormationId;
    if (homeFormationId === null || awayFormationId === null) {
      throw new InvalidRoomPhaseTransitionError(RoomPhase.MATCHES, RoomPhase.MATCHES);
    }

    const homeFormation = await this.formationRepository.findById(homeFormationId);
    const awayFormation = await this.formationRepository.findById(awayFormationId);
    if (homeFormation === null || awayFormation === null) {
      throw new LobbyNotFoundError(fixture.id);
    }

    const homeSnapshot = await buildParticipantTeamSnapshot({
      participant: homeParticipant,
      formation: homeFormation,
      draftState: homeDraft,
      draftPoolRepository: this.draftPoolRepository,
      calculateTeamStrengthUseCase: this.calculateTeamStrengthUseCase,
    });
    const awaySnapshot = await buildParticipantTeamSnapshot({
      participant: awayParticipant,
      formation: awayFormation,
      draftState: awayDraft,
      draftPoolRepository: this.draftPoolRepository,
      calculateTeamStrengthUseCase: this.calculateTeamStrengthUseCase,
    });

    const seed = Date.now() % 1_000_000;
    const simulation = this.matchSimulationEngine.simulate({
      home: homeSnapshot,
      away: awaySnapshot,
      seed,
    });
    const match = await this.roomLeagueRepository.createMatch({
      leagueId: league.id,
      fixtureId: fixture.id,
      homeParticipantId: fixture.homeParticipantId,
      awayParticipantId: fixture.awayParticipantId,
      simulationSeed: seed,
      homeSnapshot,
      awaySnapshot,
      homeScore: simulation.homeScore,
      awayScore: simulation.awayScore,
      homeXg: simulation.homeXg,
      awayXg: simulation.awayXg,
      manOfTheMatchCardId: simulation.manOfTheMatchCardId,
      events: simulation.events,
      statistics: simulation.statistics,
    });

    await this.matchPlaybackService.startPlayback({
      matchId: match.id,
      leagueId: league.id,
      lobbyCode: command.code,
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

    const coachPage = await this.coachRepository.findPaginated(
      { hasImage: true },
      { field: 'name', direction: 'asc' },
      { page: 1, pageSize: 120 },
    );
    const pools = this.coachPoolService.assignPersonalPools(
      lobby.id.value,
      lobby.participants.map((participant) => participant.id),
      coachPage.items.map((coach) => ({ id: coach.id.value })),
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
}
