'use client';

import { useState } from 'react';

interface CardMetaBadgeProps {
  readonly src: string | null;
  readonly alt?: string | null;
  readonly title?: string | undefined;
  readonly kind: 'team' | 'league';
  readonly fallbackText?: string | null;
  readonly eager?: boolean;
}

function TeamPlaceholder(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 3.5 4.5 6.75v5.25c0 4.35 3.2 8.42 7.5 9.5 4.3-1.08 7.5-5.15 7.5-9.5V6.75L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.25v7.5M9 11.25h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeaguePlaceholder(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="5" y="7" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 11h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CardMetaBadge({
  src,
  alt,
  title,
  kind,
  fallbackText = null,
  eager = false,
}: CardMetaBadgeProps): React.ReactElement {
  const [failed, setFailed] = useState(false);
  const showImage = src !== null && src.length > 0 && !failed;
  const className = `fc-card__badge fc-card__badge--${kind}`;

  if (showImage) {
    return (
      <div className={className} title={title ?? undefined}>
        <img
          src={src}
          alt={alt ?? ''}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            setFailed(true);
          }}
        />
      </div>
    );
  }

  if (fallbackText !== null && fallbackText.length > 0) {
    return (
      <div className={className} title={title ?? undefined}>
        <span className="fc-card__badge-text">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div
      className={`${className} fc-card__badge--placeholder`}
      title={title ?? undefined}
      aria-hidden="true"
    >
      {kind === 'team' ? <TeamPlaceholder /> : <LeaguePlaceholder />}
    </div>
  );
}
