import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidTeamNameError } from '../errors/team.errors';

interface TeamNameProps {
  readonly value: string;
}

const MAX_NAME_LENGTH = 100;

export class TeamName extends ValueObject<TeamNameProps> {
  private constructor(props: TeamNameProps) {
    super(props);
  }

  static create(value: string): TeamName {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
      throw new InvalidTeamNameError();
    }

    return new TeamName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
