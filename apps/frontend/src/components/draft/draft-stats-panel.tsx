import type { DraftBoardStateDto } from '@draft-io/shared-types';
import { memo } from 'react';

interface DraftStatsPanelProps {
  readonly board: DraftBoardStateDto;
}

export const DraftStatsPanel = memo(function DraftStatsPanel({
  board,
}: DraftStatsPanelProps): React.ReactElement {
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
    </aside>
  );
});
