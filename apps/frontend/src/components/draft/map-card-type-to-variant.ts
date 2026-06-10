import type { CardVariant } from '@draft-io/shared-types';

import { CARD_VARIANT_THEMES } from '@/components/cards/card-variant-themes';

export function mapCardTypeToVariant(cardTypeCode: string): CardVariant {
  const normalized = cardTypeCode.trim().toLowerCase();
  if (normalized in CARD_VARIANT_THEMES) {
    return normalized as CardVariant;
  }

  return 'base';
}
