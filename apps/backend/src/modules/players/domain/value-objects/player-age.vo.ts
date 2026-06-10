import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidPlayerAgeError } from '../errors/player.errors';

interface PlayerAgeProps {
  readonly value: number;
}

const MIN_AGE = 15;
const MAX_AGE = 50;

export class PlayerAge extends ValueObject<PlayerAgeProps> {
  private constructor(props: PlayerAgeProps) {
    super(props);
  }

  static create(value: number): PlayerAge {
    if (!Number.isInteger(value) || value < MIN_AGE || value > MAX_AGE) {
      throw new InvalidPlayerAgeError(value);
    }

    return new PlayerAge({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
