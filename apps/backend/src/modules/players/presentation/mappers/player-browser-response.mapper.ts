import type { PlayerBrowserItemDto } from '@draft-io/shared-types';

import type { PlayerBrowserItem } from '../../application/read-models/player-browser-item';

export function toPlayerBrowserItemDto(item: PlayerBrowserItem): PlayerBrowserItemDto {
  return {
    id: item.id,
    displayName: item.displayName,
    imageUrl: item.imageUrl,
    positions: item.positions,
    position: item.position,
    secondaryPositions: item.secondaryPositions,
    nationality: item.nationality,
    nationalityFlagUrl: item.nationalityFlagUrl,
    age: item.age,
    marketValue: item.marketValue,
    teamId: item.teamId,
    teamName: item.teamName,
    teamLogoUrl: item.teamLogoUrl,
    leagueId: item.leagueId,
    leagueName: item.leagueName,
    leagueLogoUrl: item.leagueLogoUrl,
    overall: item.overall,
    status: item.status,
  };
}
