/**
 * Shared kernel: external data provider identifiers.
 * Used by players/teams/leagues domain and data-providers infrastructure.
 * Must not import feature modules.
 */
export enum ExternalProvider {
  SPORTDB = 'SPORTDB',
  TRANSFERMARKT = 'TRANSFERMARKT',
  SPORTMONKS = 'SPORTMONKS',
  API_FOOTBALL = 'API_FOOTBALL',
  SOFASCORE = 'SOFASCORE',
}

export const ALL_EXTERNAL_PROVIDERS: readonly ExternalProvider[] = [
  ExternalProvider.SPORTDB,
  ExternalProvider.TRANSFERMARKT,
  ExternalProvider.SPORTMONKS,
  ExternalProvider.API_FOOTBALL,
  ExternalProvider.SOFASCORE,
] as const;

export function isExternalProvider(value: string): value is ExternalProvider {
  return ALL_EXTERNAL_PROVIDERS.includes(value as ExternalProvider);
}

export function parseExternalProvider(value: string): ExternalProvider {
  if (!isExternalProvider(value)) {
    throw new Error(`Unknown external provider: ${value}`);
  }

  return value;
}
