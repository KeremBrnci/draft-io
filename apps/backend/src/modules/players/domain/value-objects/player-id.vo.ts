import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidPlayerIdError } from '../errors/player.errors';

interface PlayerIdProps {
  readonly value: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PlayerId extends ValueObject<PlayerIdProps> {
  private constructor(props: PlayerIdProps) {
    super(props);
  }

  static create(value: string): PlayerId {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidPlayerIdError(value);
    }

    return new PlayerId({ value });
  }

  static generate(value: string): PlayerId {
    return PlayerId.create(value);
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
