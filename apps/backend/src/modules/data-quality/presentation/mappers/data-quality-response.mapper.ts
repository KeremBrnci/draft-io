import type { DataQualityIssueDto, DataQualitySummaryDto } from '@draft-io/shared-types';

import type {
  DataQualityIssue,
  DataQualitySummary,
} from '../../domain/repositories/data-quality.repository';

export function toDataQualitySummaryDto(summary: DataQualitySummary): DataQualitySummaryDto {
  return {
    totalPlayers: summary.totalPlayers,
    totalClubs: summary.totalClubs,
    totalCompetitions: summary.totalCompetitions,
    playersWithMarketValue: summary.playersWithMarketValue,
    playersWithoutMarketValue: summary.playersWithoutMarketValue,
    playersWithImage: summary.playersWithImage,
    playersWithoutImage: summary.playersWithoutImage,
    playersWithPosition: summary.playersWithPosition,
    playersWithoutPosition: summary.playersWithoutPosition,
    playersWithAge: summary.playersWithAge,
    playersWithoutAge: summary.playersWithoutAge,
    playersByCompetition: summary.playersByCompetition,
    playersByPosition: summary.playersByPosition,
    playersByNationality: summary.playersByNationality,
    marketValueDistribution: summary.marketValueDistribution,
    ageDistribution: summary.ageDistribution,
  };
}

export function toDataQualityIssueDto(issue: DataQualityIssue): DataQualityIssueDto {
  return {
    playerId: issue.playerId,
    displayName: issue.displayName,
    issueCodes: issue.issueCodes,
  };
}
