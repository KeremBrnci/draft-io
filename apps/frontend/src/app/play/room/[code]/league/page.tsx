'use client';

import type { RoomLeagueStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';

import '@/components/league/league.css';
import { GoalCelebrationOverlay } from '@/components/league/goal-celebration-overlay';
import { LeagueVictoryOverlay } from '@/components/league/league-victory-overlay';
import { MatchCommentaryFeed } from '@/components/league/match-commentary-feed';
import { MatchLiveStatsPanel } from '@/components/league/match-live-stats-panel';
import { MatchResultsOverlay } from '@/components/league/match-results-overlay';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { ApiClientError } from '@/lib/api/client';
import { getLeagueState, playAgain, startNextMatch } from '@/lib/api/league';
import { readLobbySession } from '@/lib/lobby-session';
import { getActiveLiveMatchAlert } from '@/lib/match-live-alert';
import { computeLiveMatchStats } from '@/lib/match-live-stats';
import { useRoomSocket } from '@/lib/room-socket';
import { useGoalCelebration } from '@/lib/use-goal-celebration';
import { useVisibleInterval } from '@/lib/use-visible-interval';

import '../../../play.css';

const POLL_INTERVAL_MS = 3000;

function isLeagueFinished(league: RoomLeagueStateDto): boolean {
  if (league.status === 'COMPLETED') {
    return true;
  }

  return (
    league.totalMatchCount > 0 &&
    league.completedMatchCount >= league.totalMatchCount &&
    league.currentMatch === null
  );
}

function resolveWinnerName(league: RoomLeagueStateDto): string {
  if (league.winner !== null) {
    return league.winner.displayName;
  }

  const leader = league.standings.find((row) => row.rank === 1);
  return leader?.displayName ?? '—';
}

export default function LeaguePage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();
  const session = useMemo(() => readLobbySession(code), [code]);
  const [league, setLeague] = useState<RoomLeagueStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startingNext, setStartingNext] = useState(false);
  const [playAgainLoading, setPlayAgainLoading] = useState(false);
  const [resultsDismissed, setResultsDismissed] = useState(false);
  const autoNextQueuedRef = useRef(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const next = await getLeagueState(code);
      startTransition(() => {
        setLeague(next);
        setError(null);
      });
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

  useVisibleInterval(
    () => {
      void load();
    },
    POLL_INTERVAL_MS,
    league === null || !isLeagueFinished(league),
  );

  useEffect(() => {
    void load();
  }, [load]);

  useRoomSocket(code, (event) => {
    if (event === 'LOBBY_RESET') {
      router.replace(`/play/room/${code}`);
      return;
    }

    if (
      event === 'MATCH_STARTED' ||
      event === 'MATCH_MINUTE_UPDATED' ||
      event === 'MATCH_EVENT_CREATED' ||
      event === 'GOAL_SCORED' ||
      event === 'HALF_TIME' ||
      event === 'FULL_TIME' ||
      event === 'LEAGUE_TABLE_UPDATED' ||
      event === 'LEAGUE_COMPLETED' ||
      event === 'LEAGUE_READY'
    ) {
      void load();
    }
  });

  async function handlePlayAgain(): Promise<void> {
    if (session === null || playAgainLoading) {
      return;
    }

    setPlayAgainLoading(true);
    setError(null);

    try {
      await playAgain(code, session.sessionToken);
      router.replace(`/play/room/${code}`);
    } catch (playAgainError) {
      if (playAgainError instanceof ApiClientError) {
        setError(playAgainError.message);
      } else {
        setError('Yeni lig başlatılamadı.');
      }
    } finally {
      setPlayAgainLoading(false);
    }
  }

  const match = league?.currentMatch ?? null;
  const isFinalMatchReview =
    match?.status === 'FULL_TIME' &&
    league !== null &&
    league.completedMatchCount >= league.totalMatchCount;
  const showMatchResults = match?.status === 'FULL_TIME' && !resultsDismissed && !startingNext;
  const leagueFinished =
    league !== null && isLeagueFinished(league) && (!showMatchResults || resultsDismissed);
  const winnerName = league !== null ? resolveWinnerName(league) : '—';

  async function handleStartNext(): Promise<void> {
    if (
      league !== null &&
      match?.status === 'FULL_TIME' &&
      league.completedMatchCount >= league.totalMatchCount
    ) {
      setResultsDismissed(true);
      return;
    }

    setResultsDismissed(false);
    await queueNextMatch();
  }

  useEffect(() => {
    if (match?.status === 'LIVE' || match?.status === 'HALF_TIME') {
      setResultsDismissed(false);
    }
  }, [match?.id, match?.status]);

  const liveStats = useMemo(
    () => (match === null ? null : computeLiveMatchStats(match.events)),
    [match],
  );
  const liveAlert = useMemo(
    () => (match === null ? null : getActiveLiveMatchAlert(match.events)),
    [match],
  );
  const goalCelebration = useGoalCelebration(match?.id ?? null, match?.events ?? [], {
    home: match?.homeDisplayName ?? 'Ev sahibi',
    away: match?.awayDisplayName ?? 'Deplasman',
  });

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
        <PlayStageRail current="league" />
        {error !== null ? (
          <p className="play-error" role="alert">
            {error}
          </p>
        ) : league === null ? (
          <PlayLoadingState message="Lig ekranı yükleniyor…" icon="🏟️" />
        ) : (
          <div className="play-arena league-layout">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">
                  {leagueFinished ? 'Sezon bitti · şampiyon belli' : 'Canlı maç · lig heyecanı'}
                </p>
                <h1 className="play-title play-title--lobby">
                  {league.completedMatchCount}/{league.totalMatchCount} maç
                </h1>
              </div>
            </div>

            {match !== null ? (
              <section
                className={`league-live${goalCelebration !== null ? ' league-live--goal' : ''}`}
                aria-live="polite"
              >
                {goalCelebration !== null ? (
                  <GoalCelebrationOverlay celebration={goalCelebration} />
                ) : null}
                <div
                  className={`league-live__scoreboard${goalCelebration !== null ? ' league-live__scoreboard--goal' : ''}`}
                >
                  <div
                    className={`league-live__team${goalCelebration?.teamSide === 'HOME' ? ' league-live__team--scored' : ''}`}
                  >
                    {liveAlert?.teamSide === 'HOME' ? (
                      <div className="league-live__alert" role="status" aria-live="assertive">
                        {liveAlert.label}
                      </div>
                    ) : null}
                    <h2>{match.homeDisplayName}</h2>
                    <div className="league-live__score">{match.homeScore}</div>
                  </div>
                  <div className="league-live__minute">
                    {match.status === 'LIVE' ? (
                      <span className="league-live__live-badge">Canlı</span>
                    ) : null}
                    <div>{match.currentMinute}&apos;</div>
                    <div>
                      {match.status === 'HALF_TIME'
                        ? '⏸️ Devre arası'
                        : match.status === 'FULL_TIME'
                          ? '🏁 Maç sonu'
                          : match.status}
                    </div>
                  </div>
                  <div
                    className={`league-live__team${goalCelebration?.teamSide === 'AWAY' ? ' league-live__team--scored' : ''}`}
                  >
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
                <MatchCommentaryFeed
                  events={match.events}
                  homeDisplayName={match.homeDisplayName}
                  awayDisplayName={match.awayDisplayName}
                />
              </section>
            ) : leagueFinished ? (
              <p className="play-subtitle">Tüm maçlar oynandı. Şampiyon kutlaması açıldı.</p>
            ) : league.completedMatchCount === 0 ? (
              <p className="play-subtitle">İlk maç başlamak üzere.</p>
            ) : (
              <p className="play-subtitle">Sonraki maç için sonuç ekranından devam edin.</p>
            )}

            {league.completedMatchCount === 0 && !leagueFinished ? (
              <button
                type="button"
                className="play-btn play-btn--primary"
                disabled={startingNext}
                onClick={() => {
                  void handleStartNext();
                }}
              >
                {startingNext ? 'Başlatılıyor…' : 'İlk Maçı Başlat'}
              </button>
            ) : null}

            <section>
              <h2 className="play-subtitle">Fikstür</h2>
              <ul className="league-fixtures">
                {league.fixtures.map((fixture) => {
                  const isCurrent =
                    match !== null && fixture.matchId === match.id && match.status !== 'FULL_TIME';
                  const isDone =
                    fixture.matchStatus === 'FULL_TIME' &&
                    fixture.homeScore !== null &&
                    fixture.awayScore !== null;
                  const scoreLabel = isDone
                    ? `${fixture.homeScore} - ${fixture.awayScore}`
                    : isCurrent
                      ? 'Canlı'
                      : null;
                  return (
                    <li
                      key={fixture.id}
                      className={`league-fixture${isCurrent ? ' league-fixture--live' : ''}${isDone ? ' league-fixture--done' : ''}`}
                    >
                      <span className="league-fixture__round">#{fixture.roundNumber}</span>
                      <span className="league-fixture__teams">
                        {fixture.homeDisplayName} vs {fixture.awayDisplayName}
                      </span>
                      {scoreLabel !== null ? (
                        <span
                          className={`league-fixture__score${isCurrent ? ' league-fixture__score--live' : ''}`}
                        >
                          {scoreLabel}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h2 className="play-subtitle">Puan durumu</h2>
              <p className="league-points-legend">Galibiyet 3 · Beraberlik 1 · Mağlubiyet 0 puan</p>
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
                    <tr
                      key={row.participantId}
                      className={
                        row.rank === 1 && leagueFinished ? 'league-table__champion' : undefined
                      }
                    >
                      <td>{row.rank === 1 && leagueFinished ? '👑' : row.rank}</td>
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

      {showMatchResults && league !== null ? (
        <MatchResultsOverlay
          fixtures={league.fixtures}
          standings={league.standings}
          latestMatchId={match.id}
          loading={startingNext}
          isFinalMatch={isFinalMatchReview}
          onContinue={() => {
            void handleStartNext();
          }}
        />
      ) : null}

      {leagueFinished ? (
        <LeagueVictoryOverlay
          winnerName={winnerName}
          loading={playAgainLoading}
          onPlayAgain={() => {
            void handlePlayAgain();
          }}
        />
      ) : null}
    </div>
  );
}
