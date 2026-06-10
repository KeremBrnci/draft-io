import { ValueObject } from '../../../../common/domain/value-object';
import {
  ExternalProvider,
  parseExternalProvider,
} from '../../../../core/external-reference/external-provider';
import { InvalidExternalReferenceError } from '../errors/player.errors';

interface ExternalReferenceProps {
  readonly provider: ExternalProvider;
  readonly externalId: string;
}

const EXTERNAL_ID_MAX_LENGTH = 128;

export class ExternalReference extends ValueObject<ExternalReferenceProps> {
  private constructor(props: ExternalReferenceProps) {
    super(props);
  }

  static create(provider: ExternalProvider | string, externalId: string): ExternalReference {
    const trimmed = externalId.trim();
    const parsedProvider =
      typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    if (trimmed.length === 0 || trimmed.length > EXTERNAL_ID_MAX_LENGTH) {
      throw new InvalidExternalReferenceError();
    }

    return new ExternalReference({ provider: parsedProvider, externalId: trimmed });
  }

  get provider(): ExternalProvider {
    return this.props.provider;
  }

  get externalId(): string {
    return this.props.externalId;
  }
}
