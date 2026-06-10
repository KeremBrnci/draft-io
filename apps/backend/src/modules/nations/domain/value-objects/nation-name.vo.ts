import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidNationNameError } from '../errors/nation.errors';

interface NationNameProps {
  readonly value: string;
}

const MAX_NAME_LENGTH = 100;

export class NationName extends ValueObject<NationNameProps> {
  private constructor(props: NationNameProps) {
    super(props);
  }

  static create(value: string): NationName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
      throw new InvalidNationNameError();
    }

    return new NationName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
