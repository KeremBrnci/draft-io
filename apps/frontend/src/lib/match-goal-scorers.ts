import {
  formatMatchMinuteLabel,
  mapEventToInternalMinute,
  type MatchEventDto,
  type MatchStoppageTimeDto,
} from '@draft-io/shared-types';

export interface MatchGoalEntry {
  readonly id: string;
  readonly minuteLabel: string;
  readonly playerName: string;
  readonly assistName: string | null;
}

export interface MatchGoalsByTeam {
  readonly home: readonly MatchGoalEntry[];
  readonly away: readonly MatchGoalEntry[];
}

function toGoalEntry(event: MatchEventDto, stoppage: MatchStoppageTimeDto): MatchGoalEntry {
  const internalMinute = mapEventToInternalMinute(event.minute, event.eventType, stoppage);

  return {
    id: event.id,
    minuteLabel: formatMatchMinuteLabel(internalMinute, stoppage),
    playerName: event.playerName ?? 'Bilinmeyen oyuncu',
    assistName: event.secondaryPlayerName,
  };
}

export function extractMatchGoalsByTeam(
  events: readonly MatchEventDto[],
  stoppage: MatchStoppageTimeDto,
): MatchGoalsByTeam {
  const goalEvents = events
    .filter((event) => event.eventType === 'GOAL' && event.isGoal)
    .sort((left, right) => left.minute - right.minute);

  return {
    home: goalEvents
      .filter((event) => event.teamSide === 'HOME')
      .map((event) => toGoalEntry(event, stoppage)),
    away: goalEvents
      .filter((event) => event.teamSide === 'AWAY')
      .map((event) => toGoalEntry(event, stoppage)),
  };
}
