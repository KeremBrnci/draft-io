const PITCH_EDGE_INSET = 12;

/** Maps API pitch coordinates into the visible pitch area so markers are not clipped. */
export function mapPitchDisplayPercent(value: number): number {
  const normalized = Math.min(100, Math.max(0, value));
  return PITCH_EDGE_INSET + (normalized / 100) * (100 - 2 * PITCH_EDGE_INSET);
}
