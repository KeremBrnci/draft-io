import { Entity } from '../../../../common/domain/entity';
import { CardOverallSource } from '../enums/card-overall-source.enum';
import { CardPlayerReferenceError } from '../errors/card.errors';
import type { CardId } from '../value-objects/card-id.vo';
import type { CardOverall } from '../value-objects/card-overall.vo';
import type { CardVersion } from '../value-objects/card-version.vo';
import type { ReferenceId } from '../value-objects/reference-id.vo';

const PLAYER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CreateCardProps {
  readonly id: CardId;
  readonly playerId: string;
  readonly cardTypeId: ReferenceId;
  readonly cardRarityId: ReferenceId;
  readonly cardTemplateId: ReferenceId;
  readonly overall: CardOverall;
  readonly overallSource: CardOverallSource;
  readonly cardVersion: CardVersion;
  readonly releaseDate: Date | null;
  readonly isActive: boolean;
}

export interface CardProps extends CreateCardProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Playable game asset. References type/rarity/template by ID — not enums.
 * Visual config lives on CardTemplate; identity on Player.
 */
export class Card extends Entity<CardId> {
  private readonly _playerId: string;
  private readonly _cardTypeId: ReferenceId;
  private readonly _cardRarityId: ReferenceId;
  private readonly _cardTemplateId: ReferenceId;
  private _overall: CardOverall;
  private _overallSource: CardOverallSource;
  private readonly _cardVersion: CardVersion;
  private readonly _releaseDate: Date | null;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CardProps) {
    super(props.id);
    assertValidPlayerId(props.playerId);
    this._playerId = props.playerId;
    this._cardTypeId = props.cardTypeId;
    this._cardRarityId = props.cardRarityId;
    this._cardTemplateId = props.cardTemplateId;
    this._overall = props.overall;
    this._overallSource = props.overallSource;
    this._cardVersion = props.cardVersion;
    this._releaseDate = props.releaseDate;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateCardProps): Card {
    const now = new Date();
    return new Card({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: CardProps): Card {
    return new Card(props);
  }

  get playerId(): string {
    return this._playerId;
  }

  get cardTypeId(): ReferenceId {
    return this._cardTypeId;
  }

  get cardRarityId(): ReferenceId {
    return this._cardRarityId;
  }

  get cardTemplateId(): ReferenceId {
    return this._cardTemplateId;
  }

  get overall(): CardOverall {
    return this._overall;
  }

  get overallSource(): CardOverallSource {
    return this._overallSource;
  }

  get cardVersion(): CardVersion {
    return this._cardVersion;
  }

  get releaseDate(): Date | null {
    return this._releaseDate;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  applyManualOverallOverride(overall: CardOverall): void {
    this._overall = overall;
    this._overallSource = CardOverallSource.MANUAL_OVERRIDE;
    this._updatedAt = new Date();
  }

  applyCalculatedOverall(overall: CardOverall): void {
    if (this._overallSource === CardOverallSource.MANUAL_OVERRIDE) {
      return;
    }

    this._overall = overall;
    this._overallSource = CardOverallSource.CALCULATED;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }
}

function assertValidPlayerId(playerId: string): void {
  if (!PLAYER_ID_PATTERN.test(playerId)) {
    throw new CardPlayerReferenceError(`Card must reference a valid player UUID, got: ${playerId}`);
  }
}
