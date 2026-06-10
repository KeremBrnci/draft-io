import { Entity } from '../../../../common/domain/entity';
import type { LeagueExternalReference } from '../value-objects/external-reference.vo';
import { type LeagueId } from '../value-objects/league-id.vo';
import { type LeagueName } from '../value-objects/league-name.vo';

export interface CreateLeagueProps {
  readonly id: LeagueId;
  readonly externalReference: LeagueExternalReference | null;
  readonly name: LeagueName;
  readonly slug: string | null;
  readonly countryId: string | null;
  readonly country: string | null;
  readonly logoUrl: string | null;
}

export interface LeagueProps extends CreateLeagueProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class League extends Entity<LeagueId> {
  private readonly _externalReference: LeagueExternalReference | null;
  private readonly _name: LeagueName;
  private readonly _slug: string | null;
  private readonly _countryId: string | null;
  private readonly _country: string | null;
  private readonly _logoUrl: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: LeagueProps) {
    super(props.id);
    this._externalReference = props.externalReference;
    this._name = props.name;
    this._slug = props.slug;
    this._countryId = props.countryId;
    this._country = props.country;
    this._logoUrl = props.logoUrl;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateLeagueProps): League {
    const now = new Date();

    return new League({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: LeagueProps): League {
    return new League(props);
  }

  get externalReference(): LeagueExternalReference | null {
    return this._externalReference;
  }

  get name(): LeagueName {
    return this._name;
  }

  get slug(): string | null {
    return this._slug;
  }

  get countryId(): string | null {
    return this._countryId;
  }

  get country(): string | null {
    return this._country;
  }

  get logoUrl(): string | null {
    return this._logoUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
