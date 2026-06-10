import type { PaginationParams } from '@draft-io/shared-types';

import type { DataQualityIssueCode } from '../enums/data-quality-issue-code';

export interface DataQualitySummary {
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
  readonly playersByCompetition: readonly { readonly leagueName: string; readonly count: number }[];
  readonly playersByPosition: readonly { readonly position: string; readonly count: number }[];
  readonly playersByNationality: readonly { readonly nationality: string; readonly count: number }[];
  readonly marketValueDistribution: readonly { readonly bucket: string; readonly count: number }[];
  readonly ageDistribution: readonly { readonly bucket: string; readonly count: number }[];
}

export interface DataQualityIssue {
  readonly playerId: string;
  readonly displayName: string;
  readonly issueCodes: readonly DataQualityIssueCode[];
}

export interface DataQualityIssuesFilter {
  readonly issueCode?: DataQualityIssueCode;
}

export interface DataQualityIssuesPage {
  readonly items: readonly DataQualityIssue[];
  readonly totalItems: number;
}

export interface DataQualityRepository {
  getSummary(): Promise<DataQualitySummary>;
  findIssues(
    filter: DataQualityIssuesFilter,
    pagination: PaginationParams,
  ): Promise<DataQualityIssuesPage>;
}

export const DATA_QUALITY_REPOSITORY = Symbol('DATA_QUALITY_REPOSITORY');
