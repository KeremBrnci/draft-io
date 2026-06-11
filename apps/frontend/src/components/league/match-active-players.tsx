'use client';

import type { MatchAttackChainDto, MatchLiveVisualizationDto } from '@draft-io/shared-types';

import './match-live-pitch.css';

interface MatchActivePlayersProps {
  readonly visualization: MatchLiveVisualizationDto | null;
}

export function MatchActivePlayers({
  visualization,
}: MatchActivePlayersProps): React.ReactElement | null {
  if (visualization === null || visualization.activePlayers.length === 0) {
    return null;
  }

  return (
    <div className="match-active-players" aria-label="Aktif oyuncular">
      <p className="match-active-players__label">Aktif oyuncular</p>
      <div className="match-active-players__list">
        {visualization.activePlayers.map((player) => (
          <span
            key={`${player.cardId ?? player.displayName}-${player.teamSide}`}
            className={`match-active-players__chip match-active-players__chip--${player.teamSide.toLowerCase()}`}
          >
            {player.displayName}
          </span>
        ))}
      </div>
      {visualization.attackChain !== null ? (
        <AttackChain chain={visualization.attackChain} highlight={visualization.highlightGoal} />
      ) : null}
    </div>
  );
}

function AttackChain({
  chain,
  highlight,
}: {
  readonly chain: MatchAttackChainDto;
  readonly highlight: boolean;
}): React.ReactElement {
  return (
    <div
      className={`match-attack-chain${highlight ? ' match-attack-chain--goal' : ''}`}
      aria-label="Atak zinciri"
    >
      {chain.players.map((player, index) => (
        <span key={`${chain.id}-${player}`} className="match-attack-chain__step">
          {index > 0 ? <span className="match-attack-chain__arrow">→</span> : null}
          <span className="match-attack-chain__player">{player}</span>
        </span>
      ))}
      {chain.result === 'GOAL' ? <span className="match-attack-chain__result">GOL</span> : null}
    </div>
  );
}
