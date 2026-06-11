'use client';

import type { DraftPickOptionDto } from '@draft-io/shared-types';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { mapCardTypeToVariant } from './map-card-type-to-variant';
import { mapDraftCardFace } from './map-draft-card-face';

import { DraftPlayerChemistryBadge } from './draft-player-chemistry-badge';

import { FootballCard } from '@/components/cards/football-card';
import { useBodyScrollLock } from '@/lib/use-body-scroll-lock';

interface DraftPickDrawerProps {
  readonly slotLabel: string;
  readonly options: readonly DraftPickOptionDto[];
  readonly loading: boolean;
  readonly pickingCardId: string | null;
  readonly dismissible?: boolean;
  readonly onPick: (cardId: string) => void;
  readonly onClose: () => void;
}

function getPortalRoot(): HTMLElement {
  return document.getElementById('app-portal') ?? document.body;
}

export const DraftPickDrawer = memo(function DraftPickDrawer({
  slotLabel,
  options,
  loading,
  pickingCardId,
  dismissible = false,
  onPick,
  onClose,
}: DraftPickDrawerProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && dismissible) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismissible, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="app-overlay draft-pick-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={`${slotLabel} için oyuncu seç`}
    >
      <div
        className="app-overlay__backdrop draft-pick-drawer__backdrop"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      <div className="app-overlay__panel draft-pick-drawer__panel">
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
            <button
              type="button"
              className="draft-pick-drawer__close"
              onClick={onClose}
              aria-label="Kapat"
            >
              ✕
            </button>
          ) : null}
        </header>

        {loading ? (
          <div className="draft-pick-drawer__loading">
            <div className="draft-pick-drawer__loading-ball" aria-hidden>
              ⚽
            </div>
            <div className="play-loader" />
            <p>Kartlar dağıtılıyor…</p>
          </div>
        ) : options.length === 0 ? (
          <p className="draft-pick-drawer__empty">Bu mevki için kart bulunamadı.</p>
        ) : (
          <div className="draft-pick-drawer__grid">
            {options.map((option) => (
              <DraftPickOption
                key={option.cardId}
                option={option}
                pickingCardId={pickingCardId}
                onPick={onPick}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    getPortalRoot(),
  );
});

const DraftPickOption = memo(function DraftPickOption({
  option,
  pickingCardId,
  onPick,
}: {
  readonly option: DraftPickOptionDto;
  readonly pickingCardId: string | null;
  readonly onPick: (cardId: string) => void;
}): React.ReactElement {
  const isPicking = pickingCardId === option.cardId;
  const isDisabled = pickingCardId !== null && !isPicking;

  return (
    <button
      type="button"
      className={`draft-pick-drawer__option${isPicking ? ' draft-pick-drawer__option--picking' : ''}${isDisabled ? ' draft-pick-drawer__option--dimmed' : ''}`}
      disabled={pickingCardId !== null}
      aria-busy={isPicking}
      onClick={() => {
        onPick(option.cardId);
      }}
    >
      {isPicking ? <span className="draft-pick-drawer__option-spinner" aria-hidden /> : null}
      <FootballCard
        face={mapDraftCardFace(option.face)}
        variant={mapCardTypeToVariant(option.face.cardTypeCode)}
        size="md"
        visual="interactive"
      />
      <p className="draft-pick-drawer__player-name" title={option.displayName}>
        {option.displayName}
      </p>
      <div className="draft-pick-drawer__option-footer">
        <div className="draft-pick-drawer__chips">
          <DraftPlayerChemistryBadge
            chemistry={option.projectedChemistry}
            showZero
            suffix="kimya"
            className="draft-pick-drawer__chip draft-pick-drawer__chip--chem"
          />
        </div>
        <span className="draft-pick-drawer__pick-hint">Seç</span>
      </div>
    </button>
  );
});
