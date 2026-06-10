import { InvalidBirthDateError } from '../errors/player.errors';

export class BirthDate {
  private constructor(private readonly _value: Date) {}

  static create(value: Date): BirthDate {
    if (Number.isNaN(value.getTime())) {
      throw new InvalidBirthDateError('Invalid date');
    }

    const now = new Date();

    if (value.getTime() > now.getTime()) {
      throw new InvalidBirthDateError('Birth date cannot be in the future');
    }

    return new BirthDate(value);
  }

  /** Approximate birth year from provider age when exact date is unknown. */
  static fromAge(age: number, referenceDate: Date = new Date()): BirthDate {
    if (!Number.isInteger(age) || age < 14 || age > 50) {
      throw new InvalidBirthDateError(`Cannot derive birth date from age: ${String(age)}`);
    }

    const year = referenceDate.getUTCFullYear() - age;
    return BirthDate.create(new Date(Date.UTC(year, 0, 1)));
  }

  get value(): Date {
    return this._value;
  }
}
