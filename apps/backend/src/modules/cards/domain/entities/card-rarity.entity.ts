import { Entity } from '../../../../common/domain/entity';
import { type ReferenceCode } from '../value-objects/reference-code.vo';
import { type ReferenceId } from '../value-objects/reference-id.vo';

export interface CreateCardRarityProps {
  readonly id: ReferenceId;
  readonly code: ReferenceCode;
  readonly name: string;
  readonly description: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
}

export interface CardRarityProps extends CreateCardRarityProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class CardRarity extends Entity<ReferenceId> {
  private readonly _code: ReferenceCode;
  private readonly _name: string;
  private readonly _description: string | null;
  private readonly _sortOrder: number;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CardRarityProps) {
    super(props.id);
    this._code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._sortOrder = props.sortOrder;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateCardRarityProps): CardRarity {
    const now = new Date();
    return new CardRarity({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: CardRarityProps): CardRarity {
    return new CardRarity(props);
  }

  get code(): ReferenceCode {
    return this._code;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get sortOrder(): number {
    return this._sortOrder;
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
