import { ValueObject } from '../../../../common/domain/value-object';
import {
  ExternalProvider,
  parseExternalProvider,
} from '../../../../core/external-reference/external-provider';
import { InvalidLeagueExternalReferenceError } from '../errors/league.errors';

interface ExternalReferenceProps {
  readonly provider: ExternalProvider;
  readonly externalId: string;
}

export class LeagueExternalReference extends ValueObject<ExternalReferenceProps> {
  private constructor(props: ExternalReferenceProps) {
    super(props);
  }

  static create(provider: ExternalProvider | string, externalId: string): LeagueExternalReference {
    const trimmed = externalId.trim();
    const parsedProvider =
      typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    if (trimmed.length === 0) {
      throw new InvalidLeagueExternalReferenceError();
    }

    return new LeagueExternalReference({ provider: parsedProvider, externalId: trimmed });
  }

  get provider(): ExternalProvider {
    return this.props.provider;
  }

  get externalId(): string {
    return this.props.externalId;
  }
}
