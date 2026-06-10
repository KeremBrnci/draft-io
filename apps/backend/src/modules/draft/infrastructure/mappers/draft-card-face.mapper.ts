import {
  buildTransfermarktNationalityFlagUrl,
  resolveTransfermarktLeagueLogoUrl,
  resolveTransfermarktPlayerImageUrl,
  translateLeagueName,
  translateNationality,
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
    leagueName: card.leagueName,
    leagueLogoUrl: card.leagueLogoUrl,
  };
}

export function resolvePlayerPresentation(input: {
  readonly imageUrl: string | null;
  readonly externalId: string | null;
  readonly nationality: string;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
  readonly leagueExternalId: string | null;
}): {
  readonly imageUrl: string | null;
  readonly nationalityFlagUrl: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
} {
  return {
    imageUrl: resolveTransfermarktPlayerImageUrl(input.imageUrl, input.externalId),
    nationalityFlagUrl: buildTransfermarktNationalityFlagUrl(input.nationality),
    leagueName:
      input.leagueName === null
        ? null
        : translateLeagueName(input.leagueName, input.leagueExternalId),
    leagueLogoUrl: resolveTransfermarktLeagueLogoUrl(input.leagueLogoUrl, input.leagueExternalId),
  };
}
