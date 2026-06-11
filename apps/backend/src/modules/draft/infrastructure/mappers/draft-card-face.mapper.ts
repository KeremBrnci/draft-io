import {
  buildTransfermarktNationalityFlagUrl,
  resolveTransfermarktLeagueLogoUrl,
  resolveTransfermarktPlayerImageUrl,
  resolveTransfermarktTeamLogoUrl,
  translateLeagueName,
  translateNationality,
  translateTeamName,
} from '@draft-io/shared-utils';

import type { DraftPoolCard } from '../../domain/models/draft-pool-card';

export interface DraftCardFace {
  readonly cardId: string;
  readonly playerId: string;
  readonly cardTypeCode: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly rating: number;
  readonly subtitle: string;
  readonly nationalityFlagUrl: string | null;
  readonly nationalityLabel: string;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
}

export function toDraftCardFace(card: DraftPoolCard, positionCode: string): DraftCardFace {
  return {
    cardId: card.cardId,
    playerId: card.playerId,
    cardTypeCode: card.cardTypeCode,
    displayName: card.displayName,
    imageUrl: card.imageUrl,
    rating: card.overall,
    subtitle: positionCode,
    nationalityFlagUrl: card.nationalityFlagUrl,
    nationalityLabel: translateNationality(card.nationality),
    teamName: card.teamName,
    teamLogoUrl: card.teamLogoUrl,
    leagueName: card.leagueName,
    leagueLogoUrl: card.leagueLogoUrl,
  };
}

export function resolvePlayerPresentation(input: {
  readonly imageUrl: string | null;
  readonly externalId: string | null;
  readonly nationality: string;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly teamExternalId: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
  readonly leagueExternalId: string | null;
}): {
  readonly imageUrl: string | null;
  readonly nationalityFlagUrl: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
} {
  return {
    imageUrl: resolveTransfermarktPlayerImageUrl(input.imageUrl, input.externalId),
    nationalityFlagUrl: buildTransfermarktNationalityFlagUrl(input.nationality),
    teamName:
      input.teamName === null ? null : translateTeamName(input.teamName, input.teamExternalId),
    teamLogoUrl: resolveTransfermarktTeamLogoUrl(input.teamLogoUrl, input.teamExternalId),
    leagueName:
      input.leagueName === null
        ? null
        : translateLeagueName(input.leagueName, input.leagueExternalId),
    leagueLogoUrl: resolveTransfermarktLeagueLogoUrl(input.leagueLogoUrl, input.leagueExternalId),
  };
}
