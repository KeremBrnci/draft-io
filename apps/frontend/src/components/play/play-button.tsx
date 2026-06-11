'use client';

interface PlayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly loading?: boolean;
  readonly loadingLabel?: string;
}

export function PlayButton({
  loading = false,
  loadingLabel = 'Yükleniyor…',
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: PlayButtonProps): React.ReactElement {
  const classes = ['play-btn', loading ? 'play-btn--loading' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={(disabled ?? false) || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span className="play-btn__content">
          <span className="play-btn__spinner" aria-hidden />
          <span className="play-btn__label">{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
