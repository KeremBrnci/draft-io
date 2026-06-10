import type { ExternalTeamRecord } from '../models/external-team-record';
import type { TeamSearchResult } from '../models/team-search-result';

export interface TeamProvider {
  searchTeams(query: string): Promise<readonly TeamSearchResult[]>;
  fetchBySlugAndId(slug: string, externalId: string): Promise<ExternalTeamRecord | null>;
  listClubsByCompetition?(competitionExternalId: string): Promise<readonly TeamSearchResult[]>;
}

export const TEAM_PROVIDER = Symbol('TEAM_PROVIDER');
