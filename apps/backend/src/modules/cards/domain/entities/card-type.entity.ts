import { Entity } from '../../../../common/domain/entity';
import { type ReferenceCode } from '../value-objects/reference-code.vo';
import { type ReferenceId } from '../value-objects/reference-id.vo';

export interface CreateCardTypeProps {
  readonly id: ReferenceId;
  readonly code: ReferenceCode;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
}

export interface CardTypeProps extends CreateCardTypeProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class CardType extends Entity<ReferenceId> {
  private readonly _code: ReferenceCode;
  private readonly _name: string;
  private readonly _description: string | null;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CardTypeProps) {
    super(props.id);
    this._code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateCardTypeProps): CardType {
    const now = new Date();
    return new CardType({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: CardTypeProps): CardType {
    return new CardType(props);
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

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }
}
