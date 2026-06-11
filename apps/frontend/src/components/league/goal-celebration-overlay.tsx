'use client';

import type { GoalCelebrationState } from '@/lib/use-goal-celebration';

interface GoalCelebrationOverlayProps {
  readonly celebration: GoalCelebrationState;
}

export function GoalCelebrationOverlay({
  celebration,
}: GoalCelebrationOverlayProps): React.ReactElement {
  return (
    <div
      className="league-goal-celebration"
      role="status"
      aria-live="assertive"
      aria-label={`Gol! ${celebration.teamName}${celebration.playerName !== null ? ` — ${celebration.playerName}` : ''}`}
    >
      <div className="league-goal-celebration__flash" aria-hidden />
      <div className="league-goal-celebration__burst" aria-hidden>
        {['⚽', '✨', '⚽', '✨', '⚽'].map((symbol, index) => (
          <span
            key={`${celebration.eventId}-${index}`}
            className="league-goal-celebration__particle"
            style={{ '--i': index } as React.CSSProperties}
          >
            {symbol}
          </span>
        ))}
      </div>
      <div className="league-goal-celebration__panel">
        <p className="league-goal-celebration__minute">{celebration.minute}&apos;</p>
        <p className="league-goal-celebration__title">GOL!</p>
        <p className="league-goal-celebration__team">{celebration.teamName}</p>
        {celebration.playerName !== null ? (
          <p className="league-goal-celebration__scorer">{celebration.playerName}</p>
        ) : null}
      </div>
    </div>
  );
}
