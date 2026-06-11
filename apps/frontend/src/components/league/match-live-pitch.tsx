'use client';

import type { MatchLiveVisualizationDto, PitchZoneDto } from '@draft-io/shared-types';
import { PITCH_ZONE_POSITIONS, PITCH_ZONES } from '@draft-io/shared-types';
import { useEffect, useState } from 'react';

import './match-live-pitch.css';

interface MatchLivePitchProps {
  readonly visualization: MatchLiveVisualizationDto | null;
  readonly homeName: string;
  readonly awayName: string;
}

export function MatchLivePitch({
  visualization,
  homeName,
  awayName,
}: MatchLivePitchProps): React.ReactElement {
  const [animatedZone, setAnimatedZone] = useState<PitchZoneDto>('B2');

  useEffect(() => {
    if (visualization === null) {
      return;
    }

    setAnimatedZone(visualization.ballZone);
  }, [visualization?.ballZone, visualization?.previousBallZone]);

  const ballPosition = PITCH_ZONE_POSITIONS[animatedZone];

  return (
    <div className="match-live-pitch" aria-label="Canlı saha görünümü">
      <div className="match-live-pitch__header">
        <span className="match-live-pitch__team match-live-pitch__team--home">{homeName}</span>
        <span className="match-live-pitch__zone-label">
          Top: <strong>{animatedZone}</strong>
        </span>
        <span className="match-live-pitch__team match-live-pitch__team--away">{awayName}</span>
      </div>

      <div className="match-live-pitch__field">
        <div className="match-live-pitch__grass" />
        <div className="match-live-pitch__line match-live-pitch__line--half" />
        <div className="match-live-pitch__line match-live-pitch__line--box-top" />
        <div className="match-live-pitch__line match-live-pitch__line--box-bottom" />

        <div className="match-live-pitch__grid" aria-hidden>
          {PITCH_ZONES.map((zone: PitchZoneDto) => (
            <div
              key={zone}
              className={`match-live-pitch__zone${zone === animatedZone ? ' match-live-pitch__zone--active' : ''}`}
              data-zone={zone}
            />
          ))}
        </div>

        <div
          className={`match-live-pitch__ball${visualization?.highlightGoal ? ' match-live-pitch__ball--goal' : ''}`}
          style={{
            left: `${ballPosition.leftPercent}%`,
            top: `${ballPosition.topPercent}%`,
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
