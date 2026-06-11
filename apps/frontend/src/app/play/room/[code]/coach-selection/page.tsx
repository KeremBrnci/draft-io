'use client';

import type { CoachSelectionStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState, startTransition } from 'react';

import '@/components/league/league.css';
import { CoachCard } from '@/components/cards';
import { DraftPlayerChemistryBadge } from '@/components/draft/draft-player-chemistry-badge';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { waitForActionFeedback } from '@/lib/action-feedback-delay';
import { ApiClientError } from '@/lib/api/client';
import { getCoachSelection, selectCoach } from '@/lib/api/coach-selection';
import { clearLobbySession, readLobbySession } from '@/lib/lobby-session';
import { COACH_REFRESH_EVENTS } from '@/lib/lobby-stage-events';
import { applyIfChanged } from '@/lib/stable-state';
import { useBackgroundLoadErrors } from '@/lib/use-background-load-errors';
import { useLobbyStageSync } from '@/lib/use-lobby-stage-sync';
import { usePhaseRedirect } from '@/lib/use-phase-redirect';

import '../../../play.css';

const POLL_INTERVAL_MS = 5000;

export default function CoachSelectionPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const session = useMemo(() => readLobbySession(code), [code]);
  const [state, setState] = useState<CoachSelectionStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const redirectForPhase = usePhaseRedirect(code);
  const backgroundErrors = useBackgroundLoadErrors();

  const loadState = useCallback(async (): Promise<void> => {
    if (session === null) {
      setError('Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.');
      return;
    }

    try {
      const nextState = await getCoachSelection(code, session.sessionToken);
      startTransition(() => {
        setState((current) => applyIfChanged(current, nextState));
        backgroundErrors.onLoadSuccess();
        setError(null);
      });

      if (nextState.phase === 'TEAM_REVIEW') {
        redirectForPhase('TEAM_REVIEW');
        return;
      }

      if (nextState.phase === 'MATCHES') {
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
        'Teknik direktör seçimi yüklenemedi.',
      );
      if (message !== null) {
        setError(message);
      }
    }
  }, [backgroundErrors, code, redirectForPhase, session]);

  useLobbyStageSync({
    lobbyCode: code,
    onRefresh: loadState,
    pollIntervalMs: POLL_INTERVAL_MS,
    enabled: selectingId === null,
    refreshEvents: COACH_REFRESH_EVENTS,
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
      await waitForActionFeedback();

      const nextState = await selectCoach(code, {
        sessionToken: session.sessionToken,
        coachId,
      });
      setState(nextState);
      if (
        nextState.phase === 'MATCHES' ||
        nextState.phase === 'TEAM_REVIEW' ||
        nextState.allCoachesSelected
      ) {
        redirectForPhase('MATCHES');
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
        <PlayStageRail current="coach" />
        {error !== null ? (
          <p className="play-error" role="alert">
            {error}
          </p>
        ) : state === null ? (
          <PlayLoadingState message="Teknik direktörler yükleniyor…" icon="🧢" />
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
              Kadron hazır. Teknik direktörünü seç; kimyayı artırır. Herkes seçince lig otomatik
              başlar.
            </p>

            {waitingForOthers ? (
              <p className="play-subtitle">Seçimin kaydedildi. Diğer oyuncular bekleniyor…</p>
            ) : null}

            {actionError !== null ? (
              <p className="play-error" role="alert">
                {actionError}
              </p>
            ) : null}

            <div className="coach-selection-grid">
              {state.myCoachOptions.map((coach) => {
                const isSelected = state.mySelectedCoachId === coach.id;
                const isBusy = selectingId === coach.id;

                return (
                  <button
                    key={coach.id}
                    type="button"
                    className={`coach-selection-card${isSelected ? ' coach-selection-card--selected' : ''}${isBusy ? ' coach-selection-card--busy' : ''}`}
                    disabled={hasLockedSelection || selectingId !== null}
                    aria-busy={isBusy}
                    onClick={() => {
                      void handleSelectCoach(coach.id);
                    }}
                  >
                    {isBusy ? <span className="coach-selection-card__spinner" aria-hidden /> : null}
                    <CoachCard coach={coach} size="sm" visual="interactive" />
                    <span className="coach-selection-card__name">{coach.displayName}</span>
                    <DraftPlayerChemistryBadge
                      chemistry={coach.chemistryBonus}
                      showZero
                      suffix="kimya"
                      className="coach-selection-card__chemistry"
                    />
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
