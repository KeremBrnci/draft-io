export function PlayGameBackdrop(): React.ReactElement {
  return (
    <div className="play-game-bg" aria-hidden>
      <div className="play-game-bg__spotlight" />
      <div className="play-game-bg__pitch" />
      <div className="play-game-bg__center-circle" />
      <span className="play-game-bg__deco play-game-bg__deco--ball-1">⚽</span>
      <span className="play-game-bg__deco play-game-bg__deco--ball-2">⚽</span>
      <span className="play-game-bg__deco play-game-bg__deco--goal">🥅</span>
      <span className="play-game-bg__deco play-game-bg__deco--whistle">📣</span>
      <span className="play-game-bg__deco play-game-bg__deco--boot">👟</span>
    </div>
  );
}
