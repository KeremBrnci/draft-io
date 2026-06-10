import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidStartingElevenError } from '../errors/team.errors';

const SQUAD_SIZE = 11;

interface StartingElevenProps {
  readonly playerIds: readonly (string | null)[];
}

/**
 * Represents the 11 starting lineup slots for a team.
 * Each slot holds a **card ID** reference (future) or null if unassigned.
 * Property name `playerIds` is legacy — values will be Card UUIDs after migration.
 */
export class StartingEleven extends ValueObject<StartingElevenProps> {
  private constructor(props: StartingElevenProps) {
    super(props);
  }

  static createEmpty(): StartingEleven {
    return new StartingEleven({
      playerIds: Array.from<string | null>({ length: SQUAD_SIZE }).fill(null),
    });
  }

  static create(playerIds: readonly (string | null)[]): StartingEleven {
    if (playerIds.length !== SQUAD_SIZE) {
      throw new InvalidStartingElevenError();
    }

    return new StartingEleven({ playerIds: [...playerIds] });
  }

  get playerIds(): readonly (string | null)[] {
    return this.props.playerIds;
  }

  get assignedCount(): number {
    return this.props.playerIds.filter((id) => id !== null).length;
  }
}
