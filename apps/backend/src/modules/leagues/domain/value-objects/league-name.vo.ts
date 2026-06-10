import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidLeagueNameError } from '../errors/league.errors';

interface LeagueNameProps {
  readonly value: string;
}

const MAX_NAME_LENGTH = 100;

export class LeagueName extends ValueObject<LeagueNameProps> {
  private constructor(props: LeagueNameProps) {
    super(props);
  }

  static create(value: string): LeagueName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
      throw new InvalidLeagueNameError();
    }

    return new LeagueName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
