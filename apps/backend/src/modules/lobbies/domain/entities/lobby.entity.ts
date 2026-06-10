import { Entity } from '../../../../common/domain/entity';
import { LobbyStatus } from '../enums/lobby-status.enum';
import { ParticipantPhaseStatus, RoomPhase } from '../enums/room-phase.enum';
import {
  DuplicateParticipantDisplayNameError,
  InvalidLobbyCapacityError,
  InvalidLobbySessionError,
  InvalidRoomPhaseTransitionError,
  LobbyFullError,
  LobbyNotJoinableError,
  LobbyNotStartableError,
  NotLobbyHostError,
} from '../errors/lobby.errors';
import { CoachSelectionIncompleteError } from '../errors/coach-selection.errors';
import { FormationSelectionIncompleteError } from '../errors/formation-selection.errors';
import { LobbyParticipant } from './lobby-participant.entity';
import type { LobbyCode } from '../value-objects/lobby-code.vo';
import type { LobbyId } from '../value-objects/lobby-id.vo';
import type { LobbyName } from '../value-objects/lobby-name.vo';
import type { ParticipantDisplayName } from '../value-objects/participant-display-name.vo';
import type { SessionToken } from '../value-objects/session-token.vo';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 12;

export interface CreateLobbyProps {
  readonly id: LobbyId;
  readonly name: LobbyName;
  readonly code: LobbyCode;
  readonly maxPlayers: number;
  readonly host: LobbyParticipant;
}

export interface LobbyProps {
  readonly id: LobbyId;
  readonly name: LobbyName;
  readonly code: LobbyCode;
  readonly status: LobbyStatus;
  readonly phase: RoomPhase;
  readonly maxPlayers: number;
  readonly participants: readonly LobbyParticipant[];
  readonly expiresAt: Date;
  readonly formationSelectionStartedAt: Date | null;
  readonly formationSelectionDeadline: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Lobby extends Entity<LobbyId> {
  private readonly _name: LobbyName;
  private readonly _code: LobbyCode;
  private _status: LobbyStatus;
  private _phase: RoomPhase;
  private readonly _maxPlayers: number;
  private _participants: LobbyParticipant[];
  private _expiresAt: Date;
  private _formationSelectionStartedAt: Date | null;
  private _formationSelectionDeadline: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: LobbyProps) {
    super(props.id);
    this._name = props.name;
    this._code = props.code;
    this._status = props.status;
    this._phase = props.phase;
    this._maxPlayers = props.maxPlayers;
    this._participants = [...props.participants];
    this._expiresAt = props.expiresAt;
    this._formationSelectionStartedAt = props.formationSelectionStartedAt;
    this._formationSelectionDeadline = props.formationSelectionDeadline;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateLobbyProps & { readonly expiresAt: Date }): Lobby {
    assertValidCapacity(props.maxPlayers);
    const now = new Date();

    return new Lobby({
      id: props.id,
      name: props.name,
      code: props.code,
      status: LobbyStatus.OPEN,
      phase: RoomPhase.LOBBY,
      maxPlayers: props.maxPlayers,
      participants: [props.host],
      expiresAt: props.expiresAt,
      formationSelectionStartedAt: null,
      formationSelectionDeadline: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: LobbyProps): Lobby {
    assertValidCapacity(props.maxPlayers);
    return new Lobby(props);
  }

  join(displayName: ParticipantDisplayName): LobbyParticipant {
    if (this._phase !== RoomPhase.LOBBY) {
      throw new LobbyNotJoinableError(this._phase);
    }

    if (this._status !== LobbyStatus.OPEN) {
      throw new LobbyNotJoinableError(this._status);
    }

    if (this._participants.length >= this._maxPlayers) {
      throw new LobbyFullError();
    }

    if (this.hasDisplayName(displayName)) {
      throw new DuplicateParticipantDisplayNameError(displayName.value);
    }

    const participant = LobbyParticipant.createGuest(displayName);
    this._participants.push(participant);
    this._updatedAt = new Date();

    if (this._participants.length >= this._maxPlayers) {
      this._status = LobbyStatus.FULL;
    }

    return participant;
  }

  hasDisplayName(displayName: ParticipantDisplayName): boolean {
    return this._participants.some((participant) => participant.displayName.equals(displayName));
  }

  setParticipantReady(sessionToken: SessionToken, isReady: boolean): LobbyParticipant {
    if (this._phase !== RoomPhase.LOBBY && this._phase !== RoomPhase.DRAFT) {
      throw new LobbyNotJoinableError(this._phase);
    }

    if (this._phase === RoomPhase.LOBBY && this._status !== LobbyStatus.OPEN && this._status !== LobbyStatus.FULL) {
      throw new LobbyNotJoinableError(this._status);
    }

    const participant = this.requireParticipant(sessionToken);
    participant.setReady(isReady);
    this._updatedAt = new Date();
    return participant;
  }

  startFormationSelection(
    hostSessionToken: SessionToken,
    pools: ReadonlyMap<string, readonly string[]>,
    startedAt: Date,
    selectionDeadline: Date | null,
  ): void {
    const host = this.requireParticipant(hostSessionToken);
    if (!host.isHost) {
      throw new NotLobbyHostError();
    }

    if (this._phase !== RoomPhase.LOBBY) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.FORMATION_SELECTION);
    }

    if (this._status !== LobbyStatus.OPEN && this._status !== LobbyStatus.FULL) {
      throw new LobbyNotJoinableError(this._status);
    }

    if (!this.allParticipantsReady) {
      throw new LobbyNotStartableError();
    }

    for (const participant of this._participants) {
      const pool = pools.get(participant.id);
      if (pool === undefined || pool.length === 0) {
        throw new Error(`Missing formation pool for participant ${participant.id}`);
      }
      participant.assignFormationPool(pool);
    }

    this._phase = RoomPhase.FORMATION_SELECTION;
    this._status = LobbyStatus.STARTED;
    this._formationSelectionStartedAt = startedAt;
    this._formationSelectionDeadline = selectionDeadline;
    this._updatedAt = new Date();
  }

