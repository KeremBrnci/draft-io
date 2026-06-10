import { Entity } from '../../../../common/domain/entity';
import { type ReferenceId } from '../value-objects/reference-id.vo';

export interface CreateCardTemplateProps {
  readonly id: ReferenceId;
  readonly cardTypeId: ReferenceId;
  readonly name: string;
  readonly backgroundImage: string | null;
  readonly borderImage: string | null;
  readonly animationKey: string | null;
  readonly primaryColor: string | null;
  readonly secondaryColor: string | null;
  readonly isActive: boolean;
}

export interface CardTemplateProps extends CreateCardTemplateProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Presentation configuration for a card type — no rendering logic in domain.
 */
export class CardTemplate extends Entity<ReferenceId> {
  private readonly _cardTypeId: ReferenceId;
  private readonly _name: string;
  private readonly _backgroundImage: string | null;
  private readonly _borderImage: string | null;
  private readonly _animationKey: string | null;
  private readonly _primaryColor: string | null;
  private readonly _secondaryColor: string | null;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CardTemplateProps) {
    super(props.id);
    this._cardTypeId = props.cardTypeId;
    this._name = props.name;
    this._backgroundImage = props.backgroundImage;
    this._borderImage = props.borderImage;
    this._animationKey = props.animationKey;
    this._primaryColor = props.primaryColor;
    this._secondaryColor = props.secondaryColor;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateCardTemplateProps): CardTemplate {
    const now = new Date();
    return new CardTemplate({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: CardTemplateProps): CardTemplate {
    return new CardTemplate(props);
  }

  get cardTypeId(): ReferenceId {
    return this._cardTypeId;
  }

  get name(): string {
    return this._name;
  }

  get backgroundImage(): string | null {
    return this._backgroundImage;
  }

  get borderImage(): string | null {
    return this._borderImage;
  }

  get animationKey(): string | null {
    return this._animationKey;
  }

  get primaryColor(): string | null {
    return this._primaryColor;
  }

  get secondaryColor(): string | null {
    return this._secondaryColor;
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
}
