import { NATIONALITY_DISPLAY_TR, NATIONALITY_KEY_ALIASES } from './tr-nationalities';
import { TEAM_DISPLAY_TR_BY_EXTERNAL_ID } from './tr-team-names';

/** Transfermarkt competition external id → Turkish display name. */
const LEAGUE_DISPLAY_TR_BY_EXTERNAL_ID: Readonly<Record<string, string>> = {
  GB1: 'Premier Lig',
  ES1: 'La Liga',
  L1: 'Bundesliga',
  IT1: 'Serie A',
  FR1: 'Ligue 1',
  TR1: 'Süper Lig',
  NL1: 'Eredivisie',
  PO1: 'Primeira Liga',
};

const LEAGUE_DISPLAY_TR_BY_NAME: Readonly<Record<string, string>> = {
  'Premier League': 'Premier Lig',
  LaLiga: 'La Liga',
  'La Liga': 'La Liga',
  Bundesliga: 'Bundesliga',
  'Serie A': 'Serie A',
  'Ligue 1': 'Ligue 1',
  'Süper Lig': 'Süper Lig',
  'Super Lig': 'Süper Lig',
  Eredivisie: 'Eredivisie',
  'Primeira Liga': 'Primeira Liga',
  'Liga Portugal': 'Primeira Liga',
};

function normalizeNationalityKey(value: string): string {
  const withoutDiacritics = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  return withoutDiacritics
    .trim()
    .replace(/[''`´]/g, ' ')
    .replace(/^THE\s+/i, '')
    .replace(/\s*,\s*/g, ' ')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveNationalityKey(value: string): string {
  const normalized = normalizeNationalityKey(value);
  return NATIONALITY_KEY_ALIASES[normalized] ?? normalized;
}

/** Position code → Turkish label (common Turkish football abbreviations). */
const POSITION_DISPLAY_TR: Readonly<Record<string, string>> = {
  GK: 'KL',
  LB: 'SLB',
  CB: 'STP',
  RB: 'SGB',
  LWB: 'SLB',
  RWB: 'SGB',
  DM: 'DOS',
  CDM: 'DOS',
  CM: 'OS',
  AM: 'OOS',
  CAM: 'OOS',
  LM: 'SLK',
  LW: 'SLK',
  RM: 'SGK',
  RW: 'SGK',
  CF: 'SF',
  ST: 'SF',
  SS: 'SF',
};

const POSITION_DISPLAY_TR_LONG: Readonly<Record<string, string>> = {
  GK: 'Kaleci',
  LB: 'Sol Bek',
  CB: 'Stoper',
  RB: 'Sağ Bek',
  LWB: 'Sol Kanat Bek',
  RWB: 'Sağ Kanat Bek',
  DM: 'Defansif Orta Saha',
  CDM: 'Defansif Orta Saha',
  CM: 'Orta Saha',
  AM: 'Ofansif Orta Saha',
  CAM: 'Ofansif Orta Saha',
  LM: 'Sol Kanat',
  LW: 'Sol Kanat',
  RM: 'Sağ Kanat',
  RW: 'Sağ Kanat',
  CF: 'Santrafor',
  ST: 'Santrafor',
  SS: 'Santrafor',
};

export function translateTeamName(
  name: string | null | undefined,
  externalId?: string | null,
): string {
  if (!name?.trim()) {
    return '';
  }

  if (externalId && TEAM_DISPLAY_TR_BY_EXTERNAL_ID[externalId]) {
    return TEAM_DISPLAY_TR_BY_EXTERNAL_ID[externalId];
  }

  return name.trim();
}

export function translateLeagueName(
  name: string | null | undefined,
  externalId?: string | null,
): string {
  if (!name?.trim()) {
    return '';
  }

  if (externalId && LEAGUE_DISPLAY_TR_BY_EXTERNAL_ID[externalId]) {
    return LEAGUE_DISPLAY_TR_BY_EXTERNAL_ID[externalId];
  }

  const byName = LEAGUE_DISPLAY_TR_BY_NAME[name.trim()];
  if (byName) {
    return byName;
  }

  return name.trim();
}

export function translateNationality(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }

  const trimmed = value.trim();

  const lookupKeys = [
    trimmed.toUpperCase(),
    resolveNationalityKey(trimmed),
    normalizeNationalityKey(trimmed),
  ];

  for (const key of lookupKeys) {
    const translated = NATIONALITY_DISPLAY_TR[key];
    if (translated !== undefined) {
      return translated;
    }
  }

  return trimmed;
}

/** Returns provider nationality labels that still have no Turkish mapping. */
export function findUntranslatedNationalities(values: readonly string[]): readonly string[] {
  const untranslated: string[] = [];

  for (const value of values) {
    if (!value.trim()) {
      continue;
    }

    if (translateNationality(value) === value.trim()) {
      untranslated.push(value.trim());
    }
  }

  return untranslated;
}

const COACH_ROLE_DISPLAY_TR: Readonly<Record<string, string>> = {
  MANAGER: 'Teknik Direktör',
  'HEAD COACH': 'Teknik Direktör',
  CHEFTRAINER: 'Teknik Direktör',
};

export function translateCoachRole(role: string | null | undefined): string {
  if (!role?.trim()) {
    return '';
  }

  const translated = COACH_ROLE_DISPLAY_TR[role.trim().toUpperCase()];
  return translated ?? role.trim();
}

export function translatePositionCode(
  code: string | null | undefined,
  options?: { long?: boolean },
): string {
  if (!code?.trim()) {
    return '';
  }

  const key = code.trim().toUpperCase();
  const map = options?.long ? POSITION_DISPLAY_TR_LONG : POSITION_DISPLAY_TR;
  return map[key] ?? code.trim();
}