  selectFormation(sessionToken: SessionToken, formationId: string): LobbyParticipant {
    if (this._phase !== RoomPhase.FORMATION_SELECTION) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.FORMATION_SELECTION);
    }

    const participant = this.requireParticipant(sessionToken);
    participant.selectFormation(formationId);
    this._updatedAt = new Date();
    return participant;
  }

  advanceToCoachSelection(pools: ReadonlyMap<string, readonly string[]>): void {
    if (this._phase !== RoomPhase.DRAFT) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.COACH_SELECTION);
    }

    for (const participant of this._participants) {
      const pool = pools.get(participant.id);
      if (pool === undefined || pool.length === 0) {
        throw new Error(`Missing coach pool for participant ${participant.id}`);
      }
      participant.assignCoachPool(pool);
    }

    this._phase = RoomPhase.COACH_SELECTION;
    this._updatedAt = new Date();
  }

  selectCoach(sessionToken: SessionToken, coachId: string): LobbyParticipant {
    if (this._phase !== RoomPhase.COACH_SELECTION) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.COACH_SELECTION);
    }

    const participant = this.requireParticipant(sessionToken);
    participant.selectCoach(coachId);
    this._updatedAt = new Date();
    return participant;
  }

  advanceToTeamReview(): void {
    if (this._phase !== RoomPhase.COACH_SELECTION) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.TEAM_REVIEW);
    }

    if (!this.allCoachesSelected) {
      throw new CoachSelectionIncompleteError();
    }

    this._phase = RoomPhase.TEAM_REVIEW;
    this._updatedAt = new Date();
  }

  startMatches(hostSessionToken: SessionToken): void {
    const host = this.requireParticipant(hostSessionToken);
    if (!host.isHost) {
      throw new NotLobbyHostError();
    }

    this.beginMatches();
  }

  beginMatches(): void {
    if (this._phase !== RoomPhase.TEAM_REVIEW) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.MATCHES);
    }

    this._phase = RoomPhase.MATCHES;
    this._updatedAt = new Date();
  }

  startDraft(hostSessionToken: SessionToken): void {
    const host = this.requireParticipant(hostSessionToken);
    if (!host.isHost) {
      throw new NotLobbyHostError();
    }

    if (this._phase !== RoomPhase.FORMATION_SELECTION) {
      throw new InvalidRoomPhaseTransitionError(this._phase, RoomPhase.DRAFT);
    }

    if (!this.allFormationsSelected) {
      throw new FormationSelectionIncompleteError();
    }

    for (const participant of this._participants) {
      participant.setReady(false);
    }

    this._phase = RoomPhase.DRAFT;
    this._updatedAt = new Date();
  }

  findParticipantBySessionToken(sessionToken: SessionToken): LobbyParticipant | null {
    return (
      this._participants.find((participant) => participant.sessionToken.value === sessionToken.value) ??
      null
    );
  }

  get readyCount(): number {
    return this._participants.filter((participant) => participant.isReady).length;
  }

  get formationSelectedCount(): number {
    return this._participants.filter((participant) => participant.hasSelectedFormation).length;
  }

  get allParticipantsReady(): boolean {
    return this._participants.length >= 2 && this._participants.every((participant) => participant.isReady);
  }

  get allFormationsSelected(): boolean {
    return (
      this._participants.length >= 2 &&
      this._participants.every((participant) => participant.phaseStatus === ParticipantPhaseStatus.FORMATION_SELECTED)
    );
  }

  get coachSelectedCount(): number {
    return this._participants.filter((participant) => participant.hasSelectedCoach).length;
  }

  get allCoachesSelected(): boolean {
    return (
      this._participants.length >= 1 &&
      this._participants.every((participant) => participant.hasSelectedCoach)
    );
  }

  setExpiresAt(expiresAt: Date): void {
    this._expiresAt = expiresAt;
    this._updatedAt = new Date();
  }

  close(): void {
    this._status = LobbyStatus.CLOSED;
    this._phase = RoomPhase.FINISHED;
    this._updatedAt = new Date();
  }

  get name(): LobbyName {
    return this._name;
  }

  get code(): LobbyCode {
    return this._code;
  }

  get status(): LobbyStatus {
    return this._status;
  }

  get phase(): RoomPhase {
    return this._phase;
  }

  get maxPlayers(): number {
    return this._maxPlayers;
  }

  get participants(): readonly LobbyParticipant[] {
    return this._participants;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get formationSelectionStartedAt(): Date | null {
    return this._formationSelectionStartedAt;
  }

  get formationSelectionDeadline(): Date | null {
    return this._formationSelectionDeadline;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private requireParticipant(sessionToken: SessionToken): LobbyParticipant {
    const participant = this.findParticipantBySessionToken(sessionToken);
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    return participant;
  }
}

function assertValidCapacity(maxPlayers: number): void {
  if (!Number.isInteger(maxPlayers) || maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) {
    throw new InvalidLobbyCapacityError(maxPlayers);
  }
}
