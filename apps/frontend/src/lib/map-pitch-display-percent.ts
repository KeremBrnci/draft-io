const PITCH_EDGE_INSET = 12;
const PITCH_DISPLAY_RANGE = 100 - 2 * PITCH_EDGE_INSET;

/** Wider horizontal spread so md draft cards keep visible gaps on the same row. */
const DRAFT_HORIZONTAL_SPREAD = 1.38;
/** Taller vertical spread so defensive and midfield lines do not overlap on the draft board. */
const DRAFT_VERTICAL_SPREAD = 1.42;
const DRAFT_PITCH_EDGE_INSET = 8;
const DRAFT_PITCH_DISPLAY_RANGE = 100 - 2 * DRAFT_PITCH_EDGE_INSET;

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

function toDraftDisplayPercent(normalized: number): number {
  const clamped = Math.min(100, Math.max(0, normalized));
  return DRAFT_PITCH_EDGE_INSET + (clamped / 100) * DRAFT_PITCH_DISPLAY_RANGE;
}

/** Draft board only — spreads slot Y positions so formation lines keep breathing room. */
export function mapDraftPitchDisplayY(pitchY: number): number {
  const normalized = Math.min(100, Math.max(0, pitchY));
  const spreadY = 50 + (normalized - 50) * DRAFT_VERTICAL_SPREAD;
  const clamped = Math.min(98, Math.max(2, spreadY));
  return toDraftDisplayPercent(clamped);
}
