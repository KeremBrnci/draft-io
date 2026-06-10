import type { RandomSource } from '../../domain/ports/random-source.port';

export class SeededRandomSource implements RandomSource {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    const lower = Math.ceil(min);
    const upper = Math.floor(max);
    return Math.floor(this.next() * (upper - lower + 1)) + lower;
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = this.nextInt(0, index);
      const current = copy[index];
      const swap = copy[swapIndex];
      if (current !== undefined && swap !== undefined) {
        copy[index] = swap;
        copy[swapIndex] = current;
      }
    }
    return copy;
  }
}
