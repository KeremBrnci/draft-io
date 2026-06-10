import { ValueObject } from '../../../../common/domain/value-object';
import {
  ExternalProvider,
  parseExternalProvider,
} from '../../../../core/external-reference/external-provider';
import { InvalidTeamExternalReferenceError } from '../errors/team.errors';

interface ExternalReferenceProps {
  readonly provider: ExternalProvider;
  readonly externalId: string;
}

export class TeamExternalReference extends ValueObject<ExternalReferenceProps> {
  private constructor(props: ExternalReferenceProps) {
    super(props);
  }

  static create(provider: ExternalProvider | string, externalId: string): TeamExternalReference {
    const trimmed = externalId.trim();
    const parsedProvider =
      typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    if (trimmed.length === 0) {
      throw new InvalidTeamExternalReferenceError();
    }

    return new TeamExternalReference({ provider: parsedProvider, externalId: trimmed });
  }

  get provider(): ExternalProvider {
    return this.props.provider;
  }

  get externalId(): string {
    return this.props.externalId;
  }
}
