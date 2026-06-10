import { describe, expect, it } from 'vitest';

import {
  formatCardNameForDisplay,
  formatCardNameLines,
  formatCardNameSingleLine,
} from './format-card-name';

describe('formatCardNameLines', () => {
  it('splits first and last segments', () => {
    expect(formatCardNameLines("N'Golo Kanté")).toEqual({
      firstLine: "N'Golo",
      secondLine: 'Kanté',
    });
  });

  it('uses single token as surname line', () => {
    expect(formatCardNameLines('Haaland')).toEqual({
      firstLine: '',
      secondLine: 'Haaland',
    });
  });
});

describe('formatCardNameSingleLine', () => {
  it('trims whitespace', () => {
    expect(formatCardNameSingleLine('  Haaland  ')).toBe('Haaland');
  });
});

describe('formatCardNameForDisplay', () => {
  it('prefers single line for short names', () => {
    expect(formatCardNameForDisplay('Kevin De Bruyne')).toEqual({
      mode: 'single',
      singleLine: 'Kevin De Bruyne',
      lines: { firstLine: 'Kevin De', secondLine: 'Bruyne' },
    });
  });

  it('splits very long names', () => {
    const result = formatCardNameForDisplay('Christopher Very Long Surname Name');
    expect(result.mode).toBe('split');
  });
});
