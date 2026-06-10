import { resolveTransfermarktLeagueLogoUrl, translateLeagueName } from '@draft-io/shared-utils';

import type { League } from '../../domain/entities/league.entity';

export interface LeagueSummaryResponse {
  readonly id: string;
  readonly provider: string | null;
  readonly externalId: string | null;
  readonly name: string;
  readonly country: string | null;
  readonly logoUrl: string | null;
}

export function toLeagueSummary(league: League): LeagueSummaryResponse {
  const externalId = league.externalReference?.externalId ?? null;

  return {
    id: league.id.value,
    provider: league.externalReference?.provider ?? null,
    externalId,
    name: translateLeagueName(league.name.value, externalId),
    country: league.country,
    logoUrl: resolveTransfermarktLeagueLogoUrl(league.logoUrl, externalId),
  };
}

export function toLeagueSummaryList(leagues: readonly League[]): readonly LeagueSummaryResponse[] {
  return leagues.map((league) => toLeagueSummary(league));
}
