'use client';

import type { LobbySummaryDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { PlayLoadingState } from '@/components/play/play-loading-state';
import { PlayStageRail } from '@/components/play/play-stage-rail';
import { ApiClientError } from '@/lib/api/client';
import { getLobbyByCode, setParticipantReady, startLobby } from '@/lib/api/lobbies';
import { clearLobbySession, readLobbySession, type StoredLobbySession } from '@/lib/lobby-session';
import { useRoomSocket } from '@/lib/room-socket';

import '../../play.css';

const POLL_INTERVAL_MS = 2500;

function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  const first = parts[0];
  if (parts.length === 1) {
    return first === undefined ? '?' : first.slice(0, 2).toUpperCase();
  }

  const second = parts[1];
  if (first === undefined || second === undefined) {
    return '?';
  }

  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase();
}

function statusLabel(status: LobbySummaryDto['status']): string {
  switch (status) {
    case 'OPEN':
      return 'Bekliyor';
    case 'FULL':
      return 'Dolu';
    case 'STARTED':
      return 'Başladı';
    case 'CLOSED':
      return 'Kapalı';
    default:
      return status;
  }
}

export default function LobbyRoomPage(): React.ReactElement {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();
  const [lobby, setLobby] = useState<LobbySummaryDto | null>(null);
  const [session, setSession] = useState<StoredLobbySession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [readyLoading, setReadyLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const loadLobby = useCallback(async (): Promise<void> => {
    try {
      const nextLobby = await getLobbyByCode(code);
      setLobby(nextLobby);
      setError(null);

      if (nextLobby.phase === 'FORMATION_SELECTION') {
        router.replace(`/play/room/${code}/formation`);
        return;
      }

      if (nextLobby.phase === 'DRAFT') {
        router.replace(`/play/room/${code}/draft`);
        return;
      }

      if (nextLobby.phase === 'COACH_SELECTION') {
        router.replace(`/play/room/${code}/coach-selection`);
        return;
      }

      if (nextLobby.phase === 'TEAM_REVIEW') {
        router.replace(`/play/room/${code}/team-review`);
        return;
      }

      if (nextLobby.phase === 'MATCHES') {
        router.replace(`/play/room/${code}/league`);
        return;
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 410) {
        clearLobbySession(code);
        setLobby(null);
        setError('Bu oda kodunun süresi doldu. Yeni bir oda oluşturabilirsin.');
        return;
      }

      if (error instanceof ApiClientError && error.statusCode === 404) {
        clearLobbySession(code);
        setLobby(null);
        setError('Oda bulunamadı veya kapatılmış.');
        return;
      }

      setError('Oda bulunamadı veya yüklenemedi.');
    }
  }, [code, router]);

  useRoomSocket(code, (event) => {
    if (event === 'LOBBY_RESET' || event === 'FORMATION_SELECTION_STARTED') {
      void loadLobby();
    }
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const expiresInLabel = useMemo(() => {
    if (lobby === null) {
      return null;
    }

    const remainingMs = new Date(lobby.expiresAt).getTime() - nowMs;
    if (remainingMs <= 0) {
      return 'Süre doldu';
    }

    const totalMinutes = Math.ceil(remainingMs / 60_000);
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours} sa ${minutes} dk`;
    }

    return `${totalMinutes} dk`;
  }, [lobby, nowMs]);

  useEffect(() => {
    setSession(readLobbySession(code));
    void loadLobby();
    const timer = window.setInterval(() => {
      void loadLobby();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [code, loadLobby]);

  const currentParticipant = useMemo(() => {
    if (lobby === null || session?.lobbyCode !== code) {
      return null;
    }
    return (
      lobby.participants.find((participant) => participant.id === session.participantId) ?? null
    );
  }, [code, lobby, session]);

  const isHost = currentParticipant?.isHost ?? false;
  const isReady = currentParticipant?.isReady ?? false;
  const readyCount = lobby?.participants.filter((participant) => participant.isReady).length ?? 0;
  const totalPlayers = lobby?.participants.length ?? 0;
  const allReady = totalPlayers >= 2 && readyCount === totalPlayers;
  const canStart = isHost && allReady && lobby?.phase === 'LOBBY';
  const hasValidSession = session !== null && session.lobbyCode === code;

  const startDisabledReason = useMemo(() => {
    if (!isHost || canStart) {
      return null;
    }
    if (totalPlayers < 2) {
      return 'Başlatmak için en az 2 oyuncu gerekli.';
    }
    if (readyCount < totalPlayers) {
      return `${totalPlayers - readyCount} oyuncu henüz hazır değil.`;
    }
    return 'Herkes hazır olunca başlatabilirsin.';
  }, [canStart, isHost, readyCount, totalPlayers]);

  async function handleToggleReady(): Promise<void> {
    if (!hasValidSession || lobby?.status === 'STARTED') {
      return;
    }

    setReadyLoading(true);
    setActionError(null);

    try {
      const updated = await setParticipantReady(code, {
        sessionToken: session.sessionToken,
        isReady: !isReady,
      });
      setLobby(updated);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setActionError(error.message);
      } else {
        setActionError('Hazır durumu güncellenemedi.');
      }
    } finally {
      setReadyLoading(false);
    }
  }

  async function handleStartGame(): Promise<void> {
    if (!hasValidSession || !canStart) {
      return;
    }

    setStartLoading(true);
    setActionError(null);

    try {
      await startLobby(code, { sessionToken: session.sessionToken });
      router.push(`/play/room/${code}/formation`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setActionError(error.message);
      } else {
        setActionError('Oyun başlatılamadı. Herkesin hazır olduğundan emin ol.');
      }
    } finally {
      setStartLoading(false);
    }
  }

  async function handleCopyCode(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setActionError('Kod kopyalanamadı.');
    }
  }

  return (
    <div className="play play--game play--lobby">
      <PlayGameBackdrop />

      <header className="play-header play-header--lobby">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
        <span className="play-lobby-badge">🎮 Draft Lobby</span>
      </header>

      <main className="play-main play-main--lobby">
        <PlayStageRail current="lobby" />
        {error !== null ? (
          <div className="play-arena">
            <p className="play-error" role="alert">
              {error}
            </p>
            <Link href="/play/create" className="play-btn play-btn--primary">
              Yeni oda oluştur
            </Link>
          </div>
        ) : lobby === null ? (
          <PlayLoadingState message="Oda yükleniyor…" icon="🎮" />
        ) : (
          <div className="play-arena">
            <div className="play-arena__header">
              <div>
                <p className="play-arena__eyebrow">Bekleme odası · takım arkadaşlarını topla</p>
                <h1 className="play-title play-title--lobby">{lobby.name}</h1>
              </div>
              <span className={`play-status-pill play-status-pill--${lobby.status.toLowerCase()}`}>
                {statusLabel(lobby.status)}
              </span>
            </div>

            <div className="play-code-panel">
              <div>
                <span className="play-code-panel__label">Arkadaşların için oda kodu</span>
                <strong className="play-code-panel__code">{lobby.code}</strong>
                {expiresInLabel !== null ? (
                  <span className="play-code-panel__expiry">Kod geçerliliği: {expiresInLabel}</span>
                ) : null}
              </div>
              <button
                type="button"
                className="play-btn play-btn--ghost"
                onClick={() => void handleCopyCode()}
              >
                {copied ? 'Kopyalandı ✓' : 'Kopyala'}
              </button>
            </div>

            <div className="play-ready-meter">
              <div className="play-ready-meter__labels">
                <span>Hazır oyuncular</span>
                <strong>
                  {readyCount} / {lobby.maxPlayers}
                </strong>
              </div>
              <div className="play-ready-meter__track">
                <div
                  className="play-ready-meter__fill"
                  style={{
                    width: `${lobby.maxPlayers === 0 ? 0 : (readyCount / lobby.maxPlayers) * 100}%`,
                  }}
                />
              </div>
              <p className="play-ready-meter__hint">
                {allReady
                  ? 'Herkes hazır — kurucu draftı başlatabilir.'
                  : `${totalPlayers} oyuncu katıldı · en az 2 kişi hazır olmalı`}
              </p>
            </div>

            <ul className="play-roster">
              {lobby.participants.map((participant, index) => {
                const isMe = session?.participantId === participant.id;
                return (
                  <li
                    key={participant.id}
                    className={`play-roster__slot${participant.isReady ? ' play-roster__slot--ready' : ''}${isMe ? ' play-roster__slot--me' : ''}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="play-roster__avatar">
                      {playerInitials(participant.displayName)}
                    </div>
                    <div className="play-roster__info">
                      <span className="play-roster__name">
                        {participant.displayName}
                        {isMe ? <em>Sen</em> : null}
                      </span>
                      <span className="play-roster__meta">
                        {participant.isHost ? 'Kurucu' : 'Oyuncu'}
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

              {Array.from({
                length: Math.max(0, lobby.maxPlayers - lobby.participants.length),
              }).map((_, index) => (
                <li key={`empty-${index}`} className="play-roster__slot play-roster__slot--empty">
                  <div className="play-roster__avatar play-roster__avatar--empty">?</div>
                  <div className="play-roster__info">
                    <span className="play-roster__name play-roster__name--muted">Boş slot</span>
                    <span className="play-roster__meta">Bekleniyor…</span>
                  </div>
                </li>
              ))}
            </ul>

            {!hasValidSession ? (
              <p className="play-callout">
                Bu odayı yönetmek için aynı tarayıcıdan odaya katılmış olmalısın.
              </p>
            ) : lobby.phase === 'DRAFT' ? (
              <div className="play-started-banner">
                <span className="play-started-banner__pulse" />
                <div>
                  <strong>Draft devam ediyor</strong>
                  <p>İlk 11 ekranına yönlendiriliyorsun…</p>
                </div>
              </div>
            ) : lobby.phase !== 'LOBBY' ? (
              <div className="play-started-banner">
                <span className="play-started-banner__pulse" />
                <div>
                  <strong>Oyun devam ediyor</strong>
                  <p>Formasyon seçimine yönlendiriliyorsun…</p>
                </div>
              </div>
            ) : (
              <div className="play-action-bar">
                <button
                  type="button"
                  className={`play-btn${isReady ? ' play-btn--ready' : ' play-btn--primary'}`}
                  disabled={readyLoading}
                  onClick={() => void handleToggleReady()}
                >
                  {readyLoading ? 'Güncelleniyor…' : isReady ? 'Hazırım ✓' : 'Hazırım'}
                </button>

                {isHost ? (
                  <div className="play-host-start">
                    <button
                      type="button"
                      className={`play-btn play-btn--start${canStart ? ' play-btn--start-active' : ' play-btn--start-disabled'}`}
                      disabled={!canStart || startLoading}
                      onClick={() => void handleStartGame()}
                      aria-describedby={startDisabledReason ? 'start-hint' : undefined}
                    >
                      {startLoading ? 'Başlatılıyor…' : 'Formasyon Seçimine Başlat'}
                    </button>
                    {startDisabledReason !== null ? (
                      <p id="start-hint" className="play-action-bar__hint">
                        {startDisabledReason}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="play-action-bar__hint">
                    Kurucu herkes hazır olunca oyunu başlatır.
                  </p>
                )}
              </div>
            )}

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
