import { ALL_POSITION_CODES, type PositionCode } from '../domain/value-objects/position.vo';

const TRANSFERMARKT_POSITION_MAP: Readonly<Record<string, PositionCode>> = {
  GOALKEEPER: 'GK',
  'CENTRE-BACK': 'CB',
  'CENTER-BACK': 'CB',
  'LEFT-BACK': 'LB',
  'RIGHT-BACK': 'RB',
  'LEFT WING-BACK': 'LWB',
  'RIGHT WING-BACK': 'RWB',
  'DEFENSIVE MIDFIELD': 'CDM',
  'DEFENSIVE MIDFIELDER': 'CDM',
  'CENTRAL MIDFIELD': 'CM',
  'CENTRAL MIDFIELDER': 'CM',
  'ATTACKING MIDFIELD': 'CAM',
  'ATTACKING MIDFIELDER': 'CAM',
  'LEFT MIDFIELD': 'LM',
  'LEFT MIDFIELDER': 'LM',
  'RIGHT MIDFIELD': 'RM',
  'RIGHT MIDFIELDER': 'RM',
  'LEFT WINGER': 'LW',
  'RIGHT WINGER': 'RW',
  'CENTRE-FORWARD': 'ST',
  'CENTER-FORWARD': 'ST',
  'SECOND STRIKER': 'CF',
  MIDFIELD: 'CM',
  MIDFIELDER: 'CM',
  DEFENDER: 'CB',
  FORWARD: 'ST',
  STRIKER: 'ST',
  WINGER: 'RW',
};

const DEFAULT_UNKNOWN_POSITION: PositionCode = 'CM';

/**
 * Maps provider-specific position labels into supported PositionCode values.
 * Returns null only when input is empty.
 */
export function normalizeExternalPositionCode(
  raw: string,
  fallback: PositionCode = DEFAULT_UNKNOWN_POSITION,
): PositionCode | null {
  const normalized = raw.trim().toUpperCase();

  if (normalized.length === 0) {
    return null;
  }

  if (ALL_POSITION_CODES.includes(normalized as PositionCode)) {
    return normalized as PositionCode;
  }

  const exact = TRANSFERMARKT_POSITION_MAP[normalized];
  if (exact !== undefined) {
    return exact;
  }

  const heuristic = resolveByKeywords(normalized);
  if (heuristic !== null) {
    return heuristic;
  }

  return fallback;
}

function resolveByKeywords(normalized: string): PositionCode | null {
  if (normalized.includes('GOALKEEP') || normalized === 'KEEPER') {
    return 'GK';
  }

  if (normalized.includes('WING') && normalized.includes('BACK')) {
    if (normalized.includes('LEFT')) {
      return 'LWB';
    }
    if (normalized.includes('RIGHT') || normalized.startsWith('RIGH')) {
      return 'RWB';
    }
  }

  if (normalized.includes('BACK')) {
    if (normalized.includes('LEFT')) {
      return 'LB';
    }
    if (normalized.includes('RIGHT') || normalized.startsWith('RIGH')) {
      return 'RB';
    }
    return 'CB';
  }

  if (normalized.includes('WINGER')) {
    if (normalized.includes('LEFT')) {
      return 'LW';
    }
    if (normalized.includes('RIGHT') || normalized.startsWith('RIGH')) {
      return 'RW';
    }
  }

  if (normalized.includes('DEFENSIVE') && normalized.includes('MID')) {
    return 'CDM';
  }

  if (normalized.includes('ATTACKING') && normalized.includes('MID')) {
    return 'CAM';
  }

  if (normalized.includes('CENTRAL') && normalized.includes('MID')) {
    return 'CM';
  }

  if (normalized.includes('MID')) {
    if (normalized.includes('LEFT') || normalized === 'LEFT') {
      return 'LM';
    }
    if (normalized.includes('RIGHT') || normalized.startsWith('RIGH')) {
      return 'RM';
    }
    return 'CM';
  }

  if (normalized.includes('STRIKER') || normalized.includes('FORWARD')) {
    if (normalized.includes('SECOND')) {
      return 'CF';
    }
    return 'ST';
  }

  if (normalized === 'LEFT') {
    return 'LM';
  }

  if (normalized === 'RIGHT' || normalized === 'RIGH') {
    return 'RM';
  }

  if (normalized.startsWith('LEFT')) {
    return 'LM';
  }

  if (normalized.startsWith('RIGHT') || normalized.startsWith('RIGH')) {
    return 'RM';
  }

  return null;
}
