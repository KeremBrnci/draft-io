import { InvalidReferenceCodeError } from '../errors/card.errors';

const CODE_PATTERN = /^[A-Z][A-Z0-9_]{0,63}$/;

export class ReferenceCode {
  private constructor(private readonly _value: string) {}

  static create(value: string): ReferenceCode {
    const normalized = value.trim().toUpperCase();

    if (!CODE_PATTERN.test(normalized)) {
      throw new InvalidReferenceCodeError(value);
    }

    return new ReferenceCode(normalized);
  }

  get value(): string {
    return this._value;
  }
}
