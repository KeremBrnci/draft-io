import type { CardFaceData, DraftCardFaceDto } from '@draft-io/shared-types';

export function mapDraftCardFace(card: DraftCardFaceDto): CardFaceData {
  return {
    displayName: card.displayName,
    imageUrl: card.imageUrl,
    rating: card.rating,
    subtitle: card.subtitle,
    nationalityFlagUrl: card.nationalityFlagUrl,
    ...(card.nationalityLabel !== undefined ? { nationalityLabel: card.nationalityLabel } : {}),
    teamName: card.teamName,
    teamLogoUrl: card.teamLogoUrl,
    leagueName: card.leagueName,
    leagueLogoUrl: card.leagueLogoUrl,
  };
}
