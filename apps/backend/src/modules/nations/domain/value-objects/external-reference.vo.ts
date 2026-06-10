import { ValueObject } from '../../../../common/domain/value-object';
import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { InvalidNationExternalReferenceError } from '../errors/nation.errors';

interface NationExternalReferenceProps {
  readonly provider: ExternalProvider;
  readonly externalId: string;
}

export class NationExternalReference extends ValueObject<NationExternalReferenceProps> {
  private constructor(props: NationExternalReferenceProps) {
    super(props);
  }

  static create(provider: ExternalProvider, externalId: string): NationExternalReference {
    const trimmed = externalId.trim();

    if (trimmed.length === 0) {
      throw new InvalidNationExternalReferenceError('External ID cannot be empty');
    }

    return new NationExternalReference({ provider, externalId: trimmed });
  }

  get provider(): ExternalProvider {
    return this.props.provider;
  }

  get externalId(): string {
    return this.props.externalId;
  }
}
