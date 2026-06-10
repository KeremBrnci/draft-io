import type { ExternalProvider } from '../../../../core/external-reference/external-provider';

export interface ExternalCountryRecord {
  readonly provider: ExternalProvider;
  readonly externalId: string;
  readonly name: string;
}
