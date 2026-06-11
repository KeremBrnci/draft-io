'use client';

import type { MatchMomentumDto } from '@draft-io/shared-types';

import './match-live-pitch.css';

interface MatchMomentumBarProps {
  readonly homeName: string;
  readonly awayName: string;
  readonly momentum: MatchMomentumDto | null;
}

export function MatchMomentumBar({
  homeName,
  awayName,
  momentum,
}: MatchMomentumBarProps): React.ReactElement | null {
  if (momentum === null) {
    return null;
  }

  return (
    <div className="match-momentum" aria-label="Maç momentumu">
      <div className="match-momentum__header">
        <span>{homeName}</span>
        <span className="match-momentum__title">Momentum</span>
        <span>{awayName}</span>
      </div>
      <div className="match-momentum__track">
        <div
          className="match-momentum__home"
          style={{ width: `${momentum.home}%` }}
          title={`${momentum.home}%`}
        />
        <div
          className="match-momentum__away"
          style={{ width: `${momentum.away}%` }}
          title={`${momentum.away}%`}
        />
      </div>
      <div className="match-momentum__trend">
        <span className={trendClass(momentum.homeTrend)}>{formatTrend(momentum.homeTrend)}</span>
        <span>Son 5 dk</span>
        <span className={trendClass(momentum.awayTrend)}>{formatTrend(momentum.awayTrend)}</span>
      </div>
    </div>
  );
}

function formatTrend(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

function trendClass(value: number): string {
  if (value > 0) {
    return 'match-momentum__trend--up';
  }
  if (value < 0) {
    return 'match-momentum__trend--down';
  }
  return '';
}
