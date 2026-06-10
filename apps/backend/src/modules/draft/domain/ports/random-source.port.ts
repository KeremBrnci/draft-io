export interface RandomSource {
  next(): number;
  nextInt(min: number, max: number): number;
  shuffle<T>(items: readonly T[]): T[];
}

export const RANDOM_SOURCE = Symbol('RANDOM_SOURCE');
