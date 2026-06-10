export interface CardNameLines {
  readonly firstLine: string;
  readonly secondLine: string;
}

/** Single-line name for the card plate — truncates with ellipsis when needed. */
export function formatCardNameSingleLine(displayName: string): string {
  return displayName.trim();
}

/** Splits display names into two lines for long names (fallback only). */
export function formatCardNameLines(displayName: string): CardNameLines {
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    return { firstLine: '', secondLine: '' };
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return { firstLine: '', secondLine: parts[0] ?? '' };
  }

  const secondLine = parts[parts.length - 1] ?? '';
  const firstLine = parts.slice(0, -1).join(' ');

  return { firstLine, secondLine };
}

/** Prefer one line; split only when the name exceeds the compact threshold. */
export function formatCardNameForDisplay(displayName: string): {
  readonly mode: 'single' | 'split';
  readonly singleLine: string;
  readonly lines: CardNameLines;
} {
  const trimmed = displayName.trim();
  const lines = formatCardNameLines(trimmed);
  const useSplit = trimmed.length > 18 && lines.firstLine.length > 0;

  return {
    mode: useSplit ? 'split' : 'single',
    singleLine: trimmed,
    lines,
  };
}
