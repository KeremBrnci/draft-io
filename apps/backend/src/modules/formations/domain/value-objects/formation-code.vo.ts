import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidFormationCodeError } from '../errors/formation.errors';

export type FormationCodeValue =
  | '4-4-2'
  | '4-3-3'
  | '4-2-3-1'
  | '3-5-2'
  | '5-3-2'
  | '3-4-3'
  | '4-5-1'
  | '4-2-2-2'
  | '4-1-2-1-2';

interface FormationCodeProps {
  readonly value: FormationCodeValue;
}

export const ALL_FORMATION_CODES: readonly FormationCodeValue[] = [
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '3-5-2',
  '5-3-2',
  '3-4-3',
  '4-5-1',
  '4-2-2-2',
  '4-1-2-1-2',
] as const;

export class FormationCode extends ValueObject<FormationCodeProps> {
  private constructor(props: FormationCodeProps) {
    super(props);
  }

  static create(value: string): FormationCode {
    if (!ALL_FORMATION_CODES.includes(value as FormationCodeValue)) {
      throw new InvalidFormationCodeError(value);
    }

    return new FormationCode({ value: value as FormationCodeValue });
  }

  get value(): FormationCodeValue {
    return this.props.value;
  }
}
