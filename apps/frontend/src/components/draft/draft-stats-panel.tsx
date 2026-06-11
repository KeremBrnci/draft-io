import type { DraftBoardStateDto } from '@draft-io/shared-types';
import { memo, useMemo } from 'react';

import { DraftPlayerChemistryBadge } from './draft-player-chemistry-badge';

interface DraftStatsPanelProps {
  readonly board: DraftBoardStateDto;
}

export const DraftStatsPanel = memo(function DraftStatsPanel({
  board,
}: DraftStatsPanelProps): React.ReactElement {
  const draftedSlots = useMemo(
    () =>
      board.slots
        .filter((slot) => slot.card !== null)
        .sort((left, right) => {
          if (right.playerChemistry !== left.playerChemistry) {
            return right.playerChemistry - left.playerChemistry;
          }

          return (right.card?.rating ?? 0) - (left.card?.rating ?? 0);
        }),
    [board.slots],
  );

  return (
    <aside className="draft-stats-panel" aria-label="Takım istatistikleri">
      <div className="draft-stats-panel__grid">
        <div className="draft-stat">
          <span className="draft-stat__label">Ort. Overall</span>
          <strong className="draft-stat__value">{board.teamAverageOverall.toFixed(1)}</strong>
        </div>
        <div className="draft-stat">
          <span className="draft-stat__label">Kimya</span>
          <strong className="draft-stat__value">{board.chemistry.teamChemistry}</strong>
        </div>
        <div className="draft-stat">
          <span className="draft-stat__label">Maç Gücü</span>
          <strong className="draft-stat__value">{board.matchPower.matchPower.toFixed(1)}</strong>
        </div>
        <div className="draft-stat">
          <span className="draft-stat__label">Kadro</span>
          <strong className="draft-stat__value">
            {board.pickCount}/{board.rosterSize}
          </strong>
        </div>
      </div>

      <div className="draft-stats-panel__chemistry">
        <span>Kimya dağılımı</span>
        <ul>
          <li>
            <em>Kulüp</em>
            <strong>{board.chemistry.breakdown.club}</strong>
          </li>
          <li>
            <em>Milliyet</em>
            <strong>{board.chemistry.breakdown.nation}</strong>
          </li>
          <li>
            <em>Lig</em>
            <strong>{board.chemistry.breakdown.league}</strong>
          </li>
        </ul>
      </div>

      {draftedSlots.length > 0 ? (
        <div className="draft-stats-panel__roster-chem">
          <span>Oyuncu kimyaları</span>
          <ul>
            {draftedSlots.map((slot) => (
              <li key={slot.slotIndex}>
                <span className="draft-stats-panel__roster-name" title={slot.card?.displayName}>
                  {slot.card?.displayName}
                </span>
                <DraftPlayerChemistryBadge
                  chemistry={slot.playerChemistry}
                  sources={slot.playerChemistrySources}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
});
