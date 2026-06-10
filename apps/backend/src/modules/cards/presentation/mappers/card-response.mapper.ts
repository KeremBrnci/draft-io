import type { CardSummary } from '@draft-io/shared-types';

import type { CardDetail } from '../../application/read-models/card-detail';

export function toCardSummary(detail: CardDetail): CardSummary {
  const { card } = detail;

  return {
    id: card.id.value,
    playerId: card.playerId,
    cardTypeId: card.cardTypeId.value,
    cardTypeCode: detail.cardTypeCode,
    cardRarityId: card.cardRarityId.value,
    cardRarityCode: detail.cardRarityCode,
    cardTemplateId: card.cardTemplateId.value,
    cardTemplateName: detail.cardTemplateName,
    overall: card.overall.value,
    overallSource: card.overallSource,
    cardVersion: card.cardVersion.value,
    releaseDate: card.releaseDate?.toISOString().slice(0, 10) ?? null,
    isActive: card.isActive,
  };
}

export function toCardSummaryList(details: readonly CardDetail[]): readonly CardSummary[] {
  return details.map((detail) => toCardSummary(detail));
}
