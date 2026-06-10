import { Entity } from '../../../../common/domain/entity';
import type { NationExternalReference } from '../value-objects/external-reference.vo';
import { type NationId } from '../value-objects/nation-id.vo';
import { type NationName } from '../value-objects/nation-name.vo';

export interface CreateNationProps {
  readonly id: NationId;
  readonly externalReference: NationExternalReference | null;
  readonly name: NationName;
  readonly code: string | null;
}

export interface NationProps extends CreateNationProps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Nation extends Entity<NationId> {
  private readonly _externalReference: NationExternalReference | null;
  private readonly _name: NationName;
  private readonly _code: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: NationProps) {
    super(props.id);
    this._externalReference = props.externalReference;
    this._name = props.name;
    this._code = props.code;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateNationProps): Nation {
    const now = new Date();

    return new Nation({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: NationProps): Nation {
    return new Nation(props);
  }

  get externalReference(): NationExternalReference | null {
    return this._externalReference;
  }

  get name(): NationName {
    return this._name;
  }

  get code(): string | null {
    return this._code;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
