import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidTeamIdError } from '../errors/team.errors';

interface TeamIdProps {
  readonly value: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class TeamId extends ValueObject<TeamIdProps> {
  private constructor(props: TeamIdProps) {
    super(props);
  }

  static create(value: string): TeamId {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidTeamIdError(value);
    }

    return new TeamId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
