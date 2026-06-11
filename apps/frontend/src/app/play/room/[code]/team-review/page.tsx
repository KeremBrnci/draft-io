'use client';

import type { TeamReviewStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState, startTransition } from 'react';

import '@/components/league/league.css';
import { PlayButton } from '@/components/play/play-button';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { runDelayedAction } from '@/lib/action-feedback-delay';
import { ApiClientError } from '@/lib/api/client';
import { getTeamReview, startLeague } from '@/lib/api/league';
import { clearLobbySession, readLobbySession } from '@/lib/lobby-session';
import { TEAM_REVIEW_REFRESH_EVENTS } from '@/lib/lobby-stage-events';
import { applyIfChanged } from '@/lib/stable-state';
import { useBackgroundLoadErrors } from '@/lib/use-background-load-errors';
import { useLobbyStageSync } from '@/lib/use-lobby-stage-sync';
import { usePhaseRedirect } from '@/lib/use-phase-redirect';

import '../../../play.css';

export default function TeamReviewPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const session = useMemo(() => readLobbySession(code), [code]);
  const [state, setState] = useState<TeamReviewStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const redirectForPhase = usePhaseRedirect(code);
  const backgroundErrors = useBackgroundLoadErrors();

  const load = useCallback(async (): Promise<void> => {
    if (session === null) {
      setError('Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.');
      return;
    }

    try {
      const next = await getTeamReview(code, session.sessionToken);
      startTransition(() => {
        setState((current) => applyIfChanged(current, next));
        backgroundErrors.onLoadSuccess();
        setError(null);
      });

      if (next.phase === 'COACH_SELECTION') {
        redirectForPhase('COACH_SELECTION');
        return;
      }

      if (next.phase === 'MATCHES') {
        redirectForPhase('MATCHES');
      }
    } catch (loadError) {
      if (
        loadError instanceof ApiClientError &&
        (loadError.statusCode === 410 || loadError.statusCode === 404)
      ) {
        clearLobbySession(code);
        setError('Oda bulunamadı veya süresi doldu.');
        return;
      }

      const message = backgroundErrors.resolvePollError(
        loadError,
        'Takım inceleme ekranı yüklenemedi.',
      );
      if (message !== null) {
        setError(message);
      }
    }
  }, [backgroundErrors, code, redirectForPhase, session]);

  useLobbyStageSync({
    lobbyCode: code,
    onRefresh: load,
    pollIntervalMs: 4000,
    enabled: !loading,
    refreshEvents: TEAM_REVIEW_REFRESH_EVENTS,
  });

  async function handleStartLeague(): Promise<void> {
    if (session === null || loading) {
      return;
    }

    await runDelayedAction(setLoading, async () => {
      try {
        await startLeague(code, session.sessionToken);
        redirectForPhase('MATCHES');
      } catch {
        setError('Lig başlatılamadı.');
      }
    });
  }

  const canStartLeague = state?.canStartLeague === true;

  return (
    <div className="play play--game play--draft">
      <PlayGameBackdrop />

      <header className="play-header play-header--lobby">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <span className="play-lobby-badge">🏆 Takım İnceleme</span>
      </header>

      <main className="play-main play-main--draft">
        <PlayStageRail current="coach" />
        {error !== null ? (
          <p className="play-error" role="alert">
            {error}
          </p>
        ) : state === null ? (
          <PlayLoadingState message="Takımlar hazırlanıyor…" icon="🏆" />
        ) : (
          <div className="play-arena league-layout">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">Takımlar sahada · son kontrol</p>
                <h1 className="play-title play-title--lobby">Mini lige hazır mısın?</h1>
              </div>
            </div>

            <p className="play-subtitle">
              Kadrolar ve teknik direktörler tamam. Kurucu mini ligi başlattığında simülasyonlar
              canlı oynanacak.
            </p>

            <div className="team-review-grid">
              {state.participants.map((participant) => (
                <article key={participant.participantId} className="team-review-card">
                  <header className="team-review-card__header">
                    <span className="team-review-card__avatar" aria-hidden>
                      ⚽
                    </span>
                    <h3>{participant.displayName}</h3>
                  </header>
                  <div className="team-review-card__meta">
                    <span>📋 {participant.formationCode}</span>
                    <span>⭐ OVR {participant.teamAverageOverall.toFixed(1)}</span>
                    <span>🔗 Kimya {participant.teamChemistry}</span>
                    <span>💪 Maç gücü {participant.matchPower.toFixed(1)}</span>
                    {participant.selectedCoachName !== null ? (
                      <span>🧢 TD: {participant.selectedCoachName}</span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            {canStartLeague ? (
              <PlayButton
                type="button"
                className="play-btn--primary"
                loading={loading}
                loadingLabel="Başlatılıyor…"
                onClick={() => {
                  void handleStartLeague();
                }}
              >
                🏟️ Ligi Başlat
              </PlayButton>
            ) : (
              <p className="play-subtitle">Kurucunun ligi başlatması bekleniyor…</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
