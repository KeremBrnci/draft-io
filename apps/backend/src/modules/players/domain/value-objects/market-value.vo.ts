import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidMarketValueError } from '../errors/player.errors';

interface MarketValueProps {
  readonly value: number;
}

export class MarketValue extends ValueObject<MarketValueProps> {
  private constructor(props: MarketValueProps) {
    super(props);
  }

  static create(value: number): MarketValue {
    if (!Number.isFinite(value) || value < 0) {
      throw new InvalidMarketValueError(value);
    }

    return new MarketValue({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
