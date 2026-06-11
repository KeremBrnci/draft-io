export type PlayGameStage = 'lobby' | 'formation' | 'draft' | 'coach' | 'league';

const STAGES = [
  { id: 'lobby', icon: '🎮', label: 'Lobi' },
  { id: 'formation', icon: '📋', label: 'Formasyon' },
  { id: 'draft', icon: '👟', label: 'Draft' },
  { id: 'coach', icon: '🧢', label: 'TD' },
  { id: 'league', icon: '🏟️', label: 'Lig' },
] as const satisfies readonly { id: PlayGameStage; icon: string; label: string }[];

interface PlayStageRailProps {
  readonly current: PlayGameStage;
}

export function PlayStageRail({ current }: PlayStageRailProps): React.ReactElement {
  const currentIndex = STAGES.findIndex((stage) => stage.id === current);

  return (
    <nav className="play-stage-rail" aria-label="Oyun aşamaları">
      <ol className="play-stage-rail__list">
        {STAGES.map((stage, index) => {
          const state =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';

          return (
            <li
              key={stage.id}
              className={`play-stage-rail__step play-stage-rail__step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="play-stage-rail__node" aria-hidden>
                <span className="play-stage-rail__icon">{stage.icon}</span>
              </span>
              <span className="play-stage-rail__label">{stage.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
