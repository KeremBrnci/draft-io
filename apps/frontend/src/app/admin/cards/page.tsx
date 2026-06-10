'use client';

import type { CoachBrowserItemDto, PlayerBrowserItemDto } from '@draft-io/shared-types';
import { useCallback, useEffect, useState } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CARD_VARIANT_THEMES, CoachCard, PlayerCard } from '@/components/cards';
import { browseCoaches } from '@/lib/api/coaches';
import { browsePlayers } from '@/lib/api/players';

const BASE_THEME = CARD_VARIANT_THEMES.base;
const FEATURED_PLAYER_NAMES = [
  "N'Golo Kanté",
  'Kevin De Bruyne',
  'Robert Lewandowski',
  'Lamine Yamal',
];

export default function AdminCardsPage(): React.ReactElement {
  const [featuredPlayer, setFeaturedPlayer] = useState<PlayerBrowserItemDto | null>(null);
  const [samplePlayers, setSamplePlayers] = useState<readonly PlayerBrowserItemDto[]>([]);
  const [sampleCoaches, setSampleCoaches] = useState<readonly CoachBrowserItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSamples = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const [playersPage, coachesPage, featuredResults] = await Promise.all([
        browsePlayers({
          hasImage: true,
          sortField: 'marketValue',
          sortDirection: 'desc',
          pageSize: 8,
        }),
        browseCoaches({
          hasImage: true,
          sortField: 'name',
          sortDirection: 'asc',
          pageSize: 6,
        }),
        Promise.all(
          FEATURED_PLAYER_NAMES.map((name) =>
            browsePlayers({ name, hasImage: true, pageSize: 1 }).then(
              (page) => page.data[0] ?? null,
            ),
          ),
        ),
      ]);

      const featured =
        featuredResults.find((player) => player !== null) ??
        playersPage.data.find((player) => player.overall !== null) ??
        playersPage.data[0] ??
        null;

      setFeaturedPlayer(featured);
      setSamplePlayers(playersPage.data);
      setSampleCoaches(coachesPage.data);
    } catch {
      setError('Kart önizlemesi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSamples();
  }, [loadSamples]);

  return (
    <>
      <AdminPageHeader
        title="Kart Şablonu"
        description="Base kart şablonu — oyuncu ve teknik direktör collectible önizlemesi."
      />

      {error !== null ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="card-showcase-hero">
        <div className="card-showcase-hero__copy">
          <h2>{BASE_THEME.label} Template</h2>
          <p>
            Modern luxury trading card silueti: geniş yatay üst kenar, hafif yan taper ve minimal
            alt uzantı. Şampanya altın malzeme, ince border ve saten yansımalar. Kulüp logosu yok;
            yalnızca ülke bayrağı, lig göstergesi ve kart tipi. Hero, Icon, TOTY ve Event ileride
            güncelleme olarak eklenecek.
          </p>
        </div>
        <div className="card-showcase-hero__card">
          {loading || featuredPlayer === null ? (
            <div
              className="fc-card fc-card--md fc-card--base"
              style={{ width: 220, opacity: 0.35 }}
            />
          ) : (
            <PlayerCard player={featuredPlayer} size="lg" />
          )}
        </div>
      </section>

      <section className="card-preview-section">
        <h3 className="card-preview-section__title">Oyuncular</h3>
        <div className="card-preview-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="fc-card fc-card--md" style={{ opacity: 0.25 }} />
              ))
            : samplePlayers.map((player) => (
                <div key={player.id} className="card-preview-item">
                  <PlayerCard player={player} />
                  <span className="card-preview-item__label">{player.displayName}</span>
                </div>
              ))}
        </div>
      </section>

      <section className="card-preview-section">
        <h3 className="card-preview-section__title">Teknik Direktörler</h3>
        <div className="card-preview-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="fc-card fc-card--md" style={{ opacity: 0.25 }} />
              ))
            : sampleCoaches.map((coach) => (
                <div key={coach.id} className="card-preview-item">
                  <CoachCard coach={coach} />
                  <span className="card-preview-item__label">{coach.displayName}</span>
                </div>
              ))}
        </div>
      </section>
    </>
  );
}
