import { describe, expect, it } from 'vitest';

import {
  translateLeagueName,
  translateNationality,
  translatePositionCode,
  translateTeamName,
} from './tr-football-display';

describe('tr-football-display', () => {
  it('translates teams by external id', () => {
    expect(translateTeamName('Besiktas JK', '114')).toBe('Beşiktaş');
    expect(translateTeamName('Bayern Munich', '27')).toBe('Bayern Münih');
  });

  it('falls back to original team name without mapping', () => {
    expect(translateTeamName('Manchester City', null)).toBe('Manchester City');
  });

  it('translates leagues by external id and name', () => {
    expect(translateLeagueName('Premier League', 'GB1')).toBe('Premier Lig');
    expect(translateLeagueName('Premier League', null)).toBe('Premier Lig');
    expect(translateLeagueName('Süper Lig', 'TR1')).toBe('Süper Lig');
  });

  it('translates nationalities', () => {
    expect(translateNationality('ENGLAND')).toBe('İngiltere');
    expect(translateNationality('england')).toBe('İngiltere');
    expect(translateNationality('TURKEY')).toBe('Türkiye');
    expect(translateNationality("COTE D'IVOIRE")).toBe('Fildişi Sahili');
  });

  it('translates position codes', () => {
    expect(translatePositionCode('GK')).toBe('KL');
    expect(translatePositionCode('ST')).toBe('SF');
    expect(translatePositionCode('CB', { long: true })).toBe('Stoper');
  });
});
