import { expandPositionFilterCodes } from './player-position-display.js';

/** Expands formation slot codes to all equivalent stored player position codes. */
export function expandFormationSlotPositionCodes(
  slotLabel: string,
  allowedPositions: readonly string[],
): readonly string[] {
  const codes = allowedPositions.length > 0 ? allowedPositions : [slotLabel];
  const expanded = new Set<string>();

  for (const code of codes) {
    for (const match of expandPositionFilterCodes(code)) {
      expanded.add(match.toUpperCase());
    }
  }

  return [...expanded];
}

export function canPlayerFillFormationSlot(
  playablePositionCodes: readonly string[],
  slotLabel: string,
  allowedPositions: readonly string[],
): boolean {
  const slotCodes = expandFormationSlotPositionCodes(slotLabel, allowedPositions);
  const playerCodes = new Set(playablePositionCodes.map((code) => code.toUpperCase()));
  return slotCodes.some((code) => playerCodes.has(code));
}

export function canSwapDraftSlots(input: {
  readonly sourceCardPositions: readonly string[];
  readonly targetCardPositions: readonly string[];
  readonly sourceSlot: { readonly label: string; readonly allowedPositions: readonly string[] };
  readonly targetSlot: { readonly label: string; readonly allowedPositions: readonly string[] };
}): boolean {
  return (
    canPlayerFillFormationSlot(
      input.sourceCardPositions,
      input.targetSlot.label,
      input.targetSlot.allowedPositions,
    ) &&
    canPlayerFillFormationSlot(
      input.targetCardPositions,
      input.sourceSlot.label,
      input.sourceSlot.allowedPositions,
    )
  );
}
