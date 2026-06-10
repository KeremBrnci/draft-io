import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidDisplayNameError } from '../errors/player.errors';

interface DisplayNameProps {
  readonly value: string;
}

const MAX_LENGTH = 120;

export class DisplayName extends ValueObject<DisplayNameProps> {
  private constructor(props: DisplayNameProps) {
    super(props);
  }

  static create(value: string): DisplayName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidDisplayNameError();
    }

    return new DisplayName({ value: trimmed });
  }

  static fromParts(firstName: PersonNameLike, lastName: PersonNameLike): DisplayName {
    return DisplayName.create(`${firstName.value} ${lastName.value}`);
  }

  get value(): string {
    return this.props.value;
  }
}

interface PersonNameLike {
  readonly value: string;
}
