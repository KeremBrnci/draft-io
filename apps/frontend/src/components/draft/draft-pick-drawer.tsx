'use client';

import type { DraftPickOptionDto } from '@draft-io/shared-types';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { mapCardTypeToVariant } from './map-card-type-to-variant';

import { FootballCard } from '@/components/cards/football-card';


interface DraftPickDrawerProps {
  readonly slotLabel: string;
  readonly options: readonly DraftPickOptionDto[];
  readonly loading: boolean;
  readonly pickingCardId: string | null;
  readonly dismissible?: boolean;
  readonly onPick: (cardId: string) => void;
  readonly onClose: () => void;
}

export function DraftPickDrawer({
  slotLabel,
  options,
  loading,
  pickingCardId,
  dismissible = false,
  onPick,
  onClose,
}: DraftPickDrawerProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && dismissible) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismissible, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="draft-pick-drawer" role="dialog" aria-modal="true" aria-label={`${slotLabel} için oyuncu seç`}>
      <div
        className="draft-pick-drawer__backdrop"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div className="draft-pick-drawer__spotlight" aria-hidden />

      <div className="draft-pick-drawer__panel">
        <div className="draft-pick-drawer__panel-glow" aria-hidden />

        <header className="draft-pick-drawer__header">
          <div className="draft-pick-drawer__header-main">
            <span className="draft-pick-drawer__position-badge">{slotLabel}</span>
            <p className="draft-pick-drawer__eyebrow">Oyuncu seçimi</p>
            <h2 className="draft-pick-drawer__title">Kadroya kimi alıyorsun?</h2>
            <p className="draft-pick-drawer__subtitle">
              5 karttan birini seç — kimya artışı her kartın altında.
            </p>
          </div>
          {dismissible ? (
            <button type="button" className="draft-pick-drawer__close" onClick={onClose} aria-label="Kapat">
              ✕
            </button>
          ) : null}
        </header>

        {loading ? (
          <div className="draft-pick-drawer__loading">
            <div className="draft-pick-drawer__loading-ball" aria-hidden>⚽</div>
            <div className="play-loader" />
            <p>Kartlar dağıtılıyor…</p>
          </div>
        ) : options.length === 0 ? (
          <p className="draft-pick-drawer__empty">Bu mevki için kart bulunamadı.</p>
        ) : (
          <div className="draft-pick-drawer__grid">
            {options.map((option, index) => {
              const isPicking = pickingCardId === option.cardId;
              const isDisabled = pickingCardId !== null && !isPicking;

              return (
                <button
                  key={option.cardId}
                  type="button"
                  className={`draft-pick-drawer__option${isPicking ? ' draft-pick-drawer__option--picking' : ''}${isDisabled ? ' draft-pick-drawer__option--dimmed' : ''}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                  disabled={pickingCardId !== null}
                  onClick={() => { onPick(option.cardId); }}
                >
                  <span className="draft-pick-drawer__option-ring" aria-hidden />
                  <span className="draft-pick-drawer__option-shine" aria-hidden />
                  <FootballCard
                    face={{
                      displayName: option.face.displayName,
                      imageUrl: option.face.imageUrl,
                      rating: option.face.rating,
                      subtitle: option.face.subtitle,
                      nationalityFlagUrl: option.face.nationalityFlagUrl,
                      ...(option.face.nationalityLabel !== undefined
                        ? { nationalityLabel: option.face.nationalityLabel }
                        : {}),
                      leagueName: option.face.leagueName,
                      leagueLogoUrl: option.face.leagueLogoUrl,
                    }}
                    variant={mapCardTypeToVariant(option.face.cardTypeCode)}
                    size="md"
                  />
                  <div className="draft-pick-drawer__option-footer">
                    <div className="draft-pick-drawer__chips">
                      <span className="draft-pick-drawer__chip draft-pick-drawer__chip--chem">
                        +{option.projectedChemistry} kimya
                      </span>
                    </div>
                    <span className="draft-pick-drawer__pick-hint">Seç</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
