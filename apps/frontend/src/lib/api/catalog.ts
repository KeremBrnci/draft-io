import { apiGet } from './client';

export interface LeagueSummaryDto {
  readonly id: string;
  readonly name: string;
  readonly country: string | null;
  readonly logoUrl: string | null;
}

export interface TeamSummaryDto {
  readonly id: string;
  readonly name: string;
  readonly country: string | null;
  readonly leagueId: string | null;
  readonly logoUrl: string | null;
}

export function listLeagues(): Promise<readonly LeagueSummaryDto[]> {
  return apiGet<readonly LeagueSummaryDto[]>('/leagues');
}

export function listTeams(leagueId?: string): Promise<readonly TeamSummaryDto[]> {
  const path =
    leagueId !== undefined && leagueId.length > 0
      ? `/teams?leagueId=${encodeURIComponent(leagueId)}`
      : '/teams';

  return apiGet<readonly TeamSummaryDto[]>(path);
}
