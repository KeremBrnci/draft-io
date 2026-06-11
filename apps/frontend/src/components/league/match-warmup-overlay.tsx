'use client';

export function MatchWarmupOverlay(): React.ReactElement {
  return (
    <div className="league-warmup" role="status" aria-live="polite">
      <span className="league-warmup__pulse" aria-hidden />
      <div className="league-warmup__content">
        <span className="league-warmup__icon" aria-hidden>
          🏟️
        </span>
        <strong>Isınma</strong>
        <p>Takımlar sahaya çıkıyor…</p>
      </div>
    </div>
  );
}
