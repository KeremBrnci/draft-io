import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidNationIdError } from '../errors/nation.errors';

interface NationIdProps {
  readonly value: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class NationId extends ValueObject<NationIdProps> {
  private constructor(props: NationIdProps) {
    super(props);
  }

  static create(value: string): NationId {
    if (!UUID_REGEX.test(value)) {
      throw new InvalidNationIdError(value);
    }

    return new NationId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
