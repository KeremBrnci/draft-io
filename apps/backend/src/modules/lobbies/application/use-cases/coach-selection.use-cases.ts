import { buildTransfermarktNationalityFlagUrl, translateNationality } from '@draft-io/shared-utils';

import type { CoachRepository } from '../../../coaches/domain/repositories/coach.repository';
import { CoachId } from '../../../coaches/domain/value-objects/coach-id.vo';
import type { GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import type { DraftPoolRepository } from '../../../draft/domain/repositories/draft-pool.repository';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import type { StartNextMatchUseCase } from '../../../matches/application/use-cases/start-next-match.use-case';
import type { RoomLeagueRepository } from '../../../matches/domain/repositories/room-league.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import type { Lobby } from '../../domain/entities/lobby.entity';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import { RoomEventName, type RoomEventPayload } from '../../domain/events/room.events';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import type { CoachSelectionOption } from '../read-models/coach-selection-option';
import { CoachSelectionChemistryService } from '../services/coach-selection-chemistry.service';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../services/room-events.publisher';

export interface SelectCoachCommand {
  readonly code: string;
  readonly sessionToken: string;
  readonly coachId: string;
}

export class SelectCoachUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
    private readonly checkCoachCompletionUseCase: CheckCoachCompletionUseCase,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: SelectCoachCommand): Promise<Lobby> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const participant = lobby.selectCoach(
      SessionToken.reconstitute(command.sessionToken),
      command.coachId,
    );

    await this.lobbyRepository.save(lobby);

    await this.roomEventsPublisher.publish(lobby.code.value, RoomEventName.PLAYER_SELECTED_COACH, {
      lobbyCode: lobby.code.value,
      phase: lobby.phase,
      participantId: participant.id,
      coachId: command.coachId,
      coachSelectedCount: lobby.coachSelectedCount,
      participantCount: lobby.participants.length,
    } satisfies RoomEventPayload);

    if (lobby.allCoachesSelected) {
      await this.roomEventsPublisher.publish(lobby.code.value, RoomEventName.ALL_COACHES_SELECTED, {
        lobbyCode: lobby.code.value,
        phase: lobby.phase,
        coachSelectedCount: lobby.coachSelectedCount,
        participantCount: lobby.participants.length,
      } satisfies RoomEventPayload);

      await this.checkCoachCompletionUseCase.execute({ code: command.code });
    }

    return lobby;
  }
}

export interface CoachSelectionState {
  readonly lobby: Lobby;
  readonly participant: LobbyParticipant | null;
  readonly myCoachOptions: readonly CoachSelectionOption[];
}

export interface GetCoachSelectionQuery {
  readonly code: string;
  readonly sessionToken?: string;
}

export class GetCoachSelectionUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly coachRepository: CoachRepository,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly draftPoolRepository: DraftPoolRepository,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: GetCoachSelectionQuery): Promise<CoachSelectionState> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(query.code));
    const participant =
      query.sessionToken === undefined
        ? null
        : lobby.findParticipantBySessionToken(SessionToken.reconstitute(query.sessionToken));

    let myCoachOptions: readonly CoachSelectionOption[] = [];
    if (participant !== null) {
      const coaches = await Promise.all(
        participant.coachOptionIds.map((coachId) =>
          this.coachRepository.findById(CoachId.create(coachId)),
        ),
      );
      const teams = await Promise.all(
        coaches.map((coach) =>
          coach?.teamId === null || coach?.teamId === undefined
            ? Promise.resolve(null)
            : this.teamRepository.findById(TeamId.create(coach.teamId)),
        ),
      );
      const leagues = await Promise.all(
        coaches.map((coach, index) => {
          const leagueId = coach?.leagueId ?? teams[index]?.leagueId ?? null;
          return leagueId === null
            ? Promise.resolve(null)
            : this.leagueRepository.findById(LeagueId.create(leagueId));
        }),
      );
      const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
      const draftParticipant = session?.participants.find(
        (entry) => entry.participantId === participant.id,
      );
      const draftedCards =
        draftParticipant === undefined || draftParticipant.draftedCardIds.length === 0
          ? []
          : await this.draftPoolRepository.findByIds(draftParticipant.draftedCardIds);
      const chemistryService =
        session === null ? null : new CoachSelectionChemistryService(session.config.chemistry);

      myCoachOptions = coaches
        .map((coach, index): CoachSelectionOption | null => {
          if (coach === null) {
            return null;
          }

          const team = teams[index];
          const league = leagues[index];
          const chemistryProjection =
            chemistryService === null
              ? { projectedTeamChemistry: 0, chemistryBonus: 0 }
              : chemistryService.projectForCoach(draftedCards, coach);

          return {
            id: coach.id.value,
            displayName: coach.displayName,
            imageUrl: coach.imageUrl,
            role: coach.role,
            nationality: translateNationality(coach.nationality),
            nationalityFlagUrl: buildTransfermarktNationalityFlagUrl(coach.nationality),
            age: coach.age,
            appointedDate: coach.appointedDate?.toISOString().slice(0, 10) ?? null,
            contractExpires: coach.contractExpires?.toISOString().slice(0, 10) ?? null,
            teamId: coach.teamId,
            teamName: team?.name.value ?? null,
            teamLogoUrl: team?.logoUrl ?? null,
            leagueId: coach.leagueId ?? team?.leagueId ?? null,
            leagueName: league?.name.value ?? null,
            leagueLogoUrl: league?.logoUrl ?? null,
            projectedTeamChemistry: chemistryProjection.projectedTeamChemistry,
            chemistryBonus: chemistryProjection.chemistryBonus,
          };
        })
        .filter((entry): entry is CoachSelectionOption => entry !== null);
    }

    return { lobby, participant, myCoachOptions };
  }
}

export class CheckCoachCompletionUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly roomLeagueRepository: RoomLeagueRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
    private readonly startNextMatchUseCase: StartNextMatchUseCase,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: { readonly code: string }): Promise<boolean> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    if (lobby.phase !== RoomPhase.COACH_SELECTION || !lobby.allCoachesSelected) {
      return false;
    }

    lobby.advanceToTeamReview();
    lobby.beginMatches();
    await this.lobbyRepository.save(lobby);

    let league = await this.roomLeagueRepository.findByLobbyId(lobby.id.value);
    if (league === null) {
      league = await this.roomLeagueRepository.createLeague({
        lobbyId: lobby.id.value,
        participantIds: lobby.participants.map((participant) => participant.id),
        participantNames: new Map(
          lobby.participants.map((participant) => [participant.id, participant.displayName.value]),
        ),
      });
    }

    await this.roomLeagueRepository.updateLeagueStatus(league.id, 'IN_PROGRESS');

    await this.roomEventsPublisher.publish(command.code, RoomEventName.LEAGUE_READY, {
      lobbyCode: command.code,
      phase: RoomPhase.MATCHES,
    });

    await this.startNextMatchUseCase.execute({ code: command.code });

    return true;
  }
}
