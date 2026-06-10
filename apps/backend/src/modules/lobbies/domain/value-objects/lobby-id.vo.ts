import { randomUUID } from 'node:crypto';

import { ValueObject } from '../../../../common/domain/value-object';

interface LobbyIdProps {
  readonly value: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class LobbyId extends ValueObject<LobbyIdProps> {
  private constructor(props: LobbyIdProps) {
    super(props);
  }

  static create(value: string): LobbyId {
    if (!UUID_PATTERN.test(value.trim())) {
      throw new Error(`Invalid lobby id: ${value}`);
    }

    return new LobbyId({ value: value.trim() });
  }

  static generate(): LobbyId {
    return new LobbyId({ value: randomUUID() });
  }

  get value(): string {
    return this.props.value;
  }
}
