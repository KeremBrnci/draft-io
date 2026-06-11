'use client';

import type { MatchLiveVisualizationDto, PitchZoneDto } from '@draft-io/shared-types';
import { PITCH_ZONE_POSITIONS } from '@draft-io/shared-types';
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
  const ballStyle = {
    left: `${ballPosition.leftPercent}%`,
    top: `${ballPosition.topPercent}%`,
  };

  return (
    <div className="match-live-pitch" aria-label="Canlı saha görünümü">
      <div className="match-live-pitch__header">
        <span className="match-live-pitch__team match-live-pitch__team--home">{homeName}</span>
        <span className="match-live-pitch__live-badge">Canlı</span>
        <span className="match-live-pitch__team match-live-pitch__team--away">{awayName}</span>
      </div>

      <div className="match-live-pitch__field">
        <div className="match-live-pitch__grass" aria-hidden />

        <div className="match-live-pitch__markings" aria-hidden>
          <div className="match-live-pitch__outline" />
          <div className="match-live-pitch__half-line" />
          <div className="match-live-pitch__center-circle" />
          <div className="match-live-pitch__center-spot" />

          <div className="match-live-pitch__penalty-box match-live-pitch__penalty-box--top" />
          <div className="match-live-pitch__penalty-box match-live-pitch__penalty-box--bottom" />
          <div className="match-live-pitch__goal-box match-live-pitch__goal-box--top" />
          <div className="match-live-pitch__goal-box match-live-pitch__goal-box--bottom" />
          <div className="match-live-pitch__penalty-arc match-live-pitch__penalty-arc--top" />
          <div className="match-live-pitch__penalty-arc match-live-pitch__penalty-arc--bottom" />
          <div className="match-live-pitch__penalty-spot match-live-pitch__penalty-spot--top" />
          <div className="match-live-pitch__penalty-spot match-live-pitch__penalty-spot--bottom" />

          <div className="match-live-pitch__goal match-live-pitch__goal--top" />
          <div className="match-live-pitch__goal match-live-pitch__goal--bottom" />
        </div>

        <div
          className={`match-live-pitch__ball-glow${visualization?.highlightGoal ? ' match-live-pitch__ball-glow--goal' : ''}`}
          style={ballStyle}
          aria-hidden
        />

        <div
          className={`match-live-pitch__ball${visualization?.highlightGoal ? ' match-live-pitch__ball--goal' : ''}`}
          style={ballStyle}
          aria-hidden
        />
      </div>
    </div>
  );
}
