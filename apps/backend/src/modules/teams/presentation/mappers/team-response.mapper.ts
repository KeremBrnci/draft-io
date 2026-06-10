import { resolveTransfermarktTeamLogoUrl, translateTeamName } from '@draft-io/shared-utils';

import type { Team } from '../../domain/entities/team.entity';

export interface TeamSummaryResponse {
  readonly id: string;
  readonly provider: string | null;
  readonly externalId: string | null;
  readonly name: string;
  readonly shortName: string | null;
  readonly country: string | null;
  readonly leagueId: string | null;
  readonly logoUrl: string | null;
  readonly formationCode: string | null;
  readonly manager: string | null;
  readonly chemistryScore: number | null;
  readonly teamOverall: number | null;
}

export function toTeamSummary(team: Team): TeamSummaryResponse {
  const externalId = team.externalReference?.externalId ?? null;

  return {
    id: team.id.value,
    provider: team.externalReference?.provider ?? null,
    externalId,
    name: translateTeamName(team.name.value, externalId),
    shortName: team.shortName?.value ?? null,
    country: team.country,
    leagueId: team.leagueId,
    logoUrl: resolveTransfermarktTeamLogoUrl(team.logoUrl, externalId),
    formationCode: team.formationCode,
    manager: team.manager,
    chemistryScore: team.chemistryScore,
    teamOverall: team.teamOverall,
  };
}

export function toTeamSummaryList(teams: readonly Team[]): readonly TeamSummaryResponse[] {
  return teams.map((team) => toTeamSummary(team));
}
