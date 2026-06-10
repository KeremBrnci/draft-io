import { randomUUID } from 'node:crypto';

import { ParticipantPhaseStatus } from '../enums/room-phase.enum';
import { CoachAlreadySelectedError, CoachNotInPoolError } from '../errors/coach-selection.errors';
import {
  FormationAlreadySelectedError,
  FormationNotInPoolError,
} from '../errors/formation-selection.errors';
import type { ParticipantDisplayName } from '../value-objects/participant-display-name.vo';
import { SessionToken } from '../value-objects/session-token.vo';

export interface LobbyParticipantProps {
  readonly id: string;
  readonly displayName: ParticipantDisplayName;
  readonly isHost: boolean;
  readonly isReady: boolean;
  readonly phaseStatus: ParticipantPhaseStatus;
  readonly selectedFormationId: string | null;
  readonly selectedCoachId: string | null;
  readonly formationOptionIds: readonly string[];
  readonly coachOptionIds: readonly string[];
  readonly sessionToken: SessionToken;
  readonly joinedAt: Date;
}

export class LobbyParticipant {
  private readonly _id: string;
  private readonly _displayName: ParticipantDisplayName;
  private readonly _isHost: boolean;
  private _isReady: boolean;
  private _phaseStatus: ParticipantPhaseStatus;
  private _selectedFormationId: string | null;
  private _selectedCoachId: string | null;
  private _formationOptionIds: string[];
  private _coachOptionIds: string[];
  private readonly _sessionToken: SessionToken;
  private readonly _joinedAt: Date;

  private constructor(props: LobbyParticipantProps) {
    this._id = props.id;
    this._displayName = props.displayName;
    this._isHost = props.isHost;
    this._isReady = props.isReady;
    this._phaseStatus = props.phaseStatus;
    this._selectedFormationId = props.selectedFormationId;
    this._selectedCoachId = props.selectedCoachId;
    this._formationOptionIds = [...props.formationOptionIds];
    this._coachOptionIds = [...props.coachOptionIds];
    this._sessionToken = props.sessionToken;
    this._joinedAt = props.joinedAt;
  }

  static createHost(displayName: ParticipantDisplayName): LobbyParticipant {
    return new LobbyParticipant({
      id: randomUUID(),
      displayName,
      isHost: true,
      isReady: false,
      phaseStatus: ParticipantPhaseStatus.IN_LOBBY,
      selectedFormationId: null,
      selectedCoachId: null,
      formationOptionIds: [],
      coachOptionIds: [],
      sessionToken: SessionToken.generate(),
      joinedAt: new Date(),
    });
  }

  static createGuest(displayName: ParticipantDisplayName): LobbyParticipant {
    return new LobbyParticipant({
      id: randomUUID(),
      displayName,
      isHost: false,
      isReady: false,
      phaseStatus: ParticipantPhaseStatus.IN_LOBBY,
      selectedFormationId: null,
      selectedCoachId: null,
      formationOptionIds: [],
      coachOptionIds: [],
      sessionToken: SessionToken.generate(),
      joinedAt: new Date(),
    });
  }

  static reconstitute(props: LobbyParticipantProps): LobbyParticipant {
    return new LobbyParticipant(props);
  }

  setReady(isReady: boolean): void {
    this._isReady = isReady;
  }

  assignFormationPool(formationIds: readonly string[]): void {
    this._formationOptionIds = [...formationIds];
  }

  assignCoachPool(coachIds: readonly string[]): void {
    this._coachOptionIds = [...coachIds];
  }

  selectFormation(formationId: string): void {
    if (this._selectedFormationId !== null) {
      throw new FormationAlreadySelectedError();
    }

    if (!this._formationOptionIds.includes(formationId)) {
      throw new FormationNotInPoolError(formationId);
    }

    this._selectedFormationId = formationId;
    this._phaseStatus = ParticipantPhaseStatus.FORMATION_SELECTED;
  }

  selectCoach(coachId: string): void {
    if (this._selectedCoachId !== null) {
      throw new CoachAlreadySelectedError();
    }

    if (!this._coachOptionIds.includes(coachId)) {
      throw new CoachNotInPoolError(coachId);
    }

    this._selectedCoachId = coachId;
    this._phaseStatus = ParticipantPhaseStatus.COACH_SELECTED;
  }

  get hasSelectedFormation(): boolean {
    return this._selectedFormationId !== null;
  }

  get hasSelectedCoach(): boolean {
    return this._selectedCoachId !== null;
  }

  get id(): string {
    return this._id;
  }

  get displayName(): ParticipantDisplayName {
    return this._displayName;
  }

  get isHost(): boolean {
    return this._isHost;
  }

  get isReady(): boolean {
    return this._isReady;
  }

  get phaseStatus(): ParticipantPhaseStatus {
    return this._phaseStatus;
  }

  get selectedFormationId(): string | null {
    return this._selectedFormationId;
  }

  get formationOptionIds(): readonly string[] {
    return this._formationOptionIds;
  }

  get selectedCoachId(): string | null {
    return this._selectedCoachId;
  }

  get coachOptionIds(): readonly string[] {
    return this._coachOptionIds;
  }

  get sessionToken(): SessionToken {
    return this._sessionToken;
  }

  get joinedAt(): Date {
    return this._joinedAt;
  }
}
