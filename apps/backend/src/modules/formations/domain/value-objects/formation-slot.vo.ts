import { ValueObject } from '../../../../common/domain/value-object';
import type { PositionCode } from '../../../positions/domain/value-objects/position.vo';

interface FormationSlotProps {
  readonly index: number;
  readonly label: string;
  readonly allowedPositions: readonly PositionCode[];
}

/**
 * A single slot in a formation (1 of 11).
 * Each slot defines which positions a player may occupy.
 */
export class FormationSlot extends ValueObject<FormationSlotProps> {
  private constructor(props: FormationSlotProps) {
    super(props);
  }

  static create(props: FormationSlotProps): FormationSlot {
    if (props.index < 1 || props.index > 11) {
      throw new Error(
        `Formation slot index must be between 1 and 11, received: ${String(props.index)}`,
      );
    }

    if (props.allowedPositions.length === 0) {
      throw new Error(`Formation slot ${String(props.index)} must allow at least one position`);
    }

    return new FormationSlot(props);
  }

  get index(): number {
    return this.props.index;
  }

  get label(): string {
    return this.props.label;
  }

  get allowedPositions(): readonly PositionCode[] {
    return this.props.allowedPositions;
  }

  allowsPosition(position: PositionCode): boolean {
    return this.props.allowedPositions.includes(position);
  }
}
