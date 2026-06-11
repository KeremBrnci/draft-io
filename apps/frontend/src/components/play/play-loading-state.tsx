interface PlayLoadingStateProps {
  readonly message?: string;
  readonly icon?: string;
}

export function PlayLoadingState({
  message = 'Yükleniyor…',
  icon = '⚽',
}: PlayLoadingStateProps): React.ReactElement {
  return (
    <div className="play-arena play-arena--loading play-loading-state">
      <div className="play-loading-state__icon" aria-hidden>
        {icon}
      </div>
      <div className="play-loader" role="status" aria-label={message} />
      <p className="play-subtitle">{message}</p>
    </div>
  );
}
