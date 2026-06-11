'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlayButton } from '@/components/play/play-button';
import { PlayGameBackdrop } from '@/components/play/play-game-backdrop';
import { runDelayedAction } from '@/lib/action-feedback-delay';
import { ApiClientError } from '@/lib/api/client';
import { createLobby } from '@/lib/api/lobbies';
import { readSavedDisplayName, saveLobbySession } from '@/lib/lobby-session';

import '../play.css';

export default function CreateLobbyPage(): React.ReactElement {
  const router = useRouter();
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState(() => readSavedDisplayName());
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (loading) {
      return;
    }

    await runDelayedAction(setLoading, async () => {
      setError(null);

      try {
        const session = await createLobby({
          name,
          displayName,
          maxPlayers: Number(maxPlayers),
        });

        saveLobbySession({
          lobbyCode: session.lobby.code,
          participantId: session.participantId,
          sessionToken: session.sessionToken,
          displayName,
        });

        router.push(`/play/room/${session.lobby.code}`);
      } catch (submitError) {
        setError(
          submitError instanceof ApiClientError
            ? submitError.message
            : 'Oda oluşturulamadı. Bilgileri kontrol edip tekrar dene.',
        );
      }
    });
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
          <span className="play-title__icon" aria-hidden>
            🏟️
          </span>
          Oda Oluştur
        </h1>
        <p className="play-subtitle">
          Kendi draft lobini aç — takım adını ve sahada görünecek ismini yaz.
        </p>

        <div className="play-arena play-form-arena">
          <form className="play-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="play-field">
              <div className="play-field__label-row">
                <span className="play-field__icon" aria-hidden>
                  🏟️
                </span>
                <label htmlFor="lobby-name">Oda adı</label>
              </div>
              <input
                id="lobby-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                placeholder="Cuma Draft"
                minLength={2}
                maxLength={80}
                required
              />
            </div>

            <div className="play-field">
              <div className="play-field__label-row">
                <span className="play-field__icon" aria-hidden>
                  👤
                </span>
                <label htmlFor="display-name">Senin adın</label>
              </div>
              <input
                id="display-name"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                }}
                placeholder="Turhan"
                minLength={2}
                maxLength={40}
                required
              />
            </div>

            <div className="play-field">
              <div className="play-field__label-row">
                <span className="play-field__icon" aria-hidden>
                  👥
                </span>
                <label htmlFor="max-players">Maksimum oyuncu</label>
              </div>
              <input
                id="max-players"
                type="number"
                min={2}
                max={12}
                value={maxPlayers}
                onChange={(event) => {
                  setMaxPlayers(event.target.value);
                }}
                required
              />
            </div>

            {error !== null ? (
              <p className="play-error" role="alert">
                {error}
              </p>
            ) : null}

            <PlayButton type="submit" loading={loading} loadingLabel="Oluşturuluyor…">
              ⚽ Odayı Oluştur
            </PlayButton>
          </form>
        </div>
      </main>
    </div>
  );
}
