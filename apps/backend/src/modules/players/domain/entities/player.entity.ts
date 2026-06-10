import { v4 as uuidv4 } from 'uuid';

import { Entity } from '../../../../common/domain/entity';
import type { Position } from '../../../positions/domain/value-objects/position.vo';
import { type PlayerStatus } from '../enums/player-status.enum';
import type { BirthDate } from '../value-objects/birth-date.vo';
import type { DisplayName } from '../value-objects/display-name.vo';
import type { ExternalReference } from '../value-objects/external-reference.vo';
import type { ImageUrl } from '../value-objects/image-url.vo';
import type { MarketValue } from '../value-objects/market-value.vo';
import type { Nationality } from '../value-objects/nationality.vo';
import type { PersonName } from '../value-objects/person-name.vo';
import { PlayerPositionId } from '../value-objects/player-position-id.vo';
import { PlayerPositions } from '../value-objects/player-positions.vo';
import type { PlayerId } from '../value-objects/player-id.vo';

export interface CreatePlayerProps {
  readonly id: PlayerId;
  readonly externalReference: ExternalReference | null;
  readonly firstName: PersonName;
  readonly lastName: PersonName;
  readonly displayName: DisplayName;
  readonly birthDate: BirthDate | null;
  readonly nationality: Nationality;
  readonly countryId: string | null;
  readonly teamId: string | null;
  readonly leagueId: string | null;
  readonly positions: PlayerPositions;
  readonly marketValue: MarketValue | null;
  readonly marketValueCurrency: string | null;
  readonly imageUrl: ImageUrl | null;
  readonly status: PlayerStatus;
}

export interface PlayerProps extends CreatePlayerProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Real football person — identity and provider mirror only.
 * Gameplay strength lives on {@link Card} in the cards module.
 */
export class Player extends Entity<PlayerId> {
  private readonly _externalReference: ExternalReference | null;
  private readonly _firstName: PersonName;
  private readonly _lastName: PersonName;
  private readonly _displayName: DisplayName;
  private _birthDate: BirthDate | null;
  private readonly _nationality: Nationality;
  private _countryId: string | null;
  private _teamId: string | null;
  private _leagueId: string | null;
  private _positions: PlayerPositions;
  private _marketValue: MarketValue | null;
  private readonly _marketValueCurrency: string | null;
  private _imageUrl: ImageUrl | null;
  private _status: PlayerStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PlayerProps) {
    super(props.id);
    this._externalReference = props.externalReference;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._displayName = props.displayName;
    this._birthDate = props.birthDate;
    this._nationality = props.nationality;
    this._countryId = props.countryId;
    this._teamId = props.teamId;
    this._leagueId = props.leagueId;
    this._positions = props.positions;
    this._marketValue = props.marketValue;
    this._marketValueCurrency = props.marketValueCurrency;
    this._imageUrl = props.imageUrl;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreatePlayerProps): Player {
    const now = new Date();

    return new Player({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PlayerProps): Player {
    return new Player(props);
  }

  get externalReference(): ExternalReference | null {
    return this._externalReference;
  }

  get firstName(): PersonName {
    return this._firstName;
  }

  get lastName(): PersonName {
    return this._lastName;
  }

  get displayName(): DisplayName {
    return this._displayName;
  }

  get birthDate(): BirthDate | null {
    return this._birthDate;
  }

  get nationality(): Nationality {
    return this._nationality;
  }

  get countryId(): string | null {
    return this._countryId;
  }

  get teamId(): string | null {
    return this._teamId;
  }

  get leagueId(): string | null {
    return this._leagueId;
  }

  get positions(): PlayerPositions {
    return this._positions;
  }

  get primaryPosition(): Position {
    return this._positions.primary;
  }

  get marketValue(): MarketValue | null {
    return this._marketValue;
  }

  get marketValueCurrency(): string | null {
    return this._marketValueCurrency;
  }

  get imageUrl(): ImageUrl | null {
    return this._imageUrl;
  }

  get status(): PlayerStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** @deprecated Use primaryPosition — kept for transitional API mapping */
  get position(): Position {
    return this._positions.primary;
  }

  /** @deprecated Use displayName — kept for transitional API mapping */
  get name(): DisplayName {
    return this._displayName;
  }

  replacePositions(positions: PlayerPositions): void {
    this._positions = positions;
    this._updatedAt = new Date();
  }

  updatePrimaryPosition(position: Position): void {
    this.replacePositions(
      PlayerPositions.withPrimary(
        this.id,
        () => PlayerPositionId.generate(uuidv4()),
        position,
        this._positions.secondaryCodes,
      ),
    );
  }

  updateBirthDate(birthDate: BirthDate | null): void {
    this._birthDate = birthDate;
    this._updatedAt = new Date();
  }

  assignCountry(countryId: string | null): void {
    this._countryId = countryId;
    this._updatedAt = new Date();
  }

  assignTeam(teamId: string | null): void {
    this._teamId = teamId;
    this._updatedAt = new Date();
  }

  assignLeague(leagueId: string | null): void {
    this._leagueId = leagueId;
    this._updatedAt = new Date();
  }
}
