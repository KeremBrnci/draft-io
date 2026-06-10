import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidOverallRatingError } from '../errors/player.errors';

interface OverallRatingProps {
  readonly value: number;
}

const MIN_RATING = 1;
const MAX_RATING = 99;

export class OverallRating extends ValueObject<OverallRatingProps> {
  private constructor(props: OverallRatingProps) {
    super(props);
  }

  static create(value: number): OverallRating {
    if (!Number.isInteger(value) || value < MIN_RATING || value > MAX_RATING) {
      throw new InvalidOverallRatingError(value);
    }

    return new OverallRating({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
