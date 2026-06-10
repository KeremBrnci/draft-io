export const ImportJobType = {
  COMPETITION: 'COMPETITION',
  CLUBS: 'CLUBS',
  PLAYERS: 'PLAYERS',
  ENRICHMENT: 'ENRICHMENT',
  PIPELINE: 'PIPELINE',
} as const;

export type ImportJobType = (typeof ImportJobType)[keyof typeof ImportJobType];
