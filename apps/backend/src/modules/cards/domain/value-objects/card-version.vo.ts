import { InvalidCardVersionError } from '../errors/card.errors';

const MAX_LENGTH = 64;

export class CardVersion {
  private constructor(private readonly _value: string) {}

  static create(value: string): CardVersion {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidCardVersionError(value);
    }

    return new CardVersion(trimmed);
  }

  get value(): string {
    return this._value;
  }
}
