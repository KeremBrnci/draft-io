import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidPlayerNameError } from '../errors/player.errors';

interface PlayerNameProps {
  readonly value: string;
}

const MAX_NAME_LENGTH = 100;

export class PlayerName extends ValueObject<PlayerNameProps> {
  private constructor(props: PlayerNameProps) {
    super(props);
  }

  static create(value: string): PlayerName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
      throw new InvalidPlayerNameError();
    }

    return new PlayerName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
