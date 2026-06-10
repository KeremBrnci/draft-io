'use client';

import { duelSharePct, type LiveMatchStats } from '@/lib/match-live-stats';

interface MatchLiveStatsPanelProps {
  readonly homeName: string;
  readonly awayName: string;
  readonly stats: LiveMatchStats;
}

export function MatchLiveStatsPanel({
  homeName,
  awayName,
  stats,
}: MatchLiveStatsPanelProps): React.ReactElement {
  return (
    <section className="league-duel-stats" aria-label="Maç istatistikleri">
      <header className="league-duel-stats__header">Önemli</header>

      <DuelStatRow
        label="Gol beklentisi (xG)"
        homeValue={stats.homeXg.toFixed(2)}
        awayValue={stats.awayXg.toFixed(2)}
        homeRaw={stats.homeXg}
        awayRaw={stats.awayXg}
      />
      <DuelStatRow
        label="Topa sahip olma"
        homeValue={`${stats.homePossession}%`}
        awayValue={`${stats.awayPossession}%`}
        homeRaw={stats.homePossession}
        awayRaw={stats.awayPossession}
      />
      <DuelStatRow
        label="Toplam şut"
        homeValue={String(stats.homeShots)}
        awayValue={String(stats.awayShots)}
        homeRaw={stats.homeShots}
        awayRaw={stats.awayShots}
      />
      <DuelStatRow
        label="İsabetli şut"
        homeValue={String(stats.homeShotsOnTarget)}
        awayValue={String(stats.awayShotsOnTarget)}
        homeRaw={stats.homeShotsOnTarget}
        awayRaw={stats.awayShotsOnTarget}
      />
      <DuelStatRow
        label="Net gol pozisyonu"
        homeValue={String(stats.homeBigChances)}
        awayValue={String(stats.awayBigChances)}
        homeRaw={stats.homeBigChances}
        awayRaw={stats.awayBigChances}
      />
      <DuelStatRow
        label="Kornerler"
        homeValue={String(stats.homeCorners)}
        awayValue={String(stats.awayCorners)}
        homeRaw={stats.homeCorners}
        awayRaw={stats.awayCorners}
      />

      <div className="league-duel-stats__teams" aria-hidden>
        <span>{homeName}</span>
        <span>{awayName}</span>
      </div>
    </section>
  );
}

function DuelStatRow({
  label,
  homeValue,
  awayValue,
  homeRaw,
  awayRaw,
}: {
  readonly label: string;
  readonly homeValue: string;
  readonly awayValue: string;
  readonly homeRaw: number;
  readonly awayRaw: number;
}): React.ReactElement {
  const share = duelSharePct(homeRaw, awayRaw);
  const homeLeads = homeRaw >= awayRaw;

  return (
    <div className="league-duel-stat">
      <div className="league-duel-stat__values">
        <span
          className={`league-duel-stat__home${homeLeads && homeRaw !== awayRaw ? ' league-duel-stat__value--leading' : ''}`}
        >
          {homeValue}
        </span>
        <span className="league-duel-stat__label">{label}</span>
        <span
          className={`league-duel-stat__away${!homeLeads && homeRaw !== awayRaw ? ' league-duel-stat__value--leading' : ''}`}
        >
          {awayValue}
        </span>
      </div>
      <div className="league-duel-stat__bar" role="presentation">
        {share.home > 0 ? (
          <div className="league-duel-stat__bar-home" style={{ width: `${share.home}%` }} />
        ) : null}
        {share.away > 0 ? (
          <div className="league-duel-stat__bar-away" style={{ width: `${share.away}%` }} />
        ) : null}
      </div>
    </div>
  );
}
