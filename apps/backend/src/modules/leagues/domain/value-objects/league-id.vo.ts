import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidLeagueIdError } from '../errors/league.errors';

interface LeagueIdProps {
  readonly value: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class LeagueId extends ValueObject<LeagueIdProps> {
  private constructor(props: LeagueIdProps) {
    super(props);
  }

  static create(value: string): LeagueId {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidLeagueIdError(value);
    }

    return new LeagueId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
