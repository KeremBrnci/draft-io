import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidPositionError } from '../errors/position.errors';

export type PositionCode =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'ST';

interface PositionProps {
  readonly value: PositionCode;
}

export const ALL_POSITION_CODES: readonly PositionCode[] = [
  'GK',
  'LB',
  'CB',
  'RB',
  'LWB',
  'RWB',
  'CDM',
  'CM',
  'CAM',
  'LM',
  'RM',
  'LW',
  'RW',
  'CF',
  'ST',
] as const;

export class Position extends ValueObject<PositionProps> {
  private constructor(props: PositionProps) {
    super(props);
  }

  static create(value: string): Position {
    if (!ALL_POSITION_CODES.includes(value as PositionCode)) {
      throw new InvalidPositionError(value);
    }

    return new Position({ value: value as PositionCode });
  }

  get value(): PositionCode {
    return this.props.value;
  }

  isGoalkeeper(): boolean {
    return this.props.value === 'GK';
  }
}
