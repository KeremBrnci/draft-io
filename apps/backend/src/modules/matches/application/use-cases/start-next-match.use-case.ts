import { type CalculateTeamStrengthUseCase } from '../../../draft/application/use-cases/calculate-team-strength.use-case';
import { type GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import type { DraftPoolRepository } from '../../../draft/domain/repositories/draft-pool.repository';
import type { FormationRepository } from '../../../formations/domain/repositories/formation.repository';
import { LobbyLifecycleService } from '../../../lobbies/application/services/lobby-lifecycle.service';
import { RoomPhase } from '../../../lobbies/domain/enums/room-phase.enum';
import {
  InvalidRoomPhaseTransitionError,
  LobbyNotFoundError,
} from '../../../lobbies/domain/errors/lobby.errors';
import type { LobbyRepository } from '../../../lobbies/domain/repositories/lobby.repository';
import { LobbyCode } from '../../../lobbies/domain/value-objects/lobby-code.vo';
import { type MatchSimulationEngine } from '../../../simulation/domain/services/match-simulation-engine.service';
import type { RoomLeagueRepository } from '../../domain/repositories/room-league.repository';
import type { MatchPlaybackPort } from '../ports/match-playback.port';
import { buildParticipantTeamSnapshot } from '../services/team-snapshot.builder';

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
    private readonly matchPlayback: MatchPlaybackPort,
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

    await this.matchPlayback.startPlayback({
      matchId: match.id,
      leagueId: league.id,
      lobbyCode: command.code,
    });
  }
}
