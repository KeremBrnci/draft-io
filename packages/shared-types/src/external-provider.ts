export type ExternalProvider =
  | 'SPORTDB'
  | 'TRANSFERMARKT'
  | 'SPORTMONKS'
  | 'API_FOOTBALL'
  | 'SOFASCORE';

export const ALL_EXTERNAL_PROVIDERS: readonly ExternalProvider[] = [
  'SPORTDB',
  'TRANSFERMARKT',
  'SPORTMONKS',
  'API_FOOTBALL',
  'SOFASCORE',
] as const;
