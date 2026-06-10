import { InvalidCardIdError } from '../errors/card.errors';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CardId {
  private constructor(private readonly _value: string) {}

  static create(value: string): CardId {
    if (!UUID_PATTERN.test(value)) {
      throw new InvalidCardIdError(value);
    }

    return new CardId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CardId): boolean {
    return this._value === other._value;
  }
}
