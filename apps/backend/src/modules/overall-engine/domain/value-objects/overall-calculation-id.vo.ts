import { v4 as uuidv4 } from 'uuid';

import { ValueObject } from '../../../../common/domain/value-object';

interface OverallCalculationIdProps {
  readonly value: string;
}

export class OverallCalculationId extends ValueObject<OverallCalculationIdProps> {
  private constructor(props: OverallCalculationIdProps) {
    super(props);
  }

  static create(value: string): OverallCalculationId {
    return new OverallCalculationId({ value });
  }

  static generate(): OverallCalculationId {
    return new OverallCalculationId({ value: uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
