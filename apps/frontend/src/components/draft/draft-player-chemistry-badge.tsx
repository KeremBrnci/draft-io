import { memo } from 'react';

import { formatDraftPlayerChemistrySources } from './format-draft-player-chemistry-sources';

export type DraftPlayerChemistryTier = 'none' | 'low' | 'mid' | 'high' | 'max';

export function resolveDraftPlayerChemistryTier(chemistry: number): DraftPlayerChemistryTier {
  if (chemistry <= 0) {
    return 'none';
  }

  if (chemistry >= 5) {
    return 'max';
  }

  if (chemistry >= 3) {
    return 'high';
  }

  if (chemistry >= 2) {
    return 'mid';
  }

  return 'low';
}

interface DraftPlayerChemistryBadgeProps {
  readonly chemistry: number;
  readonly sources?: readonly ('club' | 'nation' | 'league')[];
  readonly className?: string;
  readonly showZero?: boolean;
  readonly suffix?: string;
}

export const DraftPlayerChemistryBadge = memo(function DraftPlayerChemistryBadge({
  chemistry,
  sources = [],
  className,
  showZero = false,
  suffix,
}: DraftPlayerChemistryBadgeProps): React.ReactElement | null {
  if (chemistry <= 0 && !showZero) {
    return null;
  }

  const tier = chemistry <= 0 && showZero ? 'none' : resolveDraftPlayerChemistryTier(chemistry);
  const sourceLabel = formatDraftPlayerChemistrySources(sources);
  const title =
    sourceLabel.length > 0 ? `+${chemistry} kimya · ${sourceLabel}` : `+${chemistry} kimya`;

  return (
    <span
      className={['draft-player-chem', `draft-player-chem--${tier}`, className]
        .filter(Boolean)
        .join(' ')}
      title={title}
      aria-label={title}
    >
      +{chemistry}
      {suffix !== undefined ? ` ${suffix}` : null}
    </span>
  );
});
