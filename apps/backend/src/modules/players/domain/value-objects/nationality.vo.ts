import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidNationalityError } from '../errors/player.errors';

interface NationalityProps {
  readonly value: string;
}

const MAX_LENGTH = 64;

/** ISO country code or provider nationality string */
export class Nationality extends ValueObject<NationalityProps> {
  private constructor(props: NationalityProps) {
    super(props);
  }

  static create(value: string): Nationality {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidNationalityError();
    }

    return new Nationality({ value: trimmed.toUpperCase() });
  }

  get value(): string {
    return this.props.value;
  }
}
