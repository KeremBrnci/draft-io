import { InvalidCardOverallError } from '../errors/card.errors';

const MIN_OVERALL = 1;
const MAX_OVERALL = 99;

export class CardOverall {
  private constructor(private readonly _value: number) {}

  static create(value: number): CardOverall {
    if (!Number.isInteger(value) || value < MIN_OVERALL || value > MAX_OVERALL) {
      throw new InvalidCardOverallError(value);
    }

    return new CardOverall(value);
  }

  get value(): number {
    return this._value;
  }
}
