import { InvalidReferenceIdError } from '../errors/card.errors';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ReferenceId {
  private constructor(private readonly _value: string) {}

  static create(value: string): ReferenceId {
    if (!UUID_PATTERN.test(value)) {
      throw new InvalidReferenceIdError(value);
    }

    return new ReferenceId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ReferenceId): boolean {
    return this._value === other._value;
  }
}
