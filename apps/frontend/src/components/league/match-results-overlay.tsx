'use client';

import type { RoomFixtureDto, RoomLeagueStandingDto } from '@draft-io/shared-types';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { PlayButton } from '@/components/play/play-button';
import { useBodyScrollLock } from '@/lib/use-body-scroll-lock';

import './match-results.css';

interface MatchResultsOverlayProps {
  readonly fixtures: readonly RoomFixtureDto[];
  readonly standings: readonly RoomLeagueStandingDto[];
  readonly latestMatchId: string | null;
  readonly loading: boolean;
  readonly isFinalMatch: boolean;
  readonly onContinue: () => void;
}

function getPortalRoot(): HTMLElement {
  return document.getElementById('app-portal') ?? document.body;
}

function formatFixtureScore(fixture: RoomFixtureDto): string {
  return `${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0}`;
}

export function MatchResultsOverlay({
  fixtures,
  standings,
  latestMatchId,
  loading,
  isFinalMatch,
  onContinue,
}: MatchResultsOverlayProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const completedFixtures = fixtures.filter(
    (fixture) =>
      fixture.matchStatus === 'FULL_TIME' &&
      fixture.homeScore !== null &&
      fixture.awayScore !== null,
  );

  return createPortal(
    <div
      className="app-overlay league-results"
      role="dialog"
      aria-modal="true"
      aria-labelledby="league-results-title"
    >
      <div className="app-overlay__backdrop league-results__backdrop" aria-hidden />
      <div className="app-overlay__panel league-results__panel">
        <p className="league-results__eyebrow">Maç sonu</p>
        <h2 id="league-results-title" className="league-results__title">
          Lig sonuçları
        </h2>
        <p className="league-results__subtitle">
          Galibiyet 3 puan · Beraberlik 1 puan · Mağlubiyet 0 puan
          {!isFinalMatch ? ' · Sonraki tur kısa süre içinde otomatik başlar' : ''}
        </p>

        <section className="league-results__section" aria-label="Oynanan maçlar">
          <h3 className="league-results__section-title">Maç sonuçları</h3>
          <ul className="league-results__fixtures">
            {completedFixtures.map((fixture) => {
              const isLatest = fixture.matchId === latestMatchId;
              return (
                <li
                  key={fixture.id}
                  className={`league-results__fixture${isLatest ? ' league-results__fixture--latest' : ''}`}
                >
                  <span className="league-results__fixture-round">T{fixture.scheduleRound}</span>
                  <span className="league-results__fixture-home">{fixture.homeDisplayName}</span>
                  <span className="league-results__fixture-score">
                    {formatFixtureScore(fixture)}
                  </span>
                  <span className="league-results__fixture-away">{fixture.awayDisplayName}</span>
                  {isLatest ? <span className="league-results__fixture-badge">Son maç</span> : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="league-results__section" aria-label="Güncel puan durumu">
          <h3 className="league-results__section-title">Puan durumu</h3>
          <div className="league-results__table-wrap">
            <table className="league-results__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Takım</th>
                  <th>O</th>
                  <th>P</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.participantId}>
                    <td>{row.rank}</td>
                    <td>{row.displayName}</td>
                    <td>{row.played}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <PlayButton
          type="button"
          className="play-btn--primary league-results__cta"
          loading={loading}
          loadingLabel="Yükleniyor…"
          onClick={onContinue}
        >
          {isFinalMatch ? 'Şampiyonu Gör' : 'Sonraki Maça Devam'}
        </PlayButton>
      </div>
    </div>,
    getPortalRoot(),
  );
}
