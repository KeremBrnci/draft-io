export interface CardNameLines {
  readonly firstLine: string;
  readonly secondLine: string;
}

const SURNAME_PARTICLES = new Set([
  'af',
  'al',
  'ben',
  'bin',
  'da',
  'das',
  'de',
  "d'",
  'del',
  'della',
  'der',
  'di',
  'do',
  'dos',
  'du',
  'el',
  'ibn',
  'la',
  'le',
  'mac',
  'mc',
  "o'",
  'st',
  'st.',
  'ter',
  'van',
  'von',
]);

function normalizeParticle(token: string): string {
  return token.toLowerCase().replace(/\.$/, '');
}

/** Splits a multi-word name into given name(s) and surname (incl. particles like De, van). */
export function splitGivenNameAndSurname(parts: readonly string[]): {
  readonly given: string;
  readonly surname: string;
} {
  if (parts.length === 0) {
    return { given: '', surname: '' };
  }

  if (parts.length === 1) {
    return { given: '', surname: parts[0] ?? '' };
  }

  let surnameStart = parts.length - 1;

  while (surnameStart > 0) {
    const previous = parts[surnameStart - 1];
    if (previous === undefined || !SURNAME_PARTICLES.has(normalizeParticle(previous))) {
      break;
    }
    surnameStart -= 1;
  }

  return {
    given: parts.slice(0, surnameStart).join(' '),
    surname: parts.slice(surnameStart).join(' '),
  };
}

/** Single-line name for the card plate. */
export function formatCardNameSingleLine(displayName: string): string {
  return displayName.trim();
}

/** Splits display names into given name + surname for the card nameplate. */
export function formatCardNameLines(displayName: string): CardNameLines {
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    return { firstLine: '', secondLine: '' };
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return { firstLine: '', secondLine: parts[0] ?? '' };
  }

  const { given, surname } = splitGivenNameAndSurname(parts);
  return { firstLine: given, secondLine: surname };
}

/** Prefer split lines for multi-word names so surnames stay readable on narrow cards. */
export function formatCardNameForDisplay(displayName: string): {
  readonly mode: 'single' | 'split';
  readonly singleLine: string;
  readonly lines: CardNameLines;
} {
  const trimmed = displayName.trim();
  const lines = formatCardNameLines(trimmed);
  const useSplit = lines.firstLine.length > 0 && lines.secondLine.length > 0;

  return {
    mode: useSplit ? 'split' : 'single',
    singleLine: trimmed,
    lines,
  };
}

/** Compact label for tight layouts (pitch slots) — prefers surname when space is limited. */
export function formatCardNameCompactLabel(displayName: string): string {
  const trimmed = displayName.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0] ?? '';
  }

  const { given, surname } = splitGivenNameAndSurname(parts);
  if (given.length === 0) {
    return surname;
  }

  if (trimmed.length <= 20) {
    return trimmed;
  }

  const givenInitial = given.charAt(0).toUpperCase();
  return `${givenInitial}. ${surname}`;
}
