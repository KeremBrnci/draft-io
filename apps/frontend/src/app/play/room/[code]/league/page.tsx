'use client';

import type { MatchEventDto, RoomLeagueStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import '@/components/league/league.css';
import { MatchLiveStatsPanel } from '@/components/league/match-live-stats-panel';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { ApiClientError } from '@/lib/api/client';
import { getLeagueState, startNextMatch } from '@/lib/api/league';
import { getMatchEventUi } from '@/lib/match-event-ui';
import { getActiveLiveMatchAlert } from '@/lib/match-live-alert';
import { computeLiveMatchStats } from '@/lib/match-live-stats';
import { useRoomSocket } from '@/lib/room-socket';

import '../../../play.css';

const POLL_INTERVAL_MS = 2000;

export default function LeaguePage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const [league, setLeague] = useState<RoomLeagueStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startingNext, setStartingNext] = useState(false);
  const autoNextQueuedRef = useRef(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const next = await getLeagueState(code);
      setLeague(next);
      setError(null);
    } catch (loadError) {
      if (loadError instanceof ApiClientError) {
        setError(loadError.message);
        return;
      }
      setError('Lig ekranı yüklenemedi.');
    }
  }, [code]);

  const queueNextMatch = useCallback(async (): Promise<void> => {
    if (autoNextQueuedRef.current) {
      return;
    }

    autoNextQueuedRef.current = true;
    setStartingNext(true);
    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 2500);
      });
      const next = await startNextMatch(code);
      setLeague(next);
      setError(null);
    } catch {
      setError('Sonraki maç başlatılamadı.');
    } finally {
      setStartingNext(false);
      autoNextQueuedRef.current = false;
    }
  }, [code]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [load]);

  useRoomSocket(code, (event) => {
    if (
      event === 'MATCH_STARTED' ||
      event === 'MATCH_MINUTE_UPDATED' ||
      event === 'MATCH_EVENT_CREATED' ||
      event === 'GOAL_SCORED' ||
      event === 'HALF_TIME' ||
      event === 'FULL_TIME' ||
      event === 'LEAGUE_TABLE_UPDATED' ||
      event === 'LEAGUE_READY'
    ) {
      void load();
      if (event === 'FULL_TIME') {
        void queueNextMatch();
      }
    }
  });

  async function handleStartNext(): Promise<void> {
    await queueNextMatch();
  }

  const match = league?.currentMatch ?? null;
  const liveStats = useMemo(
    () => (match === null ? null : computeLiveMatchStats(match.events)),
    [match],
  );
  const liveAlert = useMemo(
    () => (match === null ? null : getActiveLiveMatchAlert(match.events)),
    [match],
  );

  return (
    <div className="play play--game play--draft">
      <PlayGameBackdrop />

      <header className="play-header play-header--lobby">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <span className="play-lobby-badge">🏟️ Mini Lig</span>
      </header>

      <main className="play-main play-main--draft">
        {error !== null ? (
          <p className="play-error" role="alert">{error}</p>
        ) : league === null ? (
          <div className="play-arena play-arena--loading">
            <div className="play-loader" />
          </div>
        ) : (
          <div className="play-arena league-layout">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">Canlı maç · lig heyecanı</p>
                <h1 className="play-title play-title--lobby">
                  {league.completedMatchCount}/{league.totalMatchCount} maç
                </h1>
              </div>
            </div>

            {match !== null ? (
              <section className="league-live" aria-live="polite">
                <div className="league-live__scoreboard">
                  <div className="league-live__team">
                    {liveAlert?.teamSide === 'HOME' ? (
                      <div className="league-live__alert" role="status" aria-live="assertive">
                        {liveAlert.label}
                      </div>
                    ) : null}
                    <h2>{match.homeDisplayName}</h2>
                    <div className="league-live__score">{match.homeScore}</div>
                  </div>
                  <div className="league-live__minute">
                    <div>{match.currentMinute}&apos;</div>
                    <div>{match.status === 'HALF_TIME' ? 'Devre arası' : match.status}</div>
                  </div>
                  <div className="league-live__team">
                    {liveAlert?.teamSide === 'AWAY' ? (
                      <div className="league-live__alert" role="status" aria-live="assertive">
                        {liveAlert.label}
                      </div>
                    ) : null}
                    <h2>{match.awayDisplayName}</h2>
                    <div className="league-live__score">{match.awayScore}</div>
                  </div>
                </div>

                {liveStats !== null ? (
                  <MatchLiveStatsPanel
                    homeName={match.homeDisplayName}
                    awayName={match.awayDisplayName}
                    stats={liveStats}
                  />
                ) : null}

                {match.status === 'FULL_TIME' && match.manOfTheMatchPlayerName !== null ? (
                  <p className="league-motm">
                    Maçın oyuncusu: <strong>{match.manOfTheMatchPlayerName}</strong>
                  </p>
                ) : null}

                <h3 className="league-section-title">Canlı anlatım</h3>
                <div className="league-commentary">
                  {[...match.events]
                    .filter((event) => event.eventType !== 'GOAL_CHANCE')
                    .reverse()
                    .map((event: MatchEventDto) => {
                    const ui = getMatchEventUi(event.eventType);
                    const teamName =
                      event.teamSide === 'HOME'
                        ? match.homeDisplayName
                        : event.teamSide === 'AWAY'
                          ? match.awayDisplayName
                          : null;

                    return (
                      <div
                        key={event.id}
                        className={`league-commentary__item league-commentary__item--${ui.tone}${event.isGoal ? ' league-commentary__item--goal' : ''}`}
                      >
                        <div className="league-commentary__meta">
                          <span className="league-commentary__icon" aria-hidden>{ui.icon}</span>
                          <span className="league-commentary__minute">{event.minute}&apos;</span>
                          <span className="league-commentary__tag">{ui.label}</span>
                          {teamName !== null ? (
                            <span className="league-commentary__team">{teamName}</span>
                          ) : null}
                        </div>
                        <p className="league-commentary__text">{event.commentary}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <p className="play-subtitle">Şu an canlı maç yok.</p>
            )}

            {match === null && league.completedMatchCount < league.totalMatchCount ? (
              <button
                type="button"
                className="play-btn play-btn--primary"
                disabled={startingNext}
                onClick={() => {
                  void handleStartNext();
                }}
              >
                {startingNext ? 'Başlatılıyor…' : 'Sonraki Maçı Başlat'}
              </button>
            ) : null}

            {match?.status === 'FULL_TIME' && league.completedMatchCount < league.totalMatchCount ? (
              <button
                type="button"
                className="play-btn play-btn--primary"
                disabled={startingNext}
                onClick={() => {
                  void handleStartNext();
                }}
              >
                {startingNext ? 'Başlatılıyor…' : 'Sonraki Maçı Başlat'}
              </button>
            ) : null}

            <section>
              <h2 className="play-subtitle">Fikstür</h2>
              <ul className="league-fixtures">
                {league.fixtures.map((fixture) => {
                  const isCurrent =
                    match !== null &&
                    fixture.matchId === match.id &&
                    match.status !== 'FULL_TIME';
                  const isDone = fixture.matchId !== null && !isCurrent;
                  return (
                    <li
                      key={fixture.id}
                      className={`league-fixture${isCurrent ? ' league-fixture--live' : ''}${isDone ? ' league-fixture--done' : ''}`}
                    >
                      <span className="league-fixture__round">#{fixture.roundNumber}</span>
                      <span>
                        {fixture.homeDisplayName} vs {fixture.awayDisplayName}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h2 className="play-subtitle">Puan durumu</h2>
              <table className="league-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Oyuncu</th>
                    <th>O</th>
                    <th>G</th>
                    <th>B</th>
                    <th>M</th>
                    <th>A</th>
                    <th>Y</th>
                    <th>Av</th>
                    <th>P</th>
                  </tr>
                </thead>
                <tbody>
                  {league.standings.map((row) => (
                    <tr key={row.participantId}>
                      <td>{row.rank}</td>
                      <td>{row.displayName}</td>
                      <td>{row.played}</td>
                      <td>{row.won}</td>
                      <td>{row.drawn}</td>
                      <td>{row.lost}</td>
                      <td>{row.goalsFor}</td>
                      <td>{row.goalsAgainst}</td>
                      <td>{row.goalDifference}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
