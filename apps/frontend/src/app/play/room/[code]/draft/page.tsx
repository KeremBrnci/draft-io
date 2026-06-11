'use client';

import type {
  DraftBoardStateDto,
  DraftPickOptionDto,
  DraftPickOptionsDto,
} from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';

import { DraftPickDrawer } from '@/components/draft/draft-pick-drawer';
import { DraftPitchBoard } from '@/components/draft/draft-pitch-board';
import { DraftStatsPanel } from '@/components/draft/draft-stats-panel';
import '@/components/draft/draft.css';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { ApiClientError } from '@/lib/api/client';
import { applyDraftPick, getDraftBoard, getDraftPickOptions } from '@/lib/api/draft';
import { setParticipantReady } from '@/lib/api/lobbies';
import { clearLobbySession, readLobbySession } from '@/lib/lobby-session';
import { useRoomSocket } from '@/lib/room-socket';
import { useVisibleInterval } from '@/lib/use-visible-interval';

import '../../../play.css';

const POLL_INTERVAL_MS = 6000;

const DRAFT_REFRESH_EVENTS = new Set([
  'DRAFT_READY',
  'DRAFT_PLAYER_READY',
  'DRAFT_COMPLETE',
  'COACH_SELECTION_STARTED',
  'LEAGUE_READY',
  'MATCH_STARTED',
]);

function applyOptimisticPick(
  board: DraftBoardStateDto,
  slotIndex: number,
  option: DraftPickOptionDto,
): DraftBoardStateDto {
  const nextPickCount = board.pickCount + 1;
  const nextSlots = board.slots.map((slot) =>
    slot.slotIndex === slotIndex ? { ...slot, card: option.face } : slot,
  );
  const nextEmptySlot = nextSlots.find((slot) => slot.card === null);

  return {
    ...board,
    pickCount: nextPickCount,
    isRosterComplete: nextPickCount >= board.rosterSize,
    nextSlotIndex: nextEmptySlot?.slotIndex ?? null,
    slots: nextSlots,
  };
}

