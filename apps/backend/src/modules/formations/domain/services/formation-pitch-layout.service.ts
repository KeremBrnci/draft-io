import { getFormationPitchLayout } from '../constants/formation-pitch-layouts';

/** Computes normalized pitch coordinates (0–100) for formation slot previews. */
export function computePitchCoordinates(
  code: string,
  slotIndex: number,
  slotLabel: string,
): { readonly pitchX: number; readonly pitchY: number } {
  const layout = getFormationPitchLayout(code);
  const point = layout?.[slotIndex - 1];

  if (point !== undefined) {
    return point;
  }

  if (slotLabel === 'GK' || slotIndex === 1) {
    return { pitchX: 50, pitchY: 91 };
  }

  return fallbackGrid(slotIndex);
}

function fallbackGrid(slotIndex: number): { readonly pitchX: number; readonly pitchY: number } {
  const columns = 4;
  const row = Math.floor((slotIndex - 1) / columns);
  const column = (slotIndex - 1) % columns;
  return {
    pitchX: ((column + 1) / (columns + 1)) * 100,
    pitchY: 14 + row * 18,
  };
}
