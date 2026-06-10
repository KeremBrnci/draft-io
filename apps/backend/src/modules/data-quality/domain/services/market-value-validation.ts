/** Validates stored market value — flags negative or non-finite values. */
export function isValidStoredMarketValue(value: number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  return Number.isFinite(value) && value >= 0;
}

/**
 * Parses provider market value hints.
 * Returns null when value cannot be represented as a non-negative number.
 */
export function parseProviderMarketValue(raw: unknown): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw >= 0 ? raw : null;
  }

  if (typeof raw === 'string') {
    const normalized = raw
      .trim()
      .toLowerCase()
      .replace(/[€$,\s]/g, '');
    const match = /^([\d.]+)([mk])?$/.exec(normalized);

    if (match === null) {
      return null;
    }

    const base = Number.parseFloat(match[1] ?? '');
    if (!Number.isFinite(base) || base < 0) {
      return null;
    }

    const suffix = match[2];
    if (suffix === 'm') {
      return Math.round(base * 1_000_000);
    }

    if (suffix === 'k') {
      return Math.round(base * 1_000);
    }

    return base;
  }

  return null;
}

export function hasValidPlayerPosition(position: string): boolean {
  const normalized = position.trim();
  return normalized.length > 0 && normalized !== 'UNK' && normalized !== 'UNKNOWN';
}
