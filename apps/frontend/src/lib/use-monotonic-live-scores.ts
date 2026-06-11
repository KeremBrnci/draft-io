import type { MatchStateDto } from '@draft-io/shared-types';
import { useRef } from 'react';

import { resolveLiveMatchScores } from '@/lib/match-live-score';

interface LiveScores {
  readonly homeScore: number;
  readonly awayScore: number;
}

export function useMonotonicLiveScores(match: MatchStateDto | null): LiveScores {
  const trackerRef = useRef<{
    matchId: string | null;
    homeScore: number;
    awayScore: number;
  }>({
    matchId: null,
    homeScore: 0,
    awayScore: 0,
  });

  if (match === null) {
    return { homeScore: 0, awayScore: 0 };
  }

  if (trackerRef.current.matchId !== match.id) {
    trackerRef.current = {
      matchId: match.id,
      homeScore: 0,
      awayScore: 0,
    };
  }

  if (match.status === 'FULL_TIME') {
    trackerRef.current.homeScore = match.homeScore;
    trackerRef.current.awayScore = match.awayScore;
    return { homeScore: match.homeScore, awayScore: match.awayScore };
  }

  const derived = resolveLiveMatchScores(match);
  trackerRef.current.homeScore = Math.max(trackerRef.current.homeScore, derived.homeScore);
  trackerRef.current.awayScore = Math.max(trackerRef.current.awayScore, derived.awayScore);

  return {
    homeScore: trackerRef.current.homeScore,
    awayScore: trackerRef.current.awayScore,
  };
}
