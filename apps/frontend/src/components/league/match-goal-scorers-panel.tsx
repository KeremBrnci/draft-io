'use client';

import type { MatchEventDto, MatchStoppageTimeDto } from '@draft-io/shared-types';
import { useMemo } from 'react';

import { extractMatchGoalsByTeam, type MatchGoalEntry } from '@/lib/match-goal-scorers';

import './match-goal-scorers.css';

interface MatchGoalScorersPanelProps {
  readonly events: readonly MatchEventDto[];
  readonly homeName: string;
  readonly awayName: string;
  readonly stoppage: MatchStoppageTimeDto;
}

function TeamGoals({
  teamName,
  goals,
  align,
}: {
  readonly teamName: string;
  readonly goals: readonly MatchGoalEntry[];
  readonly align: 'home' | 'away';
}): React.ReactElement {
  return (
    <div className={`match-goal-scorers__team match-goal-scorers__team--${align}`}>
      <h4 className="match-goal-scorers__team-name">{teamName}</h4>
      {goals.length === 0 ? (
        <p className="match-goal-scorers__empty">—</p>
      ) : (
        <ul className="match-goal-scorers__list">
          {goals.map((goal) => (
            <li key={goal.id} className="match-goal-scorers__item">
              <span className="match-goal-scorers__minute">{goal.minuteLabel}&apos;</span>
              <span className="match-goal-scorers__player">
                {goal.playerName}
                {goal.assistName !== null ? (
                  <span className="match-goal-scorers__assist"> ({goal.assistName})</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MatchGoalScorersPanel({
  events,
  homeName,
  awayName,
  stoppage,
}: MatchGoalScorersPanelProps): React.ReactElement | null {
  const goals = useMemo(() => extractMatchGoalsByTeam(events, stoppage), [events, stoppage]);

  if (goals.home.length === 0 && goals.away.length === 0) {
    return null;
  }

  return (
    <section className="match-goal-scorers" aria-label="Gol atanlar">
      <h3 className="match-goal-scorers__title">Goller</h3>
      <div className="match-goal-scorers__grid">
        <TeamGoals teamName={homeName} goals={goals.home} align="home" />
        <TeamGoals teamName={awayName} goals={goals.away} align="away" />
      </div>
    </section>
  );
}
