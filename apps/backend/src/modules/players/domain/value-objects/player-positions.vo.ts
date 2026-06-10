import { ValueObject } from '../../../../common/domain/value-object';
import { Position, type PositionCode } from '../../../positions/domain/value-objects/position.vo';
import { PlayerPosition } from '../entities/player-position.entity';
import {
  DuplicatePlayerPositionError,
  PlayerMultiplePrimaryPositionsError,
  PlayerPositionsRequiredError,
  PlayerPrimaryPositionRequiredError,
} from '../errors/player-position.errors';
import type { PlayerId } from './player-id.vo';
import type { PlayerPositionId } from './player-position-id.vo';

interface PlayerPositionsProps {
  readonly assignments: readonly PlayerPosition[];
}

export interface PlayerPositionInput {
  readonly positionCode: string;
  readonly isPrimary: boolean;
}

export class PlayerPositions extends ValueObject<PlayerPositionsProps> {
  private constructor(props: PlayerPositionsProps) {
    super(props);
    validateAssignments(props.assignments);
  }

  static fromAssignments(assignments: readonly PlayerPosition[]): PlayerPositions {
    return new PlayerPositions({ assignments });
  }

  /** Maps legacy primary + secondary array into a validated position set. */
  static withPrimary(
    playerId: PlayerId,
    idFactory: () => PlayerPositionId,
    primary: Position,
    secondaryCodes: readonly PositionCode[],
  ): PlayerPositions {
    return PlayerPositions.fromPrimaryAndSecondary(
      playerId,
      idFactory,
      primary.value,
      secondaryCodes,
    );
  }

  static fromPrimaryAndSecondary(
    playerId: PlayerId,
    idFactory: () => PlayerPositionId,
    primaryCode: string,
    secondaryCodes: readonly string[],
  ): PlayerPositions {
    const seen = new Set<string>();
    const inputs: PlayerPositionInput[] = [
      { positionCode: primaryCode, isPrimary: true },
    ];

    for (const code of secondaryCodes) {
      if (seen.has(code) || code === primaryCode) {
        continue;
      }
      seen.add(code);
      inputs.push({ positionCode: code, isPrimary: false });
    }

    const assignments = inputs.map((input) =>
      PlayerPosition.create({
        id: idFactory(),
        playerId,
        position: Position.create(input.positionCode),
        isPrimary: input.isPrimary,
      }),
    );

    return PlayerPositions.fromAssignments(assignments);
  }

  get assignments(): readonly PlayerPosition[] {
    return this.props.assignments;
  }

  get primary(): Position {
    const primary = this.props.assignments.find((assignment) => assignment.isPrimary);

    if (primary === undefined) {
      throw new PlayerPrimaryPositionRequiredError();
    }

    return primary.position;
  }

  get primaryCode(): PositionCode {
    return this.primary.value;
  }

  get secondaryCodes(): readonly PositionCode[] {
    return this.props.assignments
      .filter((assignment) => !assignment.isPrimary)
      .map((assignment) => assignment.positionCode);
  }

  get allCodes(): readonly PositionCode[] {
    return this.props.assignments.map((assignment) => assignment.positionCode);
  }

  hasPosition(code: PositionCode): boolean {
    return this.allCodes.includes(code);
  }

  isPrimaryAt(code: PositionCode): boolean {
    return this.props.assignments.some(
      (assignment) => assignment.isPrimary && assignment.positionCode === code,
    );
  }

  count(): number {
    return this.props.assignments.length;
  }
}

function validateAssignments(assignments: readonly PlayerPosition[]): void {
  if (assignments.length === 0) {
    throw new PlayerPositionsRequiredError();
  }

  const primaryCount = assignments.filter((assignment) => assignment.isPrimary).length;

  if (primaryCount === 0) {
    throw new PlayerPrimaryPositionRequiredError();
  }

  if (primaryCount > 1) {
    throw new PlayerMultiplePrimaryPositionsError();
  }

  const codes = new Set<string>();

  for (const assignment of assignments) {
    const code = assignment.positionCode;

    if (codes.has(code)) {
      throw new DuplicatePlayerPositionError(code);
    }

    codes.add(code);
  }
}
