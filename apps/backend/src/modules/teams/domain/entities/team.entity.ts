import { Entity } from '../../../../common/domain/entity';
import type { TeamExternalReference } from '../value-objects/external-reference.vo';
import { type StartingEleven } from '../value-objects/starting-eleven.vo';
import type { TeamId } from '../value-objects/team-id.vo';
import type { TeamName } from '../value-objects/team-name.vo';
import type { TeamShortName } from '../value-objects/team-short-name.vo';

export interface CreateTeamProps {
  readonly id: TeamId;
  readonly externalReference: TeamExternalReference | null;
  readonly name: TeamName;
  readonly shortName: TeamShortName | null;
  readonly countryId: string | null;
  readonly leagueId: string | null;
  readonly country: string | null;
  readonly logoUrl: string | null;
}

export interface TeamProps extends CreateTeamProps {
  /** Game squad fields — null until user builds a draft team */
  readonly formationCode: string | null;
  readonly manager: string | null;
  readonly startingEleven: StartingEleven | null;
  readonly chemistryScore: number | null;
  readonly teamOverall: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Team extends Entity<TeamId> {
  private readonly _externalReference: TeamExternalReference | null;
  private readonly _name: TeamName;
  private readonly _shortName: TeamShortName | null;
  private readonly _countryId: string | null;
  private readonly _leagueId: string | null;
  private readonly _country: string | null;
  private readonly _logoUrl: string | null;
  private _formationCode: string | null;
  private _manager: string | null;
  private _startingEleven: StartingEleven | null;
  private _chemistryScore: number | null;
  private _teamOverall: number | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: TeamProps) {
    super(props.id);
    this._externalReference = props.externalReference;
    this._name = props.name;
    this._shortName = props.shortName;
    this._countryId = props.countryId;
    this._leagueId = props.leagueId;
    this._country = props.country;
    this._logoUrl = props.logoUrl;
    this._formationCode = props.formationCode;
    this._manager = props.manager;
    this._startingEleven = props.startingEleven;
    this._chemistryScore = props.chemistryScore;
    this._teamOverall = props.teamOverall;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateTeamProps): Team {
    const now = new Date();

    return new Team({
      ...props,
      formationCode: null,
      manager: null,
      startingEleven: null,
      chemistryScore: null,
      teamOverall: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: TeamProps): Team {
    return new Team(props);
  }

  get externalReference(): TeamExternalReference | null {
    return this._externalReference;
  }

  get name(): TeamName {
    return this._name;
  }

  get shortName(): TeamShortName | null {
    return this._shortName;
  }

  get countryId(): string | null {
    return this._countryId;
  }

  get leagueId(): string | null {
    return this._leagueId;
  }

  get country(): string | null {
    return this._country;
  }

  get logoUrl(): string | null {
    return this._logoUrl;
  }

  get formationCode(): string | null {
    return this._formationCode;
  }

  get manager(): string | null {
    return this._manager;
  }

  get startingEleven(): StartingEleven | null {
    return this._startingEleven;
  }

  get chemistryScore(): number | null {
    return this._chemistryScore;
  }

  get teamOverall(): number | null {
    return this._teamOverall;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  assignFormation(code: string): void {
    this._formationCode = code;
    this._updatedAt = new Date();
  }

  assignManager(manager: string): void {
    this._manager = manager;
    this._updatedAt = new Date();
  }
}
