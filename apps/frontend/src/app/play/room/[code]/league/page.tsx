'use client';

import type { RoomLeagueStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';

import '@/components/league/league.css';
import { GoalCelebrationOverlay } from '@/components/league/goal-celebration-overlay';
import { LeagueVictoryOverlay } from '@/components/league/league-victory-overlay';
import { MatchCommentaryFeed } from '@/components/league/match-commentary-feed';
import { MatchGoalScorersPanel } from '@/components/league/match-goal-scorers-panel';
import { MatchLineupsPanel } from '@/components/league/match-lineups-panel';
import { MatchLiveStatsPanel } from '@/components/league/match-live-stats-panel';
import { MatchResultsOverlay } from '@/components/league/match-results-overlay';
import { MatchWarmupOverlay } from '@/components/league/match-warmup-overlay';
import { RoomChatPanel } from '@/components/league/room-chat-panel';
import { PlayButton } from '@/components/play/play-button';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { runDelayedAction } from '@/lib/action-feedback-delay';
import { ApiClientError } from '@/lib/api/client';
import { getLeagueState, playAgain, startNextMatch } from '@/lib/api/league';
import { readLobbySession } from '@/lib/lobby-session';
import { getActiveLiveMatchAlert } from '@/lib/match-live-alert';
import { computeLiveMatchStats } from '@/lib/match-live-stats';
import { useRoomSocket } from '@/lib/room-socket';
import { applyIfChanged } from '@/lib/stable-state';
import { useBackgroundLoadErrors } from '@/lib/use-background-load-errors';
import { useCoalescedCallback } from '@/lib/use-coalesced-callback';
import { useGoalCelebration } from '@/lib/use-goal-celebration';
import { useMonotonicLiveScores } from '@/lib/use-monotonic-live-scores';
import { useRoomChat } from '@/lib/use-room-chat';
import { useVisibleInterval } from '@/lib/use-visible-interval';

import '../../../play.css';

const POLL_INTERVAL_MS = 3000;

const LIVE_MATCH_STATUSES = new Set<NonNullable<RoomLeagueStateDto['currentMatch']>['status']>([
  'PRE_MATCH',
  'LIVE',
  'HALF_TIME',
  'PAUSED',
]);

function isLiveMatchInProgress(league: RoomLeagueStateDto): boolean {
  return league.currentMatch !== null && LIVE_MATCH_STATUSES.has(league.currentMatch.status);
}

function mergeLeagueState(
  current: RoomLeagueStateDto | null,
  next: RoomLeagueStateDto,
): RoomLeagueStateDto {
  if (current !== null && isLiveMatchInProgress(next)) {
    return applyIfChanged(current, { ...next, standings: current.standings });
  }

  return applyIfChanged(current, next);
}

function isSeasonComplete(league: RoomLeagueStateDto): boolean {
  if (league.status === 'COMPLETED') {
    return true;
  }

  return league.totalMatchCount > 0 && league.completedMatchCount >= league.totalMatchCount;
}

function isLeagueFinished(league: RoomLeagueStateDto): boolean {
  return isSeasonComplete(league);
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
  const [viewingChampion, setViewingChampion] = useState(false);
  const autoNextQueuedRef = useRef(false);
  const loadGenerationRef = useRef(0);
  const pauseLiveUpdatesRef = useRef(false);
  const backgroundErrors = useBackgroundLoadErrors();

  const load = useCallback(async (): Promise<void> => {
    const generation = loadGenerationRef.current + 1;
    loadGenerationRef.current = generation;

    try {
      const next = await getLeagueState(code);
      if (loadGenerationRef.current !== generation) {
        return;
      }

      startTransition(() => {
        setLeague((current) => mergeLeagueState(current, next));
        backgroundErrors.onLoadSuccess();
        setError(null);
      });
    } catch (loadError) {
      if (loadGenerationRef.current !== generation) {
        return;
      }

      const message = backgroundErrors.resolvePollError(loadError, 'Lig ekranı yüklenemedi.');
      if (message !== null) {
        setError(message);
      }
    }
  }, [backgroundErrors, code]);

  const coalescedLoad = useCoalescedCallback(load);
  const chat = useRoomChat(code, session);

  const queueNextMatch = useCallback(async (): Promise<void> => {
    if (autoNextQueuedRef.current) {
      return;
    }

    await runDelayedAction(setStartingNext, async () => {
      autoNextQueuedRef.current = true;
      try {
        const next = await startNextMatch(code);
        setLeague((current) => mergeLeagueState(current, next));
        setError(null);
      } catch {
        setError('Sonraki maç başlatılamadı.');
      } finally {
        autoNextQueuedRef.current = false;
      }
    });
  }, [code]);

  const match = league?.currentMatch ?? null;
  const seasonComplete = league !== null && isSeasonComplete(league);
  const matchInReview = match?.status === 'FULL_TIME';
  const isFinalMatchReview = matchInReview && seasonComplete;
  const showMatchResults = matchInReview && !resultsDismissed && !viewingChampion && !startingNext;
  const showVictoryOverlay = viewingChampion || (seasonComplete && resultsDismissed);
  const pauseLiveUpdates = showMatchResults || showVictoryOverlay;

  useEffect(() => {
    pauseLiveUpdatesRef.current = pauseLiveUpdates;
  }, [pauseLiveUpdates]);

  useVisibleInterval(
    () => {
      void coalescedLoad();
    },
    POLL_INTERVAL_MS,
    league === null || (!seasonComplete && !pauseLiveUpdates),
  );

  useEffect(() => {
    void coalescedLoad();
  }, [coalescedLoad]);

  useRoomSocket(code, (event) => {
    if (event === 'LOBBY_RESET') {
      router.replace(`/play/room/${code}`);
      return;
    }

    if (pauseLiveUpdatesRef.current) {
      if (event === 'LEAGUE_COMPLETED') {
        void coalescedLoad();
      }
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
      void coalescedLoad();
    }
  });

  async function handlePlayAgain(): Promise<void> {
    if (session === null || playAgainLoading) {
      return;
    }

    await runDelayedAction(setPlayAgainLoading, async () => {
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
      }
    });
  }

  const leagueFinished = league !== null && (showVictoryOverlay || isLeagueFinished(league));
  const hideLiveMatchPanel = pauseLiveUpdates;
  const winnerName = league !== null ? resolveWinnerName(league) : '—';

  async function handleStartNext(): Promise<void> {
    if (league !== null && matchInReview && seasonComplete) {
      setResultsDismissed(true);
      setViewingChampion(true);
      return;
    }

    setResultsDismissed(false);
    setViewingChampion(false);
    await queueNextMatch();
  }

  useEffect(() => {
    if (
      match?.status === 'PRE_MATCH' ||
      match?.status === 'LIVE' ||
      match?.status === 'HALF_TIME'
    ) {
      setResultsDismissed(false);
      setViewingChampion(false);
    }
  }, [match?.id, match?.status]);

  const isWarmup = match?.status === 'PRE_MATCH';
  const isLivePlay = match?.status === 'LIVE' || match?.status === 'HALF_TIME';
  const displayMinute = isWarmup ? '0' : (match?.displayMinute ?? '0');
  const isStoppageMinute = displayMinute.includes('+');

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
  const liveScores = useMonotonicLiveScores(match);

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
          <div className="play-arena league-layout league-layout--with-chat">
            <div className="league-layout__main">
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

              {match !== null && !hideLiveMatchPanel ? (
                <section
                  className={`league-live${goalCelebration !== null ? ' league-live--goal' : ''}${isWarmup ? ' league-live--warmup' : ''}`}
                  aria-live="polite"
                >
                  {isWarmup ? <MatchWarmupOverlay /> : null}
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
                      <div className="league-live__score">{liveScores.homeScore}</div>
                    </div>
                    <div className="league-live__minute">
                      {isLivePlay ? (
                        <span className="league-live__live-badge">Canlı</span>
                      ) : isWarmup ? (
                        <span className="league-live__warmup-badge">Isınma</span>
                      ) : null}
                      <div
                        className={`league-live__clock${isStoppageMinute ? ' league-live__clock--stoppage' : ''}`}
                        aria-label={`Maç dakikası ${displayMinute}`}
                      >
                        <span className="league-live__clock-icon" aria-hidden>
                          🕐
                        </span>
                        <span className="league-live__clock-minute">{displayMinute}&apos;</span>
                      </div>
                      <div className="league-live__status-label">
                        {isWarmup
                          ? 'Takımlar sahaya çıkıyor'
                          : match.status === 'HALF_TIME'
                            ? '⏸️ Devre arası'
                            : match.status === 'FULL_TIME'
                              ? '🏁 Maç sonu'
                              : isStoppageMinute
                                ? `⏱️ İlave dakika (+${displayMinute.startsWith('45+') ? match.firstHalfStoppageMinutes : match.secondHalfStoppageMinutes})`
                                : isLivePlay
                                  ? 'Maç devam ediyor'
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
                      <div className="league-live__score">{liveScores.awayScore}</div>
                    </div>
                  </div>

                  {!isWarmup ? (
                    <MatchGoalScorersPanel
                      events={match.events}
                      homeName={match.homeDisplayName}
                      awayName={match.awayDisplayName}
                      stoppage={{
                        firstHalfMinutes: match.firstHalfStoppageMinutes,
                        secondHalfMinutes: match.secondHalfStoppageMinutes,
                      }}
                    />
                  ) : null}

                  {!isWarmup && liveStats !== null ? (
                    <MatchLiveStatsPanel
                      homeName={match.homeDisplayName}
                      awayName={match.awayDisplayName}
                      stats={liveStats}
                    />
                  ) : null}

                  <MatchLineupsPanel homeLineup={match.homeLineup} awayLineup={match.awayLineup} />

                  {match.status === 'FULL_TIME' && match.manOfTheMatchPlayerName !== null ? (
                    <p className="league-motm">
                      Maçın oyuncusu: <strong>{match.manOfTheMatchPlayerName}</strong>
                    </p>
                  ) : null}

                  {isWarmup ? (
                    <p className="league-warmup-hint">
                      Maç başladığında canlı anlatım burada görünecek.
                    </p>
                  ) : (
                    <>
                      <h3 className="league-section-title">Canlı anlatım</h3>
                      <MatchCommentaryFeed
                        events={match.events}
                        homeDisplayName={match.homeDisplayName}
                        awayDisplayName={match.awayDisplayName}
                        stoppage={{
                          firstHalfMinutes: match.firstHalfStoppageMinutes,
                          secondHalfMinutes: match.secondHalfStoppageMinutes,
                        }}
                      />
                    </>
                  )}
                </section>
              ) : showVictoryOverlay ? (
                <p className="play-subtitle">Sezon tamamlandı — şampiyon kutlaması açık.</p>
              ) : matchInReview ? (
                <p className="play-subtitle">Maç sona erdi — sonuç ekranından devam edin.</p>
              ) : leagueFinished ? (
                <p className="play-subtitle">Tüm maçlar oynandı. Şampiyon kutlaması açıldı.</p>
              ) : league.completedMatchCount === 0 ? (
                <p className="play-subtitle">İlk maç başlamak üzere.</p>
              ) : (
                <p className="play-subtitle">Sonraki maç için sonuç ekranından devam edin.</p>
              )}

              {league.completedMatchCount === 0 && !leagueFinished ? (
                <PlayButton
                  type="button"
                  className="play-btn--primary"
                  loading={startingNext}
                  loadingLabel="Başlatılıyor…"
                  onClick={() => {
                    void handleStartNext();
                  }}
                >
                  İlk Maçı Başlat
                </PlayButton>
              ) : null}

              <section>
                <h2 className="play-subtitle">Fikstür</h2>
                <ul className="league-fixtures">
                  {league.fixtures.map((fixture) => {
                    const isCurrent =
                      match !== null &&
                      fixture.matchId === match.id &&
                      match.status !== 'FULL_TIME';
                    const isDone =
                      fixture.matchStatus === 'FULL_TIME' &&
                      fixture.homeScore !== null &&
                      fixture.awayScore !== null;
                    const scoreLabel = isDone
                      ? `${fixture.homeScore} - ${fixture.awayScore}`
                      : isCurrent
                        ? match.status === 'PRE_MATCH'
                          ? 'Isınma'
                          : 'Canlı'
                        : null;
                    return (
                      <li
                        key={fixture.id}
                        className={`league-fixture${isCurrent ? ' league-fixture--live' : ''}${isDone ? ' league-fixture--done' : ''}`}
                      >
                        <span className="league-fixture__round">T{fixture.scheduleRound}</span>
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
                <p className="league-points-legend">
                  Galibiyet 3 · Beraberlik 1 · Mağlubiyet 0 puan
                </p>
                <div className="league-table-wrap">
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
                </div>
              </section>
            </div>

            <RoomChatPanel
              messages={chat.messages}
              viewerParticipantId={session?.participantId ?? null}
              canSend={chat.canSend}
              sending={chat.sending}
              error={chat.error}
              onSend={chat.sendMessage}
            />
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

      {showVictoryOverlay ? (
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
