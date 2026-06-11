'use client';

import {
  formatMatchMinuteLabel,
  mapEventToInternalMinute,
  type MatchEventDto,
  type MatchStoppageTimeDto,
} from '@draft-io/shared-types';
import { isImportantMatchEvent } from '@draft-io/shared-utils';
import { memo, useMemo } from 'react';

import { getMatchEventUi } from '@/lib/match-event-ui';

interface MatchCommentaryFeedProps {
  readonly events: readonly MatchEventDto[];
  readonly homeDisplayName: string;
  readonly awayDisplayName: string;
  readonly stoppage: MatchStoppageTimeDto;
}

export const MatchCommentaryFeed = memo(function MatchCommentaryFeed({
  events,
  homeDisplayName,
  awayDisplayName,
  stoppage,
}: MatchCommentaryFeedProps): React.ReactElement {
  const visibleEvents = useMemo(
    () =>
      [...events]
        .filter((event) => isImportantMatchEvent(event.eventType))
        .reverse()
        .slice(0, 40),
    [events],
  );

  return (
    <div className="league-commentary">
      {visibleEvents.map((event) => {
        const ui = getMatchEventUi(event.eventType);
        const teamName =
          event.teamSide === 'HOME'
            ? homeDisplayName
            : event.teamSide === 'AWAY'
              ? awayDisplayName
              : null;

        return (
          <div
            key={event.id}
            className={`league-commentary__item league-commentary__item--${ui.tone}${event.isGoal ? ' league-commentary__item--goal' : ''}`}
          >
            <div className="league-commentary__meta">
              <span className="league-commentary__icon" aria-hidden>
                {ui.icon}
              </span>
              <span className="league-commentary__minute">
                {formatMatchMinuteLabel(
                  mapEventToInternalMinute(event.minute, event.eventType, stoppage),
                  stoppage,
                )}
                &apos;
              </span>
              <span className="league-commentary__tag">{ui.label}</span>
              {teamName !== null ? (
                <span className="league-commentary__team">{teamName}</span>
              ) : null}
            </div>
            <p className="league-commentary__text">{event.commentary}</p>
          </div>
        );
      })}
    </div>
  );
});
