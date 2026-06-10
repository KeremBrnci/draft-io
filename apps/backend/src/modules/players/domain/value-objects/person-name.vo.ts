import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidPersonNameError } from '../errors/player.errors';

interface PersonNameProps {
  readonly value: string;
}

const MAX_LENGTH = 100;

export class PersonName extends ValueObject<PersonNameProps> {
  private constructor(props: PersonNameProps) {
    super(props);
  }

  static create(value: string): PersonName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidPersonNameError();
    }

    return new PersonName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
