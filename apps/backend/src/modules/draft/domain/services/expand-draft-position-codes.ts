import { expandPositionFilterCodes } from '@draft-io/shared-utils';

/** Expands formation slot codes to all equivalent stored player position codes (LM↔LW, RM↔RW, ST↔CF). */
export function expandDraftEligiblePositionCodes(
  positionCodes: readonly string[],
): readonly string[] {
  const expanded = new Set<string>();

  for (const code of positionCodes) {
    for (const match of expandPositionFilterCodes(code)) {
      expanded.add(match.toUpperCase());
    }
  }

  return [...expanded];
}
