import type { CSSProperties, ReactNode } from 'react';

type SkeletonTone = 'default' | 'strong';

interface SkeletonProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly tone?: SkeletonTone;
  readonly children?: ReactNode;
}

export function Skeleton({
  className = '',
  style,
  tone = 'default',
  children,
}: SkeletonProps): React.ReactElement {
  return (
    <span
      className={`admin-skeleton admin-skeleton--${tone}${className.length > 0 ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
