'use client';

import type { MatchTeamLineupDto } from '@draft-io/shared-types';

import './match-lineups.css';

interface MatchLineupsPanelProps {
  readonly homeLineup: MatchTeamLineupDto;
  readonly awayLineup: MatchTeamLineupDto;
}

function ratingClassName(rating: number): string {
  if (rating >= 8) {
    return 'match-lineup__rating match-lineup__rating--high';
  }

  if (rating < 6.5) {
    return 'match-lineup__rating match-lineup__rating--low';
  }

  return 'match-lineup__rating';
}

function formatRating(rating: number): string {
  return rating.toFixed(1);
}

function TeamLineup({ lineup }: { readonly lineup: MatchTeamLineupDto }): React.ReactElement {
  return (
    <section className="match-lineup" aria-label={`${lineup.displayName} kadrosu`}>
      <header className="match-lineup__header">
        <h3>{lineup.displayName}</h3>
        <span>{lineup.formationCode}</span>
      </header>
      <ol className="match-lineup__players">
        {lineup.players.map((player) => (
          <li key={player.cardId} className="match-lineup__player">
            <span className="match-lineup__position">{player.positionCode}</span>
            <span className="match-lineup__name">{player.displayName}</span>
            <span className={ratingClassName(player.matchRating)} title="Anlık maç reytingi">
              {formatRating(player.matchRating)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MatchLineupsPanel({
  homeLineup,
  awayLineup,
}: MatchLineupsPanelProps): React.ReactElement {
  return (
    <section className="match-lineups" aria-label="Maç kadroları">
      <header className="match-lineups__header">
        <h2 className="league-section-title">Kadrolar</h2>
        <p className="match-lineups__hint">Anlık maç reytingi · 10 üzerinden</p>
      </header>
      <div className="match-lineups__grid">
        <TeamLineup lineup={homeLineup} />
        <TeamLineup lineup={awayLineup} />
      </div>
    </section>
  );
}