export default function DraftRoomPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();
  const session = useMemo(() => readLobbySession(code), [code]);
  const [board, setBoard] = useState<DraftBoardStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [pickOptions, setPickOptions] = useState<DraftPickOptionsDto | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [pickingCardId, setPickingCardId] = useState<string | null>(null);
  const [readyLoading, setReadyLoading] = useState(false);
  const skipPollBoardUpdateRef = useRef(false);

  useEffect(() => {
    skipPollBoardUpdateRef.current = activeSlotIndex !== null || pickingCardId !== null;
  }, [activeSlotIndex, pickingCardId]);

  const loadBoard = useCallback(
    async (force = false): Promise<void> => {
      if (session === null) {
        setError('Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.');
        return;
      }

      try {
        const nextBoard = await getDraftBoard(code, session.sessionToken);
        startTransition(() => {
          setBoard((current) =>
            !force && skipPollBoardUpdateRef.current && current !== null ? current : nextBoard,
          );
          setError(null);
        });

        if (nextBoard.phase === 'COACH_SELECTION') {
          router.replace(`/play/room/${code}/coach-selection`);
          return;
        }

        if (nextBoard.phase === 'TEAM_REVIEW') {
          router.replace(`/play/room/${code}/team-review`);
          return;
        }

        if (nextBoard.phase === 'MATCHES') {
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

        setError('Draft ekranı yüklenemedi.');
      }
    },
    [code, router, session],
  );

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useVisibleInterval(
    () => {
      void loadBoard();
    },
    POLL_INTERVAL_MS,
    activeSlotIndex === null && pickingCardId === null,
  );

  useRoomSocket(code, (event) => {
    if (!DRAFT_REFRESH_EVENTS.has(event)) {
      return;
    }

    void loadBoard();
    if (event === 'DRAFT_COMPLETE' || event === 'COACH_SELECTION_STARTED') {
      router.replace(`/play/room/${code}/coach-selection`);
    }
    if (event === 'LEAGUE_READY' || event === 'MATCH_STARTED') {
      router.replace(`/play/room/${code}/league`);
    }
  });

  async function handleToggleReady(): Promise<void> {
    if (session === null || board === null || !board.isRosterComplete || readyLoading) {
      return;
    }

    setReadyLoading(true);
    setActionError(null);

    try {
      await setParticipantReady(code, {
        sessionToken: session.sessionToken,
        isReady: !board.viewerIsReady,
      });
      await loadBoard(true);
    } catch (readyError) {
      if (readyError instanceof ApiClientError) {
        setActionError(readyError.message);
      } else {
        setActionError('Hazır durumu güncellenemedi.');
      }
    } finally {
      setReadyLoading(false);
    }
  }

  const readyCount = board?.readyCount ?? 0;
  const participantCount = board?.participantCount ?? 0;
  const allPlayersReady = participantCount > 0 && readyCount >= participantCount;

  const openSlot = useCallback(
    async (slotIndex: number): Promise<void> => {
      if (
        session === null ||
        board === null ||
        board.isRosterComplete ||
        activeSlotIndex !== null
      ) {
        return;
      }

      const slot = board.slots.find((entry) => entry.slotIndex === slotIndex);
      if (slot?.card !== null) {
        return;
      }

      setActiveSlotIndex(slotIndex);
      setOptionsLoading(true);
      setActionError(null);
      setPickOptions(null);

      try {
        const options = await getDraftPickOptions(code, session.sessionToken, slotIndex);
        setPickOptions(options);
      } catch (optionsError) {
        if (optionsError instanceof ApiClientError) {
          setActionError(optionsError.message);
        } else {
          setActionError('Oyuncu seçenekleri yüklenemedi.');
        }
        setActiveSlotIndex(null);
      } finally {
        setOptionsLoading(false);
      }
    },
    [activeSlotIndex, board, code, session],
  );

  const handlePick = useCallback(
    async (cardId: string): Promise<void> => {
      if (session === null || activeSlotIndex === null || board === null) {
        return;
      }

      const option = pickOptions?.options.find((entry) => entry.cardId === cardId);
      if (option === undefined) {
        return;
      }

      const slotIndex = activeSlotIndex;
      setPickingCardId(cardId);
      setActionError(null);
      setBoard(applyOptimisticPick(board, slotIndex, option));
      setActiveSlotIndex(null);
      setPickOptions(null);

      try {
        const nextBoard = await applyDraftPick(code, {
          sessionToken: session.sessionToken,
          slotIndex,
          cardId,
        });
        setBoard(nextBoard);
      } catch (pickError) {
        await loadBoard(true);
        if (pickError instanceof ApiClientError) {
          setActionError(pickError.message);
        } else {
          setActionError('Oyuncu seçilemedi.');
        }
      } finally {
        setPickingCardId(null);
      }
    },
    [activeSlotIndex, board, code, loadBoard, pickOptions, session],
  );

  const handleSelectSlot = useCallback(
    (slotIndex: number) => {
      void openSlot(slotIndex);
    },
    [openSlot],
  );

  const closePickDrawer = useCallback(() => {
    setActiveSlotIndex(null);
    setPickOptions(null);
  }, []);

  const activeSlotLabel =
    board?.slots.find((slot) => slot.slotIndex === activeSlotIndex)?.label ?? 'Mevki';
  const pickDrawerDismissible =
    !optionsLoading && (pickOptions === null || pickOptions.options.length === 0);

  return (
    <div
      className={`play play--game play--draft${activeSlotIndex !== null ? ' play--pick-open' : ''}`}
    >
      <PlayGameBackdrop />

      <header className="play-header play-header--lobby">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <span className="play-lobby-badge">👟 İlk 11 Draft</span>
      </header>

      <main className="play-main play-main--draft">
        <PlayStageRail current="draft" />
        {error !== null ? (
          <div className="play-arena">
            <p className="play-error" role="alert">
              {error}
            </p>
          </div>
        ) : board === null ? (
          <PlayLoadingState message="Draft yükleniyor…" icon="👟" />
        ) : (
          <div className="play-arena">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">Kadronu oluştur · draft zamanı</p>
                <h1 className="play-title play-title--lobby">{board.formation.code} dizilişi</h1>
              </div>
              <span className="play-status-pill play-status-pill--started">
                {board.pickCount}/{board.rosterSize}
              </span>
            </div>

            <p className="play-subtitle">
              {board.isRosterComplete
                ? allPlayersReady
                  ? 'Herkes hazır — teknik direktör seçimine geçiliyor.'
                  : board.viewerIsReady
                    ? 'Hazırsın. Diğer oyuncular bekleniyor…'
                    : 'İlk 11 tamamlandı. Kadronu onaylamak için hazır ol.'
                : 'Boş bir mevkiye tıkla, 5 karttan birini seç ve kadrona yerleştir.'}
            </p>

            {board.isRosterComplete ? (
              <div className="play-ready-meter">
                <div className="play-ready-meter__labels">
                  <span>Hazır oyuncular</span>
                  <strong>
                    {readyCount} / {participantCount}
                  </strong>
                </div>
                <div className="play-ready-meter__track">
                  <div
                    className="play-ready-meter__fill"
                    style={{
                      width: `${participantCount === 0 ? 0 : (readyCount / participantCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}

            {board.isRosterComplete && board.participants.length > 0 ? (
              <ul className="play-roster play-roster--compact">
                {board.participants.map((participant) => {
                  const isMe = session?.participantId === participant.participantId;
                  return (
                    <li
                      key={participant.participantId}
                      className={`play-roster__slot${participant.isReady ? ' play-roster__slot--ready' : ''}${isMe ? ' play-roster__slot--me' : ''}`}
                    >
                      <div className="play-roster__info">
                        <span className="play-roster__name">
                          {participant.displayName}
                          {isMe ? <em>Sen</em> : null}
                        </span>
                        <span className="play-roster__meta">
                          {participant.isRosterComplete
                            ? participant.isReady
                              ? 'Hazır'
                              : 'Kadro tamam'
                            : 'Draft devam ediyor'}
                        </span>
                      </div>
                      <div
                        className="play-roster__status"
                        aria-label={participant.isReady ? 'Hazır' : 'Bekliyor'}
                      >
                        {participant.isReady ? (
                          <span className="play-ready-icon" title="Hazır">
                            ✓
                          </span>
                        ) : (
                          <span className="play-waiting-icon" title="Bekliyor">
                            <span />
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div className="play-draft-layout">
              <div className="play-draft-layout__pitch">
                <DraftPitchBoard
                  board={board}
                  activeSlotIndex={activeSlotIndex}
                  onSelectSlot={handleSelectSlot}
                />
              </div>
              <DraftStatsPanel board={board} />
            </div>

            {actionError !== null ? (
              <p className="play-error" role="alert">
                {actionError}
              </p>
            ) : null}

            {board.isRosterComplete ? (
              <div className="play-action-bar">
                <button
                  type="button"
                  className={`play-btn${board.viewerIsReady ? ' play-btn--ready' : ' play-btn--primary'}`}
                  disabled={readyLoading}
                  onClick={() => {
                    void handleToggleReady();
                  }}
                >
                  {readyLoading ? 'Güncelleniyor…' : board.viewerIsReady ? 'Hazırım ✓' : 'Hazırım'}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {activeSlotIndex !== null ? (
        <DraftPickDrawer
          slotLabel={activeSlotLabel}
          options={pickOptions?.options ?? []}
          loading={optionsLoading}
          pickingCardId={pickingCardId}
          dismissible={pickDrawerDismissible}
          onPick={(cardId) => {
            void handlePick(cardId);
          }}
          onClose={closePickDrawer}
        />
      ) : null}
    </div>
  );
}
