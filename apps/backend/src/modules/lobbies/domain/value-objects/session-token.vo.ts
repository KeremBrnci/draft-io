import { randomUUID } from 'node:crypto';

import { ValueObject } from '../../../../common/domain/value-object';

interface SessionTokenProps {
  readonly value: string;
}

export class SessionToken extends ValueObject<SessionTokenProps> {
  private constructor(props: SessionTokenProps) {
    super(props);
  }

  static generate(): SessionToken {
    return new SessionToken({ value: randomUUID() });
  }

  static reconstitute(value: string): SessionToken {
    return new SessionToken({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
