import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidLobbyNameError } from '../errors/lobby.errors';

interface LobbyNameProps {
  readonly value: string;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 80;

export class LobbyName extends ValueObject<LobbyNameProps> {
  private constructor(props: LobbyNameProps) {
    super(props);
  }

  static create(value: string): LobbyName {
    const trimmed = value.trim();

    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new InvalidLobbyNameError(value);
    }

    return new LobbyName({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
