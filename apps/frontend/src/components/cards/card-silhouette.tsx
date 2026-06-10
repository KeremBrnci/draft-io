/** Shared premium collectible card clip path — all variants reuse this silhouette. */
export const FC_CARD_CLIP_ID = 'fc-card-silhouette';

/**
 * viewBox 0 0 100 150 — wide horizontal top, subtle side taper,
 * mostly flat bottom with a minimal center extension.
 */
export const FC_CARD_SHAPE_PATH =
  'M6 4 H94 C97.5 4 98 6.5 98 9 L95.5 132 C95.5 137 92.5 141 50 143.5 C7.5 141 4.5 137 4.5 132 L2 9 C2 6.5 2.5 4 6 4 Z';

export function FootballCardSilhouetteDefs(): React.ReactElement {
  return (
    <svg className="fc-card__clip-svg" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        <clipPath id={FC_CARD_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path transform="scale(0.01, 0.0066667)" d={FC_CARD_SHAPE_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}
