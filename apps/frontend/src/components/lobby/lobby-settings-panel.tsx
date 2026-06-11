'use client';

import type { LobbySummaryDto } from '@draft-io/shared-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PlayButton } from '@/components/play/play-button';
import { listLeagues, type LeagueSummaryDto } from '@/lib/api/catalog';
import { updateLobbySettings } from '@/lib/api/lobbies';

import './lobby-settings.css';

interface LobbySettingsPanelProps {
  readonly lobby: LobbySummaryDto;
  readonly sessionToken: string | null;
  readonly isHost: boolean;
  readonly onUpdated: (lobby: LobbySummaryDto) => void;
}

export function LobbySettingsPanel({
  lobby,
  sessionToken,
  isHost,
  onUpdated,
}: LobbySettingsPanelProps): React.ReactElement {
  const [leagues, setLeagues] = useState<readonly LeagueSummaryDto[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [useAllLeagues, setUseAllLeagues] = useState(lobby.draftLeagueIds.length === 0);
  const [selectedLeagueIds, setSelectedLeagueIds] = useState<readonly string[]>(
    lobby.draftLeagueIds,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUseAllLeagues(lobby.draftLeagueIds.length === 0);
    setSelectedLeagueIds(lobby.draftLeagueIds);
  }, [lobby.draftLeagueIds]);

  useEffect(() => {
    let cancelled = false;

    void listLeagues()
      .then((loaded) => {
        if (!cancelled) {
          setLeagues(loaded);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Lig listesi yüklenemedi.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingLeagues(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedLeagues = useMemo(
    () => [...leagues].sort((left, right) => left.name.localeCompare(right.name, 'tr')),
    [leagues],
  );

  const selectionSummary = useMemo(() => {
    if (useAllLeagues) {
      return 'Tüm ligler';
    }

    if (selectedLeagueIds.length === 0) {
      return 'Lig seçilmedi';
    }

    const names = selectedLeagueIds
      .map((id) => leagues.find((league) => league.id === id)?.name)
      .filter((name): name is string => typeof name === 'string');

    return names.join(', ');
  }, [leagues, selectedLeagueIds, useAllLeagues]);

  const toggleLeague = useCallback((leagueId: string): void => {
    setSelectedLeagueIds((current) =>
      current.includes(leagueId)
        ? current.filter((id) => id !== leagueId)
        : [...current, leagueId],
    );
    setSaved(false);
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (sessionToken === null || !isHost || saving) {
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const next = await updateLobbySettings(lobby.code, {
        sessionToken,
        draftLeagueIds: useAllLeagues ? [] : [...selectedLeagueIds],
      });
      onUpdated(next);
      setSaved(true);
    } catch {
      setError('Lobi ayarları kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }, [isHost, lobby.code, onUpdated, saving, selectedLeagueIds, sessionToken, useAllLeagues]);

  const editable = isHost && lobby.phase === 'LOBBY';

  return (
    <section className="lobby-settings" aria-label="Lobi ayarları">
      <header className="lobby-settings__header">
        <div>
          <h2 className="lobby-settings__title">Lobi özellikleri</h2>
          <p className="lobby-settings__subtitle">Draft havuzunda hangi liglerden oyuncu gelsin?</p>
        </div>
        <span className="lobby-settings__summary">{selectionSummary}</span>
      </header>

      {loadingLeagues ? (
        <p className="lobby-settings__hint">Ligler yükleniyor…</p>
      ) : (
        <>
          <label className="lobby-settings__mode">
            <input
              type="radio"
              name="league-scope"
              checked={useAllLeagues}
              disabled={!editable}
              onChange={() => {
                setUseAllLeagues(true);
                setSaved(false);
              }}
            />
            <span>Tüm ligler</span>
          </label>

          <label className="lobby-settings__mode">
            <input
              type="radio"
              name="league-scope"
              checked={!useAllLeagues}
              disabled={!editable}
              onChange={() => {
                setUseAllLeagues(false);
                setSaved(false);
              }}
            />
            <span>Seçili ligler</span>
          </label>

          {!useAllLeagues ? (
            <ul className="lobby-settings__leagues">
              {sortedLeagues.map((league) => {
                const checked = selectedLeagueIds.includes(league.id);
                return (
                  <li key={league.id}>
                    <label className={`lobby-settings__league${checked ? ' lobby-settings__league--active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!editable}
                        onChange={() => {
                          toggleLeague(league.id);
                        }}
                      />
                      <span className="lobby-settings__league-name">{league.name}</span>
                      {league.country !== null ? (
                        <span className="lobby-settings__league-country">{league.country}</span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      )}

      {!editable ? (
        <p className="lobby-settings__hint">Ayarlar yalnızca oyun başlamadan önce kurucu tarafından değiştirilebilir.</p>
      ) : null}

      {error !== null ? (
        <p className="play-error" role="alert">
          {error}
        </p>
      ) : null}

      {saved ? <p className="lobby-settings__saved">Ayarlar kaydedildi.</p> : null}

      {editable ? (
        <PlayButton
          type="button"
          className="play-btn--ghost"
          loading={saving}
          loadingLabel="Kaydediliyor…"
          disabled={!useAllLeagues && selectedLeagueIds.length === 0}
          onClick={() => {
            void handleSave();
          }}
        >
          Ayarları kaydet
        </PlayButton>
      ) : null}
    </section>
  );
}
