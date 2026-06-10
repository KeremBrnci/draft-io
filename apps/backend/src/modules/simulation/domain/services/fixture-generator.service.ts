export interface FixturePair {
  readonly roundNumber: number;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
}

/** Double round-robin: every participant plays every other twice (home and away). */
export function generateDoubleRoundRobinFixtures(
  participantIds: readonly string[],
): readonly FixturePair[] {
  if (participantIds.length < 2) {
    return [];
  }

  const fixtures: FixturePair[] = [];
  let round = 1;

  for (let homeIndex = 0; homeIndex < participantIds.length; homeIndex += 1) {
    for (let awayIndex = 0; awayIndex < participantIds.length; awayIndex += 1) {
      if (homeIndex === awayIndex) {
        continue;
      }

      const homeParticipantId = participantIds[homeIndex];
      const awayParticipantId = participantIds[awayIndex];
      if (homeParticipantId === undefined || awayParticipantId === undefined) {
        continue;
      }

      fixtures.push({
        roundNumber: round,
        homeParticipantId,
        awayParticipantId,
      });
      round += 1;
    }
  }

  return fixtures;
}
