import type { MatchEventDto, MatchTeamSideDto } from '@draft-io/shared-types';

export type LiveMatchAlertType = 'GOAL_CHANCE' | 'PENALTY';

export interface LiveMatchAlert {
  readonly type: LiveMatchAlertType;
  readonly teamSide: Exclude<MatchTeamSideDto, 'NEUTRAL'>;
  readonly label: string;
}

const ALERT_EVENT_TYPES = new Set<MatchEventDto['eventType']>(['GOAL_CHANCE', 'PENALTY']);

export function getActiveLiveMatchAlert(events: readonly MatchEventDto[]): LiveMatchAlert | null {
  if (events.length === 0) {
    return null;
  }

  const latest = events[events.length - 1];
  if (latest.eventType !== 'GOAL_CHANCE' && latest.eventType !== 'PENALTY') {
    return null;
  }

  if (latest.teamSide !== 'HOME' && latest.teamSide !== 'AWAY') {
    return null;
  }

  return {
    type: latest.eventType,
    teamSide: latest.teamSide,
    label: latest.eventType === 'PENALTY' ? 'PENALTI' : 'GOL POZİSYONU',
  };
}
