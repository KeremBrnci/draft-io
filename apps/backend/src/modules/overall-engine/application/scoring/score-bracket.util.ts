import type { ScoreBracket } from '../../domain/config/overall-v1.config';

export function scoreFromBrackets(value: number, brackets: readonly ScoreBracket[]): number {
  let result = brackets[0]?.score ?? 0;

  for (const bracket of brackets) {
    if (value >= bracket.minValue) {
      result = bracket.score;
    }
  }

  return result;
}

export function clampScore(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function clampOverall(value: number): number {
  return Math.min(99, Math.max(1, Math.round(value)));
}
