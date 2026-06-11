'use client';

import type { FormationSelectionStateDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useMemo, useState, startTransition } from 'react';

import { FormationCard } from '@/components/formations/formation-card';
import { PlayButton } from '@/components/play/play-button';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { runDelayedAction } from '@/lib/action-feedback-delay';
import { ApiClientError } from '@/lib/api/client';
import { getFormationSelection, selectFormation, startDraft } from '@/lib/api/formation-selection';
import { clearLobbySession, readLobbySession } from '@/lib/lobby-session';
import { FORMATION_REFRESH_EVENTS } from '@/lib/lobby-stage-events';
import { applyIfChanged } from '@/lib/stable-state';
import { useBackgroundLoadErrors } from '@/lib/use-background-load-errors';
import { useLobbyStageSync } from '@/lib/use-lobby-stage-sync';
import { usePhaseRedirect } from '@/lib/use-phase-redirect';

import '../../../play.css';

const POLL_INTERVAL_MS = 2500;

export default function FormationSelectionPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const [state, setState] = useState<FormationSelectionStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [startingDraft, setStartingDraft] = useState(false);
  const session = useMemo(() => readLobbySession(code), [code]);
  const redirectForPhase = usePhaseRedirect(code);
  const backgroundErrors = useBackgroundLoadErrors();

  const loadState = useCallback(async (): Promise<void> => {
    if (session === null) {
      setError('Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.');
      return;
    }

    try {
      const nextState = await getFormationSelection(code, session.sessionToken);
      startTransition(() => {
        setState((current) => applyIfChanged(current, nextState));
        backgroundErrors.onLoadSuccess();
        setError(null);
      });

      if (nextState.phase === 'DRAFT') {
        redirectForPhase('DRAFT');
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

      const message = backgroundErrors.resolvePollError(loadError, 'Formasyon seçimi yüklenemedi.');
      if (message !== null) {
        setError(message);
      }
    }
  }, [backgroundErrors, code, redirectForPhase, session]);

  useLobbyStageSync({
    lobbyCode: code,
    onRefresh: loadState,
    pollIntervalMs: POLL_INTERVAL_MS,
    enabled: selectingId === null && !startingDraft,
    refreshEvents: FORMATION_REFRESH_EVENTS,
  });

  const hasLockedSelection = state?.mySelectedFormationId !== null;
  const selectedCount = state?.formationSelectedCount ?? 0;
  const totalPlayers = state?.lobby.participantCount ?? 0;
  const waitingForOthers = hasLockedSelection && selectedCount < totalPlayers;

  async function handleSelectFormation(formationId: string): Promise<void> {
    if (session === null || hasLockedSelection || selectingId !== null) {
      return;
    }

    setSelectingId(formationId);
    setActionError(null);

    try {
      const nextState = await selectFormation(code, {
        sessionToken: session.sessionToken,
        formationId,
      });
      setState(nextState);
    } catch (selectError) {
      if (selectError instanceof ApiClientError) {
        setActionError(selectError.message);
      } else {
        setActionError('Formasyon seçilemedi.');
      }
    } finally {
      setSelectingId(null);
    }
  }

  async function handleStartDraft(): Promise<void> {
    if (session === null || state?.canStartDraft !== true || startingDraft) {
      return;
    }

    await runDelayedAction(setStartingDraft, async () => {
      setActionError(null);

      try {
        await startDraft(code, { sessionToken: session.sessionToken });
        redirectForPhase('DRAFT');
      } catch (startError) {
        if (startError instanceof ApiClientError) {
          setActionError(startError.message);
        } else {
          setActionError('Draft başlatılamadı.');
        }
      }
    });
  }

  return (
    <div className="play play--game play--formation">
      <PlayGameBackdrop />

      <header className="play-header play-header--lobby">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <span className="play-lobby-badge">📋 Formasyon</span>
      </header>

      <main className="play-main play-main--formation">
        <PlayStageRail current="formation" />
        {error !== null ? (
          <div className="play-arena">
            <p className="play-error" role="alert">
              {error}
            </p>
            <Link href="/play/create" className="play-btn play-btn--primary">
              Yeni oda oluştur
            </Link>
          </div>
        ) : state === null ? (
          <PlayLoadingState message="Formasyonlar hazırlanıyor…" icon="📋" />
        ) : state.phase === 'DRAFT' ? (
          <div className="play-arena">
            <div className="play-started-banner">
              <span className="play-started-banner__pulse" />
              <div>
                <strong>Draft başladı</strong>
                <p>Formasyonlar kilitlendi. Oyuncu draft ekranı yakında.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="play-arena">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">Sahaya dizilişini seç</p>
                <h1 className="play-title play-title--lobby">{state.lobby.name}</h1>
              </div>
              <span className="play-status-pill play-status-pill--started">Formasyon</span>
            </div>

            <div className="play-formation-meter">
              <div className="play-ready-meter__labels">
                <span>Formasyon seçen oyuncular</span>
                <strong>
                  {selectedCount} / {totalPlayers}
                </strong>
              </div>
              <div className="play-ready-meter__track">
                <div
                  className="play-ready-meter__fill"
                  style={{
                    width: `${totalPlayers === 0 ? 0 : (selectedCount / totalPlayers) * 100}%`,
                  }}
                />
              </div>
              <p className="play-ready-meter__hint">
                {state.allFormationsSelected
                  ? 'Herkes formasyonunu seçti — kurucu draftı başlatabilir.'
                  : waitingForOthers
                    ? 'Seçimin kilitlendi. Diğer oyuncular bekleniyor…'
                    : '5 formasyondan birini seç. Seçim draft başlayana kadar kilitlenir.'}
              </p>
            </div>

            <div className="formation-grid">
              {state.myFormationOptions.map((formation) => {
                const isSelected = state.mySelectedFormationId === formation.id;
                return (
                  <FormationCard
                    key={formation.id}
                    formation={formation}
                    selected={isSelected}
                    locked={hasLockedSelection && isSelected}
                    disabled={hasLockedSelection || selectingId !== null}
                    onSelect={() => void handleSelectFormation(formation.id)}
                  />
                );
              })}
            </div>

            {state.canStartDraft ? (
              <div className="play-host-start">
                <PlayButton
                  type="button"
                  className="play-btn--start play-btn--start-active"
                  loading={startingDraft}
                  loadingLabel="Başlatılıyor…"
                  onClick={() => void handleStartDraft()}
                >
                  Draftı Başlat
                </PlayButton>
              </div>
            ) : null}

            {actionError !== null ? (
              <p className="play-error" role="alert">
                {actionError}
              </p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
