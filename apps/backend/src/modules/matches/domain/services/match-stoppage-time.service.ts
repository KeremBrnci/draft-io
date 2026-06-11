import {
  deriveMatchStoppageTime,
  formatMatchMinuteLabel,
  getMatchMinuteMilestones,
  mapEventToInternalMinute,
  type MatchMinuteMilestones,
  type MatchStoppageTimeDto,
} from '@draft-io/shared-types';

import type { RoomMatchEventRecord } from '../repositories/room-league.repository';

export {
  deriveMatchStoppageTime,
  formatMatchMinuteLabel,
  getMatchMinuteMilestones,
  mapEventToInternalMinute,
};
export type { MatchMinuteMilestones, MatchStoppageTimeDto };

export function resolveMatchStoppageContext(simulationSeed: number): {
  readonly stoppage: MatchStoppageTimeDto;
  readonly milestones: MatchMinuteMilestones;
} {
  const stoppage = deriveMatchStoppageTime(simulationSeed);
  return {
    stoppage,
    milestones: getMatchMinuteMilestones(stoppage),
  };
}

export function eventsForInternalMinute(
  events: readonly RoomMatchEventRecord[],
  internalMinute: number,
  stoppage: MatchStoppageTimeDto,
): readonly RoomMatchEventRecord[] {
  return events
    .filter(
      (event) =>
        event.revealedAt === null &&
        mapEventToInternalMinute(event.minute, event.eventType, stoppage) === internalMinute,
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
