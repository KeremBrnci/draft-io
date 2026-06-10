import type { Formation } from '../../../formations/domain/entities/formation.entity';

/** Number of random formations offered to each player during selection. */
export const FORMATION_POOL_SIZE = 5;

export class FormationPoolService {
  assignPersonalPools(
    lobbyId: string,
    participantIds: readonly string[],
    allFormations: readonly Formation[],
  ): Map<string, readonly string[]> {
    if (allFormations.length < FORMATION_POOL_SIZE) {
      throw new Error('Not enough formations in catalog to build personal pools');
    }

    const pools = new Map<string, readonly string[]>();

    for (const participantId of participantIds) {
      const shuffled = shuffleDeterministic(allFormations, `${lobbyId}:${participantId}`);
      pools.set(
        participantId,
        shuffled.slice(0, FORMATION_POOL_SIZE).map((formation) => formation.id),
      );
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
