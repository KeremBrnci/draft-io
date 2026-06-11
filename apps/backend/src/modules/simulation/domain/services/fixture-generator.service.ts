export interface FixturePair {
  /** Encoded schedule position: scheduleRound * 100 + matchInRound */
  readonly roundNumber: number;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
}

const BYE = '__BYE__';

function rotateRight<T>(items: readonly T[]): T[] {
  if (items.length <= 1) {
    return [...items];
  }

  const last = items[items.length - 1];
  if (last === undefined) {
    return [...items];
  }

  return [last, ...items.slice(0, items.length - 1)];
}

interface RoundPairing {
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
}

function buildCircleRoundPairings(participantIds: readonly string[]): RoundPairing[][] {
  const ids = [...participantIds];
  if (ids.length % 2 !== 0) {
    ids.push(BYE);
  }

  const playerCount = ids.length;
  if (playerCount < 2) {
    return [];
  }

  const fixed = ids[0];
  if (fixed === undefined) {
    return [];
  }

  let rotating = ids.slice(1);
  const rounds: RoundPairing[][] = [];

  for (let roundIndex = 0; roundIndex < playerCount - 1; roundIndex += 1) {
    const order = [fixed, ...rotating];
    const pairings: RoundPairing[] = [];

    for (let slot = 0; slot < playerCount / 2; slot += 1) {
      const left = order[slot];
      const right = order[playerCount - 1 - slot];
      if (left === undefined || right === undefined || left === BYE || right === BYE) {
        continue;
      }

      const leftIndex = participantIds.indexOf(left);
      const rightIndex = participantIds.indexOf(right);
      const homeFirst = leftIndex <= rightIndex;
      pairings.push(
        roundIndex % 2 === 0
          ? homeFirst
            ? { homeParticipantId: left, awayParticipantId: right }
            : { homeParticipantId: right, awayParticipantId: left }
          : homeFirst
            ? { homeParticipantId: right, awayParticipantId: left }
            : { homeParticipantId: left, awayParticipantId: right },
      );
    }

    rounds.push(pairings);
    rotating = rotateRight(rotating);
  }

  return rounds;
}

function encodeRoundNumber(scheduleRound: number, matchInRound: number): number {
  return scheduleRound * 100 + matchInRound;
}

/**
 * Double round-robin with circle scheduling:
 * - Each tournament round has at most one match per player.
 * - Second leg mirrors the first leg in reverse order (first opponent = last opponent).
 */
export function generateDoubleRoundRobinFixtures(
  participantIds: readonly string[],
): readonly FixturePair[] {
  if (participantIds.length < 2) {
    return [];
  }

  const firstLegRounds = buildCircleRoundPairings(participantIds);
  const secondLegRounds = firstLegRounds.map((round) =>
    round.map((pairing) => ({
      homeParticipantId: pairing.awayParticipantId,
      awayParticipantId: pairing.homeParticipantId,
    })),
  );

  const fixtures: FixturePair[] = [];
  let scheduleRound = 1;

  for (const round of firstLegRounds) {
    round.forEach((pairing, index) => {
      fixtures.push({
        roundNumber: encodeRoundNumber(scheduleRound, index + 1),
        homeParticipantId: pairing.homeParticipantId,
        awayParticipantId: pairing.awayParticipantId,
      });
    });
    scheduleRound += 1;
  }

  for (const round of [...secondLegRounds].reverse()) {
    round.forEach((pairing, index) => {
      fixtures.push({
        roundNumber: encodeRoundNumber(scheduleRound, index + 1),
        homeParticipantId: pairing.homeParticipantId,
        awayParticipantId: pairing.awayParticipantId,
      });
    });
    scheduleRound += 1;
  }

  return fixtures;
}

export function decodeScheduleRound(roundNumber: number): number {
  return Math.floor(roundNumber / 100);
}

export function decodeMatchInRound(roundNumber: number): number {
  return roundNumber % 100;
}
