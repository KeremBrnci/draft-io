'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import '@/components/league/league.css';
import { CoachCard } from '@/components/cards';
import { getCoachSelection, selectCoach } from '@/lib/api/coach-selection';
import { ApiClientError } from '@/lib/api/client';
import { clearLobbySession, readLobbySession } from '@/lib/lobby-session';
import { useRoomSocket } from '@/lib/room-socket';
import type { CoachSelectionStateDto } from '@draft-io/shared-types';

import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';

import '../../../play.css';

const POLL_INTERVAL_MS = 2500;

export default function CoachSelectionPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();
  const session = useMemo(() => readLobbySession(code), [code]);
  const [state, setState] = useState<CoachSelectionStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const loadState = useCallback(async (): Promise<void> => {
    if (session === null) {
      setError('Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.');
      return;
    }

    try {
      const nextState = await getCoachSelection(code, session.sessionToken);
      setState(nextState);
      setError(null);

      if (nextState.phase === 'TEAM_REVIEW') {
        router.replace(`/play/room/${code}/team-review`);
        return;
      }

      if (nextState.phase === 'MATCHES') {
        router.replace(`/play/room/${code}/league`);
      }
    } catch (loadError) {
      if (loadError instanceof ApiClientError && (loadError.statusCode === 410 || loadError.statusCode === 404)) {
        clearLobbySession(code);
        setError('Oda bulunamadı veya süresi doldu.');
        return;
      }

      setError('Teknik direktör seçimi yüklenemedi.');
    }
  }, [code, router, session]);

  useEffect(() => {
    void loadState();
    const timer = window.setInterval(() => {
      void loadState();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadState]);

  useRoomSocket(code, (event) => {
    if (
      event === 'DRAFT_COMPLETE' ||
      event === 'COACH_SELECTION_STARTED' ||
      event === 'PLAYER_SELECTED_COACH' ||
      event === 'ALL_COACHES_SELECTED' ||
      event === 'TEAMS_READY' ||
      event === 'LEAGUE_READY' ||
      event === 'MATCH_STARTED'
    ) {
      if (event === 'LEAGUE_READY' || event === 'MATCH_STARTED') {
        router.replace(`/play/room/${code}/league`);
        return;
      }
      void loadState();
    }
  });

  const hasLockedSelection = state?.mySelectedCoachId !== null;
  const selectedCount = state?.coachSelectedCount ?? 0;
  const totalPlayers = state?.lobby.participantCount ?? 0;
  const waitingForOthers = hasLockedSelection && selectedCount < totalPlayers;

  async function handleSelectCoach(coachId: string): Promise<void> {
    if (session === null || hasLockedSelection || selectingId !== null) {
      return;
    }

    setSelectingId(coachId);
    setActionError(null);

    try {
      const nextState = await selectCoach(code, {
        sessionToken: session.sessionToken,
        coachId,
      });
      setState(nextState);
      if (nextState.phase === 'MATCHES') {
        router.replace(`/play/room/${code}/league`);
      } else if (nextState.phase === 'TEAM_REVIEW' || nextState.allCoachesSelected) {
        router.replace(`/play/room/${code}/league`);
      }
    } catch {
      setActionError('Teknik direktör seçilemedi.');
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <div className="play play--game play--draft">
      <PlayGameBackdrop />

      <header className="play-header play-header--lobby">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <span className="play-lobby-badge">🧢 Teknik Direktör</span>
      </header>

      <main className="play-main play-main--draft">
        {error !== null ? (
          <p className="play-error" role="alert">{error}</p>
        ) : state === null ? (
          <div className="play-arena play-arena--loading">
            <div className="play-loader" />
          </div>
        ) : (
          <div className="play-arena">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">Kadro tamam · son dokunuş</p>
                <h1 className="play-title play-title--lobby">Teknik direktörünü seç</h1>
              </div>
              <div className="play-arena__meta">
                {selectedCount}/{totalPlayers} seçim
              </div>
            </div>

            <p className="play-subtitle">
              Kadron hazır. Teknik direktörünü seç; kimyayı artırır. Herkes seçince lig otomatik başlar.
            </p>

            {waitingForOthers ? (
              <p className="play-subtitle">Seçimin kaydedildi. Diğer oyuncular bekleniyor…</p>
            ) : null}

            {actionError !== null ? (
              <p className="play-error" role="alert">{actionError}</p>
            ) : null}

            <div className="coach-selection-grid">
              {state.myCoachOptions.map((coach) => {
                const isSelected = state.mySelectedCoachId === coach.id;
                const isBusy = selectingId === coach.id;

                return (
                  <button
                    key={coach.id}
                    type="button"
                    className={`coach-selection-card${isSelected ? ' coach-selection-card--selected' : ''}`}
                    disabled={hasLockedSelection || isBusy}
                    onClick={() => {
                      void handleSelectCoach(coach.id);
                    }}
                  >
                    <CoachCard coach={coach} size="sm" />
                    {isBusy ? <span>Seçiliyor…</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
