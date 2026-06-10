'use client';

import { useState } from 'react';

interface EntityImageProps {
  readonly src: string | null | undefined;
  readonly alt: string;
  readonly variant: 'player' | 'team' | 'league' | 'flag';
  readonly className?: string;
}

const VARIANT_CLASS: Readonly<Record<EntityImageProps['variant'], string>> = {
  player: 'admin-entity-image admin-entity-image--player',
  team: 'admin-entity-image admin-entity-image--team',
  league: 'admin-entity-image admin-entity-image--league',
  flag: 'admin-entity-image admin-entity-image--flag',
};

export function EntityImage({
  src,
  alt,
  variant,
  className,
}: EntityImageProps): React.ReactElement {
  const [failed, setFailed] = useState(false);
  const showImage = src !== null && src !== undefined && src.length > 0 && !failed;
  const classes = className === undefined ? VARIANT_CLASS[variant] : `${VARIANT_CLASS[variant]} ${className}`;

  if (!showImage) {
    return <span className={`${classes} admin-entity-image--placeholder`} aria-hidden="true" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external CDN avatars; no Next image optimizer config required
    <img
      className={classes}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true);
      }}
    />
  );
}
