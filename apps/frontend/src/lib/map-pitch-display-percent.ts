const PITCH_EDGE_INSET = 12;
const PITCH_DISPLAY_RANGE = 100 - 2 * PITCH_EDGE_INSET;

/** Wider horizontal spread so md draft cards keep visible gaps on the same row. */
const DRAFT_HORIZONTAL_SPREAD = 1.38;

/**
 * Draft-only Y stops: midfield is pulled toward attack, defense toward goal,
 * with extra room between the two lines without squeezing the goalkeeper.
 */
const DRAFT_PITCH_Y_STOPS: readonly { readonly y: number; readonly display: number }[] = [
  { y: 0, display: 6 },
  { y: 14, display: 11 },
  { y: 50, display: 36 },
  { y: 72, display: 76 },
  { y: 90, display: 88 },
  { y: 100, display: 94 },
];

function toDisplayPercent(normalized: number): number {
  const clamped = Math.min(100, Math.max(0, normalized));
  return PITCH_EDGE_INSET + (clamped / 100) * PITCH_DISPLAY_RANGE;
}

/** Maps API pitch coordinates into the visible pitch area so markers are not clipped. */
export function mapPitchDisplayPercent(value: number): number {
  return toDisplayPercent(value);
}

/** Draft board only — spreads slot X positions so cards on a line do not overlap. */
export function mapDraftPitchDisplayX(pitchX: number): number {
  const normalized = Math.min(100, Math.max(0, pitchX));
  const spreadX = 50 + (normalized - 50) * DRAFT_HORIZONTAL_SPREAD;
  const clamped = Math.min(96, Math.max(4, spreadX));
  return toDisplayPercent(clamped);
}

function interpolateDraftPitchY(normalized: number): number {
  const clamped = Math.min(100, Math.max(0, normalized));

  for (let index = 0; index < DRAFT_PITCH_Y_STOPS.length - 1; index += 1) {
    const start = DRAFT_PITCH_Y_STOPS[index];
    const end = DRAFT_PITCH_Y_STOPS[index + 1];
    if (start === undefined || end === undefined) {
      continue;
    }

    if (clamped <= end.y) {
      if (end.y === start.y) {
        return start.display;
      }

      const progress = (clamped - start.y) / (end.y - start.y);
      return start.display + progress * (end.display - start.display);
    }
  }

  const last = DRAFT_PITCH_Y_STOPS[DRAFT_PITCH_Y_STOPS.length - 1];
  return last?.display ?? 50;
}

/** Draft board only — spreads slot Y positions so formation lines keep breathing room. */
export function mapDraftPitchDisplayY(pitchY: number): number {
  const normalized = Math.min(100, Math.max(0, pitchY));
  return interpolateDraftPitchY(normalized);
}
