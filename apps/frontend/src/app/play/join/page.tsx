'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { joinLobby } from '@/lib/api/lobbies';
import { readLobbySession, readSavedDisplayName, saveLobbySession } from '@/lib/lobby-session';


import '../play.css';

export default function JoinLobbyPage(): React.ReactElement {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState(() => readSavedDisplayName());
  const [existingSessionCode, setExistingSessionCode] = useState<string | null>(null);

  useEffect(() => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 6) {
      setExistingSessionCode(null);
      return;
    }

    const existing = readLobbySession(normalized);
    setExistingSessionCode(existing !== null ? normalized : null);
  }, [code]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await joinLobby({
        code: code.toUpperCase(),
        displayName,
      });

      saveLobbySession({
        lobbyCode: session.lobby.code,
        participantId: session.participantId,
        sessionToken: session.sessionToken,
        displayName,
      });

      router.push(`/play/room/${session.lobby.code}`);
    } catch {
      setError('Odaya katılınamadı. Kodu ve adını kontrol edip tekrar dene.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="play play--game">
      <PlayGameBackdrop />

      <header className="play-header">
        <Link href="/play" className="play-header__brand">
          draft<span>.io</span>
        </Link>
      </header>

      <main className="play-main">
        <Link href="/play" className="play-back">
          ← Oyna
        </Link>
        <h1 className="play-title play-title--game">
          <span className="play-title__icon" aria-hidden>🎮</span>
          Odaya Katıl
        </h1>
        <p className="play-subtitle">Arkadaşının paylaştığı 6 haneli kodla sahaya gir.</p>

        <form className="play-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="play-field">
            <label htmlFor="lobby-code">Oda kodu</label>
            <input
              id="lobby-code"
              value={code}
              onChange={(event) => { setCode(event.target.value.toUpperCase()); }}
              placeholder="ABC123"
              minLength={6}
              maxLength={6}
              required
            />
          </div>

          <div className="play-field">
            <label htmlFor="display-name">Senin adın</label>
            <input
              id="display-name"
              value={displayName}
              onChange={(event) => { setDisplayName(event.target.value); }}
              placeholder="Misafir"
              minLength={2}
              maxLength={40}
              required
            />
          </div>

          {existingSessionCode !== null ? (
            <p className="play-callout">
              Bu odaya daha önce <strong>{readLobbySession(existingSessionCode)?.displayName}</strong> olarak
              katıldın.{' '}
              <Link href={`/play/room/${existingSessionCode}`}>Odaya devam et</Link>
            </p>
          ) : null}

          {error !== null ? (
            <p className="play-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="play-btn" type="submit" disabled={loading}>
            {loading ? 'Katılınıyor…' : '⚽ Odaya Katıl'}
          </button>
        </form>
      </main>
    </div>
  );
}
