import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidParticipantDisplayNameError } from '../errors/lobby.errors';

interface ParticipantDisplayNameProps {
  readonly value: string;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 40;

export class ParticipantDisplayName extends ValueObject<ParticipantDisplayNameProps> {
  private constructor(props: ParticipantDisplayNameProps) {
    super(props);
  }

  static create(value: string): ParticipantDisplayName {
    const trimmed = value.trim();

    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new InvalidParticipantDisplayNameError(value);
    }

    return new ParticipantDisplayName({ value: trimmed });
  }

  equals(other: ParticipantDisplayName): boolean {
    return this.props.value.toLocaleLowerCase('tr') === other.props.value.toLocaleLowerCase('tr');
  }

  get value(): string {
    return this.props.value;
  }
}
