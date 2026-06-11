'use client';

import type { TeamReviewStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import '@/components/league/league.css';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { ApiClientError } from '@/lib/api/client';
import { getTeamReview, startLeague } from '@/lib/api/league';
import { clearLobbySession, readLobbySession } from '@/lib/lobby-session';
import { useRoomSocket } from '@/lib/room-socket';

import '../../../play.css';

export default function TeamReviewPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();
  const session = useMemo(() => readLobbySession(code), [code]);
  const [state, setState] = useState<TeamReviewStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (session === null) {
      setError('Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.');
      return;
    }

    try {
      const next = await getTeamReview(code, session.sessionToken);
      setState(next);
      setError(null);
      if (next.phase === 'COACH_SELECTION') {
        router.replace(`/play/room/${code}/coach-selection`);
        return;
      }

      if (next.phase === 'MATCHES') {
        router.replace(`/play/room/${code}/league`);
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
      setError('Takım inceleme ekranı yüklenemedi.');
    }
  }, [code, router, session]);

  useEffect(() => {
    void load();
  }, [load]);

  useRoomSocket(code, (event) => {
    if (event === 'TEAMS_READY' || event === 'LEAGUE_READY' || event === 'MATCH_STARTED') {
      void load();
    }
  });

  async function handleStartLeague(): Promise<void> {
    if (session === null) {
      return;
    }
    setLoading(true);
    try {
      await startLeague(code, session.sessionToken);
      router.push(`/play/room/${code}/league`);
    } catch {
      setError('Lig başlatılamadı.');
    } finally {
      setLoading(false);
    }
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
              <button
                type="button"
                className="play-btn play-btn--primary"
                disabled={loading}
                onClick={() => {
                  void handleStartLeague();
                }}
              >
                {loading ? 'Başlatılıyor…' : '🏟️ Ligi Başlat'}
              </button>
            ) : (
              <p className="play-subtitle">Kurucunun ligi başlatması bekleniyor…</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
