import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidTeamShortNameError } from '../errors/team.errors';

interface TeamShortNameProps {
  readonly value: string;
}

const MAX_LENGTH = 32;

export class TeamShortName extends ValueObject<TeamShortNameProps> {
  private constructor(props: TeamShortNameProps) {
    super(props);
  }

  static create(value: string): TeamShortName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidTeamShortNameError();
    }

    return new TeamShortName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
