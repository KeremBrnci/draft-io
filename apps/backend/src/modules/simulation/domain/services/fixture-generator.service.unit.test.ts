import { describe, expect, it } from 'vitest';

import { decodeScheduleRound, generateDoubleRoundRobinFixtures } from './fixture-generator.service';

function opponentInFixture(
  fixtures: ReturnType<typeof generateDoubleRoundRobinFixtures>,
  playerId: string,
  fixtureIndex: number,
): string | null {
  const fixture = fixtures[fixtureIndex];
  if (fixture === undefined) {
    return null;
  }

  if (fixture.homeParticipantId === playerId) {
    return fixture.awayParticipantId;
  }

  if (fixture.awayParticipantId === playerId) {
    return fixture.homeParticipantId;
  }

  return null;
}

function fixturesForPlayer(
  fixtures: ReturnType<typeof generateDoubleRoundRobinFixtures>,
  playerId: string,
): number[] {
  return fixtures
    .map((fixture, index) =>
      fixture.homeParticipantId === playerId || fixture.awayParticipantId === playerId ? index : -1,
    )
    .filter((index) => index >= 0);
}

describe('generateDoubleRoundRobinFixtures', () => {
  it('creates home-and-away fixtures for each pair', () => {
    expect(generateDoubleRoundRobinFixtures(['a', 'b']).length).toBe(2);
    expect(generateDoubleRoundRobinFixtures(['a', 'b', 'c', 'd']).length).toBe(12);
    expect(
      generateDoubleRoundRobinFixtures(Array.from({ length: 12 }, (_, i) => `p${i}`)).length,
    ).toBe(132);
  });

  it('schedules only one match per player in each tournament round', () => {
    const players = Array.from({ length: 12 }, (_, index) => `p${index}`);
    const fixtures = generateDoubleRoundRobinFixtures(players);
    const rounds = new Map<number, Set<string>>();

    for (const fixture of fixtures) {
      const scheduleRound = decodeScheduleRound(fixture.roundNumber);
      const seen = rounds.get(scheduleRound) ?? new Set<string>();
      expect(seen.has(fixture.homeParticipantId)).toBe(false);
      expect(seen.has(fixture.awayParticipantId)).toBe(false);
      seen.add(fixture.homeParticipantId);
      seen.add(fixture.awayParticipantId);
      rounds.set(scheduleRound, seen);
    }

    expect(rounds.size).toBe(22);
  });

  it('closes the schedule so the first opponent is also the last opponent', () => {
    const players = Array.from({ length: 12 }, (_, index) => `p${index}`);
    const fixtures = generateDoubleRoundRobinFixtures(players);
    const player = 'p0';
    const indexes = fixturesForPlayer(fixtures, player);

    const firstOpponent = opponentInFixture(fixtures, player, indexes[0]!);
    const lastOpponent = opponentInFixture(fixtures, player, indexes[indexes.length - 1]!);

    expect(firstOpponent).not.toBeNull();
    expect(firstOpponent).toBe(lastOpponent);
  });

  it('spaces player matches so they do not run back-to-back in the schedule', () => {
    const players = Array.from({ length: 12 }, (_, index) => `p${index}`);
    const fixtures = generateDoubleRoundRobinFixtures(players);

    for (const player of players) {
      const indexes = fixturesForPlayer(fixtures, player);
      for (let index = 1; index < indexes.length; index += 1) {
        expect(indexes[index]! - indexes[index - 1]!).toBeGreaterThan(1);
      }
    }
  });

  it('plays every pair exactly twice with reversed home advantage', () => {
    const players = ['a', 'b', 'c', 'd'];
    const fixtures = generateDoubleRoundRobinFixtures(players);
    const pairCounts = new Map<string, { homeA: number; homeB: number }>();

    for (const fixture of fixtures) {
      const key = [fixture.homeParticipantId, fixture.awayParticipantId].sort().join(':');
      const entry = pairCounts.get(key) ?? { homeA: 0, homeB: 0 };
      if (fixture.homeParticipantId < fixture.awayParticipantId) {
        entry.homeA += 1;
      } else {
        entry.homeB += 1;
      }
      pairCounts.set(key, entry);
    }

    expect(pairCounts.size).toBe(6);
    for (const entry of pairCounts.values()) {
      expect(entry.homeA + entry.homeB).toBe(2);
      expect(entry.homeA).toBe(1);
      expect(entry.homeB).toBe(1);
    }
  });
});
