import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidPlayerPositionIdError } from '../errors/player-position.errors';

interface PlayerPositionIdProps {
  readonly value: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PlayerPositionId extends ValueObject<PlayerPositionIdProps> {
  private constructor(props: PlayerPositionIdProps) {
    super(props);
  }

  static create(value: string): PlayerPositionId {
    if (!UUID_PATTERN.test(value)) {
      throw new InvalidPlayerPositionIdError(value);
    }

    return new PlayerPositionId({ value });
  }

  static generate(value: string): PlayerPositionId {
    return PlayerPositionId.create(value);
  }

  get value(): string {
    return this.props.value;
  }
}
