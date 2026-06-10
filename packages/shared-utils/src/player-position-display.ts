import { translatePositionCode } from './tr-football-display.js';

export type PlayerPositionCode =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'ST';

/** Canonical admin filter option — one Turkish label per role group. */
export interface PlayerPositionFilterOption {
  readonly code: PlayerPositionCode;
  readonly matchCodes: readonly PlayerPositionCode[];
}

/**
 * Unique position groups for filters and dropdowns.
 * Overlapping roles (LW/LM, RW/RM, ST/CF) map to a single canonical code.
 */
export const PLAYER_POSITION_FILTER_OPTIONS: readonly PlayerPositionFilterOption[] = [
  { code: 'GK', matchCodes: ['GK'] },
  { code: 'LB', matchCodes: ['LB'] },
  { code: 'CB', matchCodes: ['CB'] },
  { code: 'RB', matchCodes: ['RB'] },
  { code: 'LWB', matchCodes: ['LWB'] },
  { code: 'RWB', matchCodes: ['RWB'] },
  { code: 'CDM', matchCodes: ['CDM'] },
  { code: 'CM', matchCodes: ['CM'] },
  { code: 'CAM', matchCodes: ['CAM'] },
  { code: 'LW', matchCodes: ['LW', 'LM'] },
  { code: 'RW', matchCodes: ['RW', 'RM'] },
  { code: 'ST', matchCodes: ['ST', 'CF'] },
] as const;

const POSITION_FILTER_MATCH_CODES = new Map<PlayerPositionCode, readonly PlayerPositionCode[]>(
  PLAYER_POSITION_FILTER_OPTIONS.map((option) => [option.code, option.matchCodes]),
);

/** Expands a canonical filter code to all equivalent stored position codes. */
export function expandPositionFilterCodes(
  code: string | null | undefined,
): readonly PlayerPositionCode[] {
  if (code === null || code === undefined || code.trim().length === 0) {
    return [];
  }

  const key = code.trim().toUpperCase() as PlayerPositionCode;
  const grouped = POSITION_FILTER_MATCH_CODES.get(key);
  if (grouped !== undefined) {
    return grouped;
  }

  for (const option of PLAYER_POSITION_FILTER_OPTIONS) {
    if (option.matchCodes.includes(key)) {
      return option.matchCodes;
    }
  }

  return [key];
}

export function formatPositionFilterOption(option: PlayerPositionFilterOption): string {
  const short = translatePositionCode(option.code);
  const long = translatePositionCode(option.code, { long: true });
  return `${long} (${short})`;
}

export interface PlayerPositionAssignmentLike {
  readonly positionCode: string;
  readonly isPrimary: boolean;
}

/** Maps stored codes to the canonical filter/display code (LW/LM → LW, etc.). */
export function canonicalizePositionCode(code: string): PlayerPositionCode {
  const key = code.trim().toUpperCase() as PlayerPositionCode;

  for (const option of PLAYER_POSITION_FILTER_OPTIONS) {
    if (option.matchCodes.includes(key)) {
      return option.code;
    }
  }

  return key;
}

/** Collapses overlapping role codes before persistence (LW/LM, RW/RM, ST/CF). */
export function collapseEquivalentPositionCodes(
  primaryCode: string,
  secondaryCodes: readonly string[],
): { readonly primary: PlayerPositionCode; readonly secondary: readonly PlayerPositionCode[] } {
  const primary = canonicalizePositionCode(primaryCode);
  const seen = new Set<PlayerPositionCode>([primary]);
  const secondary: PlayerPositionCode[] = [];

  for (const code of secondaryCodes) {
    const canonical = canonicalizePositionCode(code);
    if (seen.has(canonical)) {
      continue;
    }

    seen.add(canonical);
    secondary.push(canonical);
  }

  return { primary, secondary };
}

function sortPlayerPositionAssignments<T extends PlayerPositionAssignmentLike>(
  assignments: readonly T[],
): T[] {
  return [...assignments].sort((left, right) => {
    if (left.isPrimary === right.isPrimary) {
      return 0;
    }

    return left.isPrimary ? -1 : 1;
  });
}

/**
 * Removes assignments that share the same Turkish short label (e.g. LM + LW → one SLK).
 * Primary assignments win when labels collide.
 */
export function deduplicatePlayerPositionAssignmentsForDisplay(
  assignments: readonly PlayerPositionAssignmentLike[],
): PlayerPositionAssignmentLike[] {
  const seenLabels = new Set<string>();
  const result: PlayerPositionAssignmentLike[] = [];

  for (const assignment of sortPlayerPositionAssignments(assignments)) {
    const label = translatePositionCode(assignment.positionCode);
    if (seenLabels.has(label)) {
      continue;
    }

    seenLabels.add(label);
    result.push(assignment);
  }

  return result;
}

/** Renders short Turkish labels for all assigned positions (primary first). */
export function formatPlayerPositionLabels(
  assignments: readonly PlayerPositionAssignmentLike[],
): readonly string[] {
  return deduplicatePlayerPositionAssignmentsForDisplay(assignments).map((assignment) =>
    translatePositionCode(assignment.positionCode),
  );
}
