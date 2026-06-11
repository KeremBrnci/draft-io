export interface MatchStoppageTimeDto {
  readonly firstHalfMinutes: number;
  readonly secondHalfMinutes: number;
}

export interface MatchMinuteMilestones {
  readonly firstHalfEnd: number;
  readonly secondHalfStart: number;
  readonly secondHalfRegularEnd: number;
  readonly matchEnd: number;
}

/** Deterministic 1–5 minute stoppage per half from the match seed. */
export function deriveMatchStoppageTime(simulationSeed: number): MatchStoppageTimeDto {
  return {
    firstHalfMinutes: 1 + (Math.abs(simulationSeed * 7919 + 104729) % 5),
    secondHalfMinutes: 1 + (Math.abs(simulationSeed * 7907 + 154873) % 5),
  };
}

export function getMatchMinuteMilestones(stoppage: MatchStoppageTimeDto): MatchMinuteMilestones {
  const firstHalfEnd = 45 + stoppage.firstHalfMinutes;
  const secondHalfStart = firstHalfEnd + 1;
  const secondHalfRegularEnd = secondHalfStart + 44;
  const matchEnd = secondHalfRegularEnd + stoppage.secondHalfMinutes;

  return {
    firstHalfEnd,
    secondHalfStart,
    secondHalfRegularEnd,
    matchEnd,
  };
}

export function mapEventToInternalMinute(
  eventMinute: number,
  eventType: string,
  stoppage: MatchStoppageTimeDto,
): number {
  const milestones = getMatchMinuteMilestones(stoppage);

  if (eventType === 'HALF_TIME') {
    return milestones.firstHalfEnd;
  }

  if (eventType === 'FULL_TIME') {
    return milestones.matchEnd;
  }

  if (eventMinute <= 45) {
    return eventMinute;
  }

  return eventMinute + stoppage.firstHalfMinutes;
}

/** Formats clock label: 12, 45+3, 90+2 */
export function formatMatchMinuteLabel(
  internalMinute: number,
  stoppage: MatchStoppageTimeDto,
): string {
  const milestones = getMatchMinuteMilestones(stoppage);

  if (internalMinute <= 45) {
    return `${internalMinute}`;
  }

  if (internalMinute <= milestones.firstHalfEnd) {
    return `45+${internalMinute - 45}`;
  }

  if (internalMinute <= milestones.secondHalfRegularEnd) {
    return `${internalMinute - stoppage.firstHalfMinutes}`;
  }

  return `90+${internalMinute - milestones.secondHalfRegularEnd}`;
}
