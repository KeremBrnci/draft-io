import { v4 as uuidv4 } from 'uuid';

export class CoachId {
  private constructor(private readonly _value: string) {}

  static create(value: string): CoachId {
    return new CoachId(value);
  }

  static generate(value: string = uuidv4()): CoachId {
    return new CoachId(value);
  }

  get value(): string {
    return this._value;
  }
}
