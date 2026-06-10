import { v4 as uuidv4 } from 'uuid';

import { ValueObject } from '../../../../common/domain/value-object';

interface PlayerMetricsIdProps {
  readonly value: string;
}

export class PlayerMetricsId extends ValueObject<PlayerMetricsIdProps> {
  private constructor(props: PlayerMetricsIdProps) {
    super(props);
  }

  static create(value: string): PlayerMetricsId {
    return new PlayerMetricsId({ value });
  }

  static generate(): PlayerMetricsId {
    return new PlayerMetricsId({ value: uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
