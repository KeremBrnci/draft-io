'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBodyScrollLock } from '@/lib/use-body-scroll-lock';

import './league-victory.css';

interface LeagueVictoryOverlayProps {
  readonly winnerName: string;
  readonly loading: boolean;
  readonly onPlayAgain: () => void;
}

function getPortalRoot(): HTMLElement {
  return document.getElementById('app-portal') ?? document.body;
}

export function LeagueVictoryOverlay({
  winnerName,
  loading,
  onPlayAgain,
}: LeagueVictoryOverlayProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="app-overlay league-victory"
      role="dialog"
      aria-modal="true"
      aria-labelledby="league-victory-title"
    >
      <div className="app-overlay__backdrop league-victory__backdrop" aria-hidden />
      <div className="league-victory__fx" aria-hidden>
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="league-victory__spark" style={{ ['--i' as string]: index }} />
        ))}
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={`c-${index}`}
            className="league-victory__confetti-piece"
            style={{ ['--i' as string]: index }}
          />
        ))}
      </div>

      <div className="app-overlay__panel league-victory__panel">
        <div className="league-victory__crown" aria-hidden>
          👑
        </div>
        <p className="league-victory__eyebrow">Lig tamamlandı</p>
        <h2 id="league-victory-title" className="league-victory__title">
          Kazanan
        </h2>
        <p className="league-victory__winner">{winnerName}</p>
        <p className="league-victory__subtitle">
          Şampiyon belli oldu! Yeni bir draft ligi için lobiye dönün.
        </p>
        <button
          type="button"
          className="play-btn play-btn--primary league-victory__cta"
          disabled={loading}
          onClick={onPlayAgain}
        >
          {loading ? 'Hazırlanıyor…' : 'Tekrar Oyna'}
        </button>
      </div>
    </div>,
    getPortalRoot(),
  );
}
