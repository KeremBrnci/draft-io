import type { MatchEventDto } from '@draft-io/shared-types';
import { useEffect, useRef, useState } from 'react';

export interface GoalCelebrationState {
  readonly eventId: string;
  readonly teamSide: 'HOME' | 'AWAY';
  readonly playerName: string | null;
  readonly minute: number;
  readonly teamName: string;
}

const CELEBRATION_MS = 3200;

function isScoredGoalEvent(event: MatchEventDto): boolean {
  return event.isGoal && event.eventType === 'GOAL';
}

export function useGoalCelebration(
  matchId: string | null,
  events: readonly MatchEventDto[],
  teamNames: { readonly home: string; readonly away: string },
): GoalCelebrationState | null {
  const [celebration, setCelebration] = useState<GoalCelebrationState | null>(null);
  const celebratedIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    initializedRef.current = false;
    celebratedIdsRef.current = new Set();
    setCelebration(null);

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, [matchId]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (matchId === null) {
      return;
    }

    const goalEvents = events.filter(isScoredGoalEvent);

    if (!initializedRef.current) {
      for (const goal of goalEvents) {
        celebratedIdsRef.current.add(goal.id);
      }
      initializedRef.current = true;
      return;
    }

    const newGoal = goalEvents.find((goal) => !celebratedIdsRef.current.has(goal.id));
    if (newGoal === undefined) {
      return;
    }

    celebratedIdsRef.current.add(newGoal.id);

    if (newGoal.teamSide !== 'HOME' && newGoal.teamSide !== 'AWAY') {
      return;
    }

    const teamName = newGoal.teamSide === 'HOME' ? teamNames.home : teamNames.away;

    setCelebration({
      eventId: newGoal.id,
      teamSide: newGoal.teamSide,
      playerName: newGoal.playerName,
      minute: newGoal.minute,
      teamName,
    });

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setCelebration(null);
      hideTimerRef.current = null;
    }, CELEBRATION_MS);
  }, [events, matchId, teamNames.away, teamNames.home]);

  return celebration;
}
