export type DataQualityIssueCodeDto =
  | 'MISSING_MARKET_VALUE'
  | 'MISSING_POSITION'
  | 'MISSING_AGE'
  | 'MISSING_IMAGE'
  | 'MISSING_CLUB'
  | 'MISSING_COMPETITION'
  | 'DUPLICATE_PROVIDER_EXTERNAL_ID'
  | 'INVALID_MARKET_VALUE';

export interface DistributionBucketDto {
  readonly bucket: string;
  readonly count: number;
}

export interface LabeledCountDto {
  readonly count: number;
}

export interface CompetitionCountDto extends LabeledCountDto {
  readonly leagueName: string;
}

export interface PositionCountDto extends LabeledCountDto {
  readonly position: string;
}

export interface NationalityCountDto extends LabeledCountDto {
  readonly nationality: string;
}

export interface DataQualitySummaryDto {
  readonly totalPlayers: number;
  readonly totalClubs: number;
  readonly totalCompetitions: number;
  readonly playersWithMarketValue: number;
  readonly playersWithoutMarketValue: number;
  readonly playersWithImage: number;
  readonly playersWithoutImage: number;
  readonly playersWithPosition: number;
  readonly playersWithoutPosition: number;
  readonly playersWithAge: number;
  readonly playersWithoutAge: number;
  readonly playersByCompetition: readonly CompetitionCountDto[];
  readonly playersByPosition: readonly PositionCountDto[];
  readonly playersByNationality: readonly NationalityCountDto[];
  readonly marketValueDistribution: readonly DistributionBucketDto[];
  readonly ageDistribution: readonly DistributionBucketDto[];
}

export interface DataQualityIssueDto {
  readonly playerId: string;
  readonly displayName: string;
  readonly issueCodes: readonly DataQualityIssueCodeDto[];
}
