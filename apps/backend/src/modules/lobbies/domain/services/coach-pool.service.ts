/** Number of coaches offered to each player after draft. */
export const COACH_POOL_SIZE = 6;

export interface CoachPoolEntry {
  readonly id: string;
}

export class CoachPoolService {
  assignPersonalPools(
    lobbyId: string,
    participantIds: readonly string[],
    allCoaches: readonly CoachPoolEntry[],
  ): Map<string, readonly string[]> {
    const poolSize = Math.min(COACH_POOL_SIZE, allCoaches.length);
    if (poolSize === 0) {
      throw new Error('Not enough coaches in catalog to build personal pools');
    }

    const catalog = shuffleDeterministic(allCoaches, `${lobbyId}:coach-catalog`);
    const pools = new Map<string, readonly string[]>();
    const participantCount = participantIds.length;

    for (let index = 0; index < participantIds.length; index += 1) {
      const participantId = participantIds[index]!;
      const offset = Math.floor((index * catalog.length) / Math.max(1, participantCount));
      const picked: string[] = [];
      const used = new Set<string>();

      for (let step = 0; picked.length < poolSize && step < catalog.length; step += 1) {
        const coach = catalog[(offset + step) % catalog.length]!;
        if (!used.has(coach.id)) {
          used.add(coach.id);
          picked.push(coach.id);
        }
      }

      pools.set(participantId, picked);
    }

    return pools;
  }
}

function shuffleDeterministic<T extends { readonly id: string }>(
  items: readonly T[],
  seed: string,
): readonly T[] {
  const copy = [...items];
  let state = hashSeed(seed);

  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = nextRandom(state);
    const swapIndex = state % (index + 1);
    const current = copy[index]!;
    copy[index] = copy[swapIndex]!;
    copy[swapIndex] = current;
  }

  return copy;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function nextRandom(state: number): number {
  return Math.imul(1664525, state + 1013904223) >>> 0;
}
