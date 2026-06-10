import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidLobbyCodeError } from '../errors/lobby.errors';

interface LobbyCodeProps {
  readonly value: string;
}

const CODE_PATTERN = /^[A-Z2-9]{6}$/;

export class LobbyCode extends ValueObject<LobbyCodeProps> {
  private constructor(props: LobbyCodeProps) {
    super(props);
  }

  static create(value: string): LobbyCode {
    const normalized = value.trim().toUpperCase();

    if (!CODE_PATTERN.test(normalized)) {
      throw new InvalidLobbyCodeError(value);
    }

    return new LobbyCode({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }
}
